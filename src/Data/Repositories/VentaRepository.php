<?php
namespace App\Data\Repositories;

use PDO;
use App\Domain\Models\Venta;

class VentaRepository {
    private $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function save(Venta $venta) {
        $stmt = $this->db->prepare("INSERT INTO ventas (id_usuario, id_caja, total, descuento_total, cae, cae_vence, nro_factura, punto_venta, tipo_factura, medio_pago) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $venta->id_usuario,
            $venta->id_caja,
            $venta->total,
            $venta->descuento_total,
            $venta->cae,
            $venta->cae_vence,
            $venta->nro_factura,
            $venta->punto_venta,
            $venta->tipo_factura,
            $venta->medio_pago
        ]);
        return $this->db->lastInsertId();
    }

    public function updateAfipData($id_venta, $data) {
        $stmt = $this->db->prepare("UPDATE ventas SET cae = ?, cae_vence = ?, nro_factura = ?, punto_venta = ?, tipo_factura = ? WHERE id_venta = ?");
        $stmt->execute([
            $data['cae'],
            $data['cae_vence'],
            $data['nro_factura'],
            $data['punto_venta'],
            $data['tipo_factura'],
            $id_venta
        ]);
    }

    public function saveDetalle($id_venta, $detalle) {
        $stmt = $this->db->prepare("INSERT INTO detalle_ventas (id_venta, id_producto, id_presentacion, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $id_venta,
            $detalle->id_producto,
            $detalle->id_presentacion ?? null,
            $detalle->cantidad,
            $detalle->precio_unitario,
            $detalle->subtotal
        ]);
    }
}
