<?php
// public/api/caja.php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../src/autoload.php';

session_start();

use App\Application\Services\CajaService;
use App\Data\Repositories\CajaRepository;

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    die(json_encode(['success' => false, 'error' => 'No autorizado']));
}

$db = Database::getInstance();
$repo = new CajaRepository($db);
$service = new CajaService($repo);

// Validación de permiso de caja
if ($_SESSION['user_rol'] !== 'administrador' && strpos($_SESSION['user_rol'], 'vendedor') === false) {
    // Si el rol no contiene 'vendedor' ni es 'administrador'
    die(json_encode(['success' => false, 'error' => 'No tienes permiso para operar la caja (Acceso limitado)']));
}

$action = $_GET['action'] ?? '';

if ($action === 'abrir') {
    $data = json_decode(file_get_contents('php://input'), true);
    try {
        $id_caja = $service->abrirCaja($_SESSION['user_id'], $data['monto']);
        echo json_encode(['success' => true, 'id_caja' => $id_caja]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} elseif ($action === 'resumen') {
    try {
        $resumen = $service->obtenerResumenCierre($_SESSION['user_id']);
        echo json_encode(['success' => true, 'resumen' => $resumen]);
    } catch (Exception $e) {
        // Si no hay caja, devolvemos success false pero con un código específico si se requiere
        echo json_encode(['success' => false, 'error' => $e->getMessage(), 'no_caja' => true]);
    }
} elseif ($action === 'cerrar') {
    $data = json_decode(file_get_contents('php://input'), true);
    try {
        $resultado = $service->cerrarCaja($_SESSION['user_id'], $data['efectivo_real']);
        echo json_encode(['success' => true, 'resultado' => $resultado]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}
