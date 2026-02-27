<?php
// public/api/productos.php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../src/autoload.php';

session_start();
use App\Data\Repositories\ProductoRepository;
use App\Domain\Models\Producto;

header('Content-Type: application/json');

$db = Database::getInstance();
$repo = new ProductoRepository($db);

$action = $_GET['action'] ?? '';

if ($action === 'search') {
    $q = $_GET['q'] ?? '';
    $stmt = $db->prepare("SELECT * FROM productos WHERE nombre LIKE ? OR id_producto = ? OR codigo_barras = ? LIMIT 1");
    $stmt->execute(["%$q%", $q, $q]);
    $product = $stmt->fetch();
    if ($product) {
        $stmtPres = $db->prepare("SELECT * FROM presentaciones WHERE id_producto = ?");
        $stmtPres->execute([$product['id_producto']]);
        $product['presentaciones'] = $stmtPres->fetchAll();
    }
    echo json_encode($product);
} elseif ($action === 'list') {
    $stmt = $db->query("SELECT p.*, s.cantidad_actual, c.nombre as categoria_nombre FROM productos p 
                        LEFT JOIN stock s ON p.id_producto = s.id_producto 
                        LEFT JOIN categorias c ON p.id_categoria = c.id_categoria");
    $products = $stmt->fetchAll();
    echo json_encode($products);
} elseif ($action === 'categories') {
    $stmt = $db->query("SELECT * FROM categorias");
    $categories = $stmt->fetchAll();
    echo json_encode($categories);
} elseif ($action === 'save') {
    if ($_SESSION['user_rol'] !== 'administrador') die(json_encode(['success' => false, 'error' => 'No autorizado']));
    $data = json_decode(file_get_contents('php://input'), true);
    
    $producto = new Producto(null, $data['nombre'], $data['precio_kg'], $data['precio_unidad']);
    $producto->id_categoria = $data['id_categoria'];
    $producto->codigo_barras = $data['codigo_barras'];
    
    try {
        $repo->save($producto);
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} elseif ($action === 'update') {
    if ($_SESSION['user_rol'] !== 'administrador') die(json_encode(['success' => false, 'error' => 'No autorizado']));
    $data = json_decode(file_get_contents('php://input'), true);
    
    $producto = new Producto($data['id_producto'], $data['nombre'], $data['precio_kg'], $data['precio_unidad']);
    $producto->id_categoria = $data['id_categoria'];
    $producto->codigo_barras = $data['codigo_barras'];
    
    try {
        $repo->update($producto);
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} elseif ($action === 'saveCategory') {
    if ($_SESSION['user_rol'] !== 'administrador') die(json_encode(['success' => false, 'error' => 'No autorizado']));
    $data = json_decode(file_get_contents('php://input'), true);
    
    try {
        $stmt = $db->prepare("INSERT INTO categorias (nombre) VALUES (?)");
        $stmt->execute([$data['nombre']]);
        echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} elseif ($action === 'updateCategory') {
    if ($_SESSION['user_rol'] !== 'administrador') die(json_encode(['success' => false, 'error' => 'No autorizado']));
    $data = json_decode(file_get_contents('php://input'), true);
    
    try {
        $stmt = $db->prepare("UPDATE categorias SET nombre = ? WHERE id_categoria = ?");
        $stmt->execute([$data['nombre'], $data['id_categoria']]);
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}
