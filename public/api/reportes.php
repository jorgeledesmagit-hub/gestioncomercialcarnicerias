<?php
// public/api/reportes.php
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

try {
    session_start();
    require_once __DIR__ . '/../../config/database.php';
    require_once __DIR__ . '/../../src/autoload.php';

    if (!isset($_SESSION['user_id']) || $_SESSION['user_rol'] !== 'administrador') {
        ob_clean();
        header('Content-Type: application/json');
        die(json_encode(['success' => false, 'error' => 'No autorizado']));
    }

    $db = Database::getInstance();
    $action = $_GET['action'] ?? '';
    $month = $_GET['month'] ?? date('m');
    $year = $_GET['year'] ?? date('Y');
    $result = null;

    if ($action === 'daily') {
        $stmt = $db->query("SELECT SUM(total) as total FROM ventas WHERE DATE(fecha) = CURDATE()");
        $data = $stmt->fetch();
        $result = ['total' => $data['total'] ?? 0];
    } elseif ($action === 'monthly') {
        $stmt = $db->prepare("SELECT SUM(total) as total FROM ventas WHERE MONTH(fecha) = ? AND YEAR(fecha) = ?");
        $stmt->execute([$month, $year]);
        $data = $stmt->fetch();
        $result = ['total' => $data['total'] ?? 0];
    } elseif ($action === 'popular') {
        $stmt = $db->prepare("SELECT p.nombre, SUM(dv.cantidad) as cantidad_total, SUM(dv.subtotal) as monto_total 
                            FROM detalle_ventas dv 
                            JOIN ventas v ON dv.id_venta = v.id_venta
                            JOIN productos p ON dv.id_producto = p.id_producto 
                            WHERE MONTH(v.fecha) = ? AND YEAR(v.fecha) = ?
                            GROUP BY dv.id_producto, p.nombre 
                            ORDER BY cantidad_total DESC 
                            LIMIT 10");
        $stmt->execute([$month, $year]);
        $result = $stmt->fetchAll();
    } elseif ($action === 'stock') {
        $stmt = $db->query("SELECT p.nombre, s.cantidad_actual 
                            FROM productos p 
                            JOIN stock s ON p.id_producto = s.id_producto 
                            WHERE s.cantidad_actual < 10 
                            ORDER BY s.cantidad_actual ASC");
        $result = $stmt->fetchAll();
    } elseif ($action === 'list') {
        $stmt = $db->prepare("SELECT v.*, u.nombre as vendedor 
                            FROM ventas v 
                            JOIN usuarios u ON v.id_usuario = u.id_usuario 
                            WHERE MONTH(v.fecha) = ? AND YEAR(v.fecha) = ?
                            ORDER BY v.fecha DESC");
        $stmt->execute([$month, $year]);
        $result = $stmt->fetchAll();
    } elseif ($action === 'sellers') {
        $stmt = $db->prepare("SELECT u.nombre, COUNT(v.id_venta) as cant_ventas, SUM(v.total) as total_ventas 
                            FROM usuarios u 
                            LEFT JOIN ventas v ON u.id_usuario = v.id_usuario AND MONTH(v.fecha) = ? AND YEAR(v.fecha) = ?
                            GROUP BY u.id_usuario, u.nombre
                            HAVING cant_ventas > 0");
        $stmt->execute([$month, $year]);
        $result = $stmt->fetchAll();
    } else {
        throw new Exception("Acción no definida: $action");
    }

    ob_clean();
    header('Content-Type: application/json');
    echo json_encode($result);

} catch (Throwable $e) {
    ob_clean();
    header('Content-Type: application/json', true, 500);
    echo json_encode([
        'success' => false, 
        'error' => $e->getMessage(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine()
    ]);
}
