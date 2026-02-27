<?php
namespace App\Domain\Models;

class Producto {
    public $id_producto;
    public $nombre;
    public $id_categoria;
    public $precio_kg;
    public $precio_unidad;
    public $codigo_barras;
    public $presentaciones = [];

    public function __construct($id = null, $nombre = '', $precio_kg = 0, $precio_unidad = 0) {
        $this->id_producto = $id;
        $this->nombre = $nombre;
        $this->precio_kg = $precio_kg;
        $this->precio_unidad = $precio_unidad;
    }
}
