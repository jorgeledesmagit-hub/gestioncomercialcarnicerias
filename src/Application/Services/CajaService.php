<?php
namespace App\Application\Services;

use App\Data\Repositories\CajaRepository;
use App\Domain\Models\Caja;
use Exception;

class CajaService {
    private $cajaRepo;

    public function __construct(CajaRepository $cajaRepo) {
        $this->cajaRepo = $cajaRepo;
    }

    public function abrirCaja($id_usuario, $monto_inicial) {
        $monto_inicial = (float)($monto_inicial ?: 0);
        $cajaActiva = $this->cajaRepo->getActiveCajaByUsuario($id_usuario);
        if ($cajaActiva) {
            throw new Exception("Ya tienes una caja abierta.");
        }

        $caja = new Caja($id_usuario, $monto_inicial);
        return $this->cajaRepo->abrirCaja($caja);
    }

    public function obtenerResumenCierre($id_usuario) {
        $caja = $this->cajaRepo->getActiveCajaByUsuario($id_usuario);
        if (!$caja) throw new Exception("No hay una caja abierta para este usuario.");

        $ventas = $this->cajaRepo->getResumenVentas($caja['id_caja']);
        $resumen = [
            'id_caja' => $caja['id_caja'],
            'monto_inicial' => $caja['monto_inicial'],
            'fecha_apertura' => $caja['fecha_apertura'],
            'ventas_por_medio' => $ventas,
            'total_ventas' => 0,
            'efectivo_esperado' => (float)$caja['monto_inicial']
        ];

        foreach ($ventas as $v) {
            $resumen['total_ventas'] += $v['total'];
            if ($v['medio_pago'] === 'efectivo') {
                $resumen['efectivo_esperado'] += $v['total'];
            }
        }

        return $resumen;
    }

    public function cerrarCaja($id_usuario, $efectivo_real) {
        $resumen = $this->obtenerResumenCierre($id_usuario);
        $diferencia = $efectivo_real - $resumen['efectivo_esperado'];
        
        $this->cajaRepo->cerrarCaja($resumen['id_caja'], $efectivo_real, $diferencia);
        return [
            'efectivo_esperado' => $resumen['efectivo_esperado'],
            'diferencia' => $diferencia
        ];
    }
}
