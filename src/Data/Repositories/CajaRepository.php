<?php
namespace App\Data\Repositories;

use PDO;
use App\Domain\Models\Caja;

class CajaRepository {
    private $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function getActiveCajaByUsuario($id_usuario) {
        $stmt = $this->db->prepare("SELECT * FROM cajas WHERE id_usuario = ? AND fecha_cierre IS NULL LIMIT 1");
        $stmt->execute([$id_usuario]);
        return $stmt->fetch();
    }

    public function abrirCaja(Caja $caja) {
        $stmt = $this->db->prepare("INSERT INTO cajas (id_usuario, fecha_apertura, monto_inicial) VALUES (?, ?, ?)");
        $stmt->execute([$caja->id_usuario, $caja->fecha_apertura, $caja->monto_inicial]);
        return $this->db->lastInsertId();
    }

    public function cerrarCaja($id_caja, $efectivo_real, $diferencia) {
        $stmt = $this->db->prepare("UPDATE cajas SET fecha_cierre = NOW(), efectivo_real = ?, diferencia = ? WHERE id_caja = ?");
        $stmt->execute([$efectivo_real, $diferencia, $id_caja]);
    }

    public function getResumenVentas($id_caja) {
        $stmt = $this->db->prepare("SELECT medio_pago, SUM(total) as total FROM ventas WHERE id_caja = ? GROUP BY medio_pago");
        $stmt->execute([$id_caja]);
        return $stmt->fetchAll();
    }
}
