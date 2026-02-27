<?php
// public/api/stock.php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../src/autoload.php';

session_start();
use App\Data\Repositories\StockRepository;

header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['user_rol'] !== 'administrador') {
    die(json_encode(['success' => false, 'error' => 'Acceso denegado: Solo administradores pueden gestionar stock.']));
}

$db = Database::getInstance();
$repo = new StockRepository($db);

$action = $_GET['action'] ?? '';

if ($action === 'update') {
    $data = json_decode(file_get_contents('php://input'), true);
    $tipo = $data['tipo'] === 'ingreso' ? 'sumar' : 'restar';
    
    try {
        $motivo = $data['motivo'] ?? ($data['tipo'] === 'ingreso' ? 'Ingreso de mercadería' : 'Ajuste manual');
        $repo->actualizarStock($data['id_producto'], $data['cantidad'], $tipo);
        $repo->registrarMovimiento($data['id_producto'], $_SESSION['user_id'], $data['cantidad'], $data['tipo'], $motivo);
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}
