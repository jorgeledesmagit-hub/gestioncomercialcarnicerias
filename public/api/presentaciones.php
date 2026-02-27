<?php
// public/api/presentaciones.php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../src/autoload.php';

session_start();

use App\Data\Repositories\PresentacionRepository;
use App\Domain\Models\Presentacion;

header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['user_rol'] !== 'administrador') {
    die(json_encode(['success' => false, 'error' => 'No autorizado']));
}

$db = Database::getInstance();
$repo = new PresentacionRepository($db);

$action = $_GET['action'] ?? '';

if ($action === 'list') {
    $id_producto = $_GET['id_producto'] ?? 0;
    $list = $repo->getByProducto($id_producto);
    echo json_encode($list);

} elseif ($action === 'save') {
    $data = json_decode(file_get_contents('php://input'), true);
    $p = new Presentacion(
        $data['id_presentacion'] ?? null,
        $data['id_producto'],
        $data['nombre'],
        $data['factor_stock'],
        $data['precio']
    );
    $id = $repo->save($p);
    echo json_encode(['success' => true, 'id' => $id]);

} elseif ($action === 'delete') {
    $id = $_GET['id'] ?? 0;
    $success = $repo->delete($id);
    echo json_encode(['success' => $success]);
}
