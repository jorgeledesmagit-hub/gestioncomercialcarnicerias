<?php
namespace App\Domain\Models;

class Venta {
    public $id_venta;
    public $id_usuario;
    public $id_caja;
    public $fecha;
    public $total;
    public $cae;
    public $cae_vence;
    public $nro_factura;
    public $punto_venta;
    public $tipo_factura;
    public $medio_pago;

    public function __construct($id_usuario = null, $id_caja = null, $total = 0, $descuento = 0) {
        $this->id_usuario = $id_usuario;
        $this->id_caja = $id_caja;
        $this->total = $total;
        $this->descuento_total = $descuento;
    }
}
