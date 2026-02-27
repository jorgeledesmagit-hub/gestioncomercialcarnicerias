<?php
// public/api/auth.php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../src/autoload.php';

session_start();

use App\Application\Services\AuthService;
use App\Data\Repositories\UsuarioRepository;

header('Content-Type: application/json');

$db = Database::getInstance();
$userRepo = new UsuarioRepository($db);
$authService = new AuthService($userRepo);

$action = $_GET['action'] ?? '';

if ($action === 'login') {
    $data = json_decode(file_get_contents('php://input'), true);
    try {
        $user = $authService->login($data['username'], $data['password']);
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} elseif ($action === 'logout') {
    $authService->logout();
    echo json_encode(['success' => true]);
}
