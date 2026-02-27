<?php
namespace App\Domain\Models;

class Presentacion {
    public $id_presentacion;
    public $id_producto;
    public $nombre;
    public $factor_stock;
    public $precio;

    public function __construct($id = null, $id_producto = null, $nombre = '', $factor_stock = 1.0, $precio = 0) {
        $this->id_presentacion = $id;
        $this->id_producto = $id_producto;
        $this->nombre = $nombre;
        $this->factor_stock = $factor_stock;
        $this->precio = $precio;
    }
}
