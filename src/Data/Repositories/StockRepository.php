<?php
namespace App\Data\Repositories;

use PDO;

class StockRepository {
    private $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function actualizarStock($id_producto, $cantidad, $operacion = 'restar') {
        $signo = ($operacion == 'restar') ? '-' : '+';
        $stmt = $this->db->prepare("UPDATE stock SET cantidad_actual = cantidad_actual $signo ? WHERE id_producto = ?");
        $stmt->execute([$cantidad, $id_producto]);
    }

    public function registrarMovimiento($id_producto, $id_usuario, $cantidad, $tipo, $motivo = '') {
        $stmt = $this->db->prepare("INSERT INTO movimientos_stock (id_producto, id_usuario, cantidad, tipo, motivo) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$id_producto, $id_usuario, $cantidad, $tipo, $motivo]);
    }
}
