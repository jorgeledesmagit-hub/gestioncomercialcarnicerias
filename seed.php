<?php
// seed.php
require_once __DIR__ . '/config/database.php';

$db = Database::getInstance();

try {
    // 1. Usuarios
    $pass = password_hash('admin123', PASSWORD_DEFAULT);
    $db->prepare("INSERT IGNORE INTO usuarios (nombre, usuario, password, rol) VALUES (?, ?, ?, ?)")
       ->execute(['Administrador', 'admin', 'admin123', 'administrador']); // Flat for tests as per AuthService

    $db->prepare("INSERT IGNORE INTO usuarios (nombre, usuario, password, rol) VALUES (?, ?, ?, ?)")
       ->execute(['Vendedor 1', 'vendedor1', '1234', 'vendedor1']);

    $db->prepare("INSERT IGNORE INTO usuarios (nombre, usuario, password, rol) VALUES (?, ?, ?, ?)")
       ->execute(['Vendedor 2', 'vendedor2', '4321', 'vendedor2']);

    // 2. Categorías
    $db->exec("INSERT IGNORE INTO categorias (id_categoria, nombre) VALUES (1, 'Carne Vacuna'), (2, 'Pollo'), (3, 'Cerdo'), (4, 'Embutidos')");

    // 3. Productos (con id_producto y precio)
    $db->exec("INSERT IGNORE INTO productos (id_producto, nombre, id_categoria, precio_kg, precio_unidad) VALUES 
        (1, 'Asado de Tira', 1, 8500.00, 0),
        (2, 'Vacio', 1, 9500.00, 0),
        (3, 'Pollo Entero', 2, 0, 3500.00),
        (4, 'Chorizo Bombón', 4, 4500.00, 0),
        (5, 'Pechuga de Pollo', 2, 5500.00, 0)");

    // 4. Stock inicial
    $db->exec("INSERT IGNORE INTO stock (id_producto, cantidad_actual) VALUES 
        (1, 50.000), (2, 40.000), (3, 20.000), (4, 30.000), (5, 25.000)");

    // 5. Medios de pago
    $db->exec("INSERT IGNORE INTO medios_pago (id_medio_pago, nombre) VALUES (1, 'Efectivo'), (2, 'Débito'), (3, 'Crédito'), (4, 'QR')");

    echo "Base de datos poblada exitosamente.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
