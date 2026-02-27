<?php
// migrate_presentaciones.php
require_once __DIR__ . '/config/database.php';

try {
    $db = Database::getInstance();

    // 1. Crear tabla presentaciones
    $db->exec("CREATE TABLE IF NOT EXISTS presentaciones (
        id_presentacion INT AUTO_INCREMENT PRIMARY KEY,
        id_producto INT NOT NULL,
        nombre VARCHAR(50) NOT NULL,
        factor_stock DECIMAL(10,3) NOT NULL DEFAULT 1.000,
        precio DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // 2. Añadir id_presentacion a detalle_ventas
    // Primero verificamos si existe
    $res = $db->query("SHOW COLUMNS FROM detalle_ventas LIKE 'id_presentacion'");
    if ($res->rowCount() == 0) {
        $db->exec("ALTER TABLE detalle_ventas ADD COLUMN id_presentacion INT NULL AFTER id_producto;");
        $db->exec("ALTER TABLE detalle_ventas ADD CONSTRAINT fk_detalle_presentacion FOREIGN KEY (id_presentacion) REFERENCES presentaciones(id_presentacion);");
    }

    echo "Migración completada con éxito.\n";

} catch (Exception $e) {
    echo "Error en migración: " . $e->getMessage() . "\n";
}
