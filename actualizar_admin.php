<?php
// Script para actualizar la contraseña del administrador
require_once __DIR__ . '/config/database.php';

$db = Database::getInstance();

try {
    // Nueva contraseña
    $nuevaPassword = 'Admin@123';
    
    // Hasheamos la contraseña para almacenarla de forma segura
    $passwordHash = password_hash($nuevaPassword, PASSWORD_DEFAULT);
    
    // Actualizar la contraseña del usuario admin
    $stmt = $db->prepare("UPDATE usuarios SET password = ? WHERE usuario = 'admin'");
    $result = $stmt->execute([$passwordHash]);
    
    if ($result) {
        echo "Contraseña del administrador actualizada correctamente.\n";
        echo "Usuario: admin\n";
        echo "Nueva contraseña: Admin@123\n";
        
        // Verificar que se actualizó
        $stmt = $db->prepare("SELECT id_usuario, nombre, usuario, password FROM usuarios WHERE usuario = 'admin'");
        $stmt->execute();
        $user = $stmt->fetch();
        
        if ($user) {
            echo "\nVerificación:\n";
            echo "- ID: " . $user['id_usuario'] . "\n";
            echo "- Nombre: " . $user['nombre'] . "\n";
            echo "- Usuario: " . $user['usuario'] . "\n";
            echo "- Password hasheado: " . substr($user['password'], 0, 30) . "...\n";
        }
    } else {
        echo "Error al actualizar la contraseña.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
