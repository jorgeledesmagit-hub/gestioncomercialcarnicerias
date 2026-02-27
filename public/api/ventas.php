<?php
// public/api/ventas.php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../src/autoload.php';

session_start();

use App\Application\Services\VentasService;
use App\Data\Repositories\VentaRepository;
use App\Data\Repositories\StockRepository;
use App\Data\Repositories\CajaRepository;

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    die(json_encode(['success' => false, 'error' => 'No autorizado']));
}

$db = Database::getInstance();
$ventaRepo = new VentaRepository($db);
$stockRepo = new StockRepository($db);
$cajaRepo = new CajaRepository($db);
$service = new VentasService($db, $ventaRepo, $stockRepo, $cajaRepo);

$action = $_GET['action'] ?? '';

if ($action === 'process') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Buscar caja activa para el usuario
    $caja = $cajaRepo->getActiveCajaByUsuario($_SESSION['user_id']);
    if (!$caja) {
        die(json_encode(['success' => false, 'error' => 'Debe abrir caja primero']));
    }

    try {
        $id_venta = $service->procesarVenta(
            $_SESSION['user_id'], 
            $caja['id_caja'], 
            $data['items'], 
            $data['discount'],
            $data['paymentMethod'],
            $data['solicitarAfip'] ?? false
        );
        echo json_encode(['success' => true, 'id_venta' => $id_venta]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} elseif ($action === 'get') {
    $id = $_GET['id'] ?? 0;
    
    $stmt = $db->prepare("SELECT * FROM ventas WHERE id_venta = ?");
    $stmt->execute([$id]);
    $venta = $stmt->fetch();
    
    if ($venta) {
        $stmt = $db->prepare("SELECT dv.*, p.nombre, pr.nombre as presentacion_nombre 
                            FROM detalle_ventas dv 
                            JOIN productos p ON dv.id_producto = p.id_producto 
                            LEFT JOIN presentaciones pr ON dv.id_presentacion = pr.id_presentacion
                            WHERE dv.id_venta = ?");
        $stmt->execute([$id]);
        $venta['items'] = $stmt->fetchAll();
        echo json_encode($venta);
    } else {
        echo json_encode(['success' => false, 'error' => 'Venta no encontrada']);
    }
} elseif ($action === 'paymentMethods') {
    $stmt = $db->query("SELECT * FROM medios_pago");
    $methods = $stmt->fetchAll();
    echo json_encode($methods);
}
