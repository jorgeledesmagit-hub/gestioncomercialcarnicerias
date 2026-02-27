<?php
// public/api/respaldo.php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../src/autoload.php';

session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['user_rol'] !== 'administrador') {
    die(json_encode(['success' => false, 'error' => 'No autorizado']));
}

$action = $_GET['action'] ?? '';
$backupDir = __DIR__ . '/../backups/';

if ($action === 'generate') {
    $filename = 'backup_' . date('Y-m-d_H-i-s') . '.sql';
    $filepath = $backupDir . $filename;
    
    // Configuración desde database.php
    $host = DB_HOST;
    $db = DB_NAME;
    $user = DB_USER;
    $pass = DB_PASS;
    
    // Comando mysqldump para XAMPP Mac
    $mysqldumpPath = '/Applications/XAMPP/xamppfiles/bin/mysqldump';
    
    // Si hay password, se incluye en el comando. Cuidado con el espacio después de -p
    $passArg = $pass ? "-p$pass" : "";
    $command = "$mysqldumpPath -h $host -u $user $passArg $db > \"$filepath\" 2>&1";
    
    exec($command, $output, $returnVar);

    if ($returnVar === 0 && file_exists($filepath)) {
        echo json_encode(['success' => true, 'filename' => $filename, 'size' => round(filesize($filepath) / 1024, 2) . ' KB']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Error al generar backup', 'details' => implode("\n", $output)]);
    }

} elseif ($action === 'list') {
    $files = glob($backupDir . '*.sql');
    $backups = [];
    foreach ($files as $file) {
        $backups[] = [
            'filename' => basename($file),
            'date' => date('Y-m-d H:i:s', filemtime($file)),
            'size' => round(filesize($file) / 1024, 2) . ' KB',
            'url' => 'backups/' . basename($file)
        ];
    }
    // Ordenar por fecha descendente
    usort($backups, function($a, $b) {
        return strtotime($b['date']) - strtotime($a['date']);
    });
    echo json_encode($backups);

} elseif ($action === 'delete') {
    $filename = $_GET['filename'] ?? '';
    if (!$filename || !file_exists($backupDir . $filename)) {
        die(json_encode(['success' => false, 'error' => 'Archivo no encontrado']));
    }
    
    if (unlink($backupDir . $filename)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'No se pudo eliminar el archivo']);
    }
}
