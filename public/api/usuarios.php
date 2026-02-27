<?php
// public/api/usuarios.php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../src/autoload.php';

session_start();
use App\Data\Repositories\UsuarioRepository;
use App\Domain\Models\Usuario;

header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['user_rol'] !== 'administrador') {
    error_log("Acceso de usuario no autorizado a la API de usuarios: " . ($_SESSION['user_id'] ?? 'invitado'));
    die(json_encode(['success' => false, 'error' => 'No autorizado: Solo administradores pueden gestionar usuarios.']));
}

error_log("API de Usuarios llamada action: " . ($_GET['action'] ?? 'ninguna'));

$db = Database::getInstance();
$repo = new UsuarioRepository($db);

$action = $_GET['action'] ?? '';

if ($action === 'list') {
    echo json_encode($repo->getAll());
} elseif ($action === 'save') {
    $data = json_decode(file_get_contents('php://input'), true);
    $u = new Usuario(null, $data['nombre'], $data['usuario'], $data['rol']);
    $u->password = $data['password'];
    $u->permiso_vender = $data['permiso_vender'] ? 1 : 0;
    $u->permiso_precios = $data['permiso_precios'] ? 1 : 0;
    $u->permiso_reportes = $data['permiso_reportes'] ? 1 : 0;
    
    try {
        $repo->save($u);
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} elseif ($action === 'update') {
    $data = json_decode(file_get_contents('php://input'), true);
    $u = new Usuario($data['id_usuario'], $data['nombre'], $data['usuario'], $data['rol']);
    $u->password = $data['password'] ?? '';
    $u->permiso_vender = $data['permiso_vender'] ? 1 : 0;
    $u->permiso_precios = $data['permiso_precios'] ? 1 : 0;
    $u->permiso_reportes = $data['permiso_reportes'] ? 1 : 0;

    try {
        $repo->update($u);
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} elseif ($action === 'delete') {
    $id = $_GET['id'] ?? null;
    try {
        $repo->delete($id);
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}
