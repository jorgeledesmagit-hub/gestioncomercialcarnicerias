<?php
namespace App\Domain\Models;

class DetalleVenta {
    public $id_detalle;
    public $id_venta;
    public $id_producto;
    public $id_presentacion;
    public $cantidad;
    public $precio_unitario;

    public function __construct($id_venta = null, $id_producto = null, $cantidad = 0, $precio = 0, $id_presentacion = null) {
        $this->id_venta = $id_venta;
        $this->id_producto = $id_producto;
        $this->id_presentacion = $id_presentacion;
        $this->cantidad = $cantidad;
        $this->precio_unitario = $precio;
        $this->subtotal = $cantidad * $precio;
    }
}
