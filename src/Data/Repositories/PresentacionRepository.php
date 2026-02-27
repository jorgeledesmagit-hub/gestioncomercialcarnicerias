<?php
namespace App\Data\Repositories;

use PDO;
use App\Domain\Models\Presentacion;

class PresentacionRepository {
    private $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function getByProducto($id_producto) {
        $stmt = $this->db->prepare("SELECT * FROM presentaciones WHERE id_producto = ?");
        $stmt->execute([$id_producto]);
        $data = $stmt->fetchAll();
        
        $presentaciones = [];
        foreach ($data as $item) {
            $presentaciones[] = new Presentacion(
                $item['id_presentacion'],
                $item['id_producto'],
                $item['nombre'],
                $item['factor_stock'],
                $item['precio']
            );
        }
        return $presentaciones;
    }

    public function save(Presentacion $p) {
        if ($p->id_presentacion) {
            $stmt = $this->db->prepare("UPDATE presentaciones SET nombre = ?, factor_stock = ?, precio = ? WHERE id_presentacion = ?");
            $stmt->execute([$p->nombre, $p->factor_stock, $p->precio, $p->id_presentacion]);
        } else {
            $stmt = $this->db->prepare("INSERT INTO presentaciones (id_producto, nombre, factor_stock, precio) VALUES (?, ?, ?, ?)");
            $stmt->execute([$p->id_producto, $p->nombre, $p->factor_stock, $p->precio]);
            $p->id_presentacion = $this->db->lastInsertId();
        }
        return $p->id_presentacion;
    }

    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM presentaciones WHERE id_presentacion = ?");
        return $stmt->execute([$id]);
    }
}
