<?php
namespace App\Application\Services;

use App\Data\Repositories\VentaRepository;
use App\Data\Repositories\StockRepository;
use App\Data\Repositories\CajaRepository;
use App\Domain\Models\Venta;
use App\Domain\Models\DetalleVenta;
use Exception;
use PDO;

class VentasService {
    private $db;
    private $ventaRepo;
    private $stockRepo;
    private $cajaRepo;

    public function __construct(PDO $db, VentaRepository $ventaRepo, StockRepository $stockRepo, CajaRepository $cajaRepo) {
        $this->db = $db;
        $this->ventaRepo = $ventaRepo;
        $this->stockRepo = $stockRepo;
        $this->cajaRepo = $cajaRepo;
    }

    public function procesarVenta($id_usuario, $id_caja, $items, $descuento_total = 0, $medio_pago = 'efectivo', $solicitar_afip = false) {
        $this->db->beginTransaction();
        try {
            $total = 0;
            foreach ($items as $item) {
                $total += $item['precio'] * $item['cantidad'];
            }
            $total_final = $total - $descuento_total;

            // 2. Guardar Venta
            $venta = new Venta($id_usuario, $id_caja, $total_final, $descuento_total);
            $venta->medio_pago = $medio_pago;

            // Simulación AFIP si se requiere
            if ($solicitar_afip) {
                $venta->cae = "74" . rand(10000000, 99999999);
                $venta->cae_vence = date('Y-m-d', strtotime('+10 days'));
                $venta->punto_venta = "00001";
                $venta->nro_factura = rand(1000, 9999);
                $venta->tipo_factura = "B"; // Simplificado
            }

            $id_venta = $this->ventaRepo->save($venta);

            foreach ($items as $item) {
                if (!isset($item['id_producto']) || empty($item['id_producto'])) {
                    throw new Exception("Error interno: El producto no tiene un ID válido asociado.");
                }
                
                // 3. Guardar Detalle
                $id_pres = $item['id_presentacion'] ?? null;
                $factor = $item['factor_stock'] ?? 1.0;
                
                $detalle = new DetalleVenta($id_venta, $item['id_producto'], $item['cantidad'], $item['precio'], $id_pres);
                $this->ventaRepo->saveDetalle($id_venta, $detalle);

                // 4. Descontar Stock (usando factor)
                $cantidadBase = $item['cantidad'] * $factor;
                $this->stockRepo->actualizarStock($item['id_producto'], $cantidadBase, 'restar');

                // 5. Registrar Movimiento (usando cantidad base)
                $this->stockRepo->registrarMovimiento($item['id_producto'], $id_usuario, $cantidadBase, 'venta', "Venta #$id_venta (" . ($item['presentacion_nombre'] ?? 'v. directa') . ")");
            }

            $this->db->commit();
            return $id_venta;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}
