<?php
namespace App\Data\Repositories;

use PDO;
use App\Domain\Models\Producto;

class ProductoRepository {
    private $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function getAll() {
        $stmt = $this->db->query("SELECT p.*, s.cantidad_actual FROM productos p LEFT JOIN stock s ON p.id_producto = s.id_producto");
        $data = $stmt->fetchAll();
        
        require_once __DIR__ . '/PresentacionRepository.php';
        $presRepo = new PresentacionRepository($this->db);
        
        foreach ($data as &$item) {
            $item['presentaciones'] = $presRepo->getByProducto($item['id_producto']);
        }
        return $data;
    }

    public function findByCodigo($codigo) {
        $stmt = $this->db->prepare("SELECT * FROM productos WHERE codigo_barras = ? OR id_producto = ?");
        $stmt->execute([$codigo, $codigo]);
        $data = $stmt->fetch();

        if (!$data) return null;

        $p = new Producto($data['id_producto'], $data['nombre'], $data['precio_kg'], $data['precio_unidad']);
        $p->codigo_barras = $data['codigo_barras'];
        
        require_once __DIR__ . '/PresentacionRepository.php';
        $presRepo = new PresentacionRepository($this->db);
        $p->presentaciones = $presRepo->getByProducto($p->id_producto);
        
        return $p;
    }

    public function getById($id) {
        $stmt = $this->db->prepare("SELECT * FROM productos WHERE id_producto = ?");
        $stmt->execute([$id]);
        $data = $stmt->fetch();

        if (!$data) return null;

        $p = new Producto($data['id_producto'], $data['nombre'], $data['precio_kg'], $data['precio_unidad']);
        $p->codigo_barras = $data['codigo_barras'];
        
        require_once __DIR__ . '/PresentacionRepository.php';
        $presRepo = new PresentacionRepository($this->db);
        $p->presentaciones = $presRepo->getByProducto($p->id_producto);
        
        return $p;
    }

    public function save(Producto $producto) {
        $stmt = $this->db->prepare("INSERT INTO productos (nombre, id_categoria, precio_kg, precio_unidad, codigo_barras) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $producto->nombre,
            $producto->id_categoria,
            $producto->precio_kg,
            $producto->precio_unidad,
            $producto->codigo_barras
        ]);
        $id = $this->db->lastInsertId();
        
        // Inicializar stock en 0 para el nuevo producto
        $this->db->prepare("INSERT INTO stock (id_producto, cantidad_actual) VALUES (?, 0)")->execute([$id]);
        
        return $id;
    }

    public function update(Producto $producto) {
        $stmt = $this->db->prepare("UPDATE productos SET nombre = ?, id_categoria = ?, precio_kg = ?, precio_unidad = ?, codigo_barras = ? WHERE id_producto = ?");
        $stmt->execute([
            $producto->nombre,
            $producto->id_categoria,
            $producto->precio_kg,
            $producto->precio_unidad,
            $producto->codigo_barras,
            $producto->id_producto
        ]);
    }
}
