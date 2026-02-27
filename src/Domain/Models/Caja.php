<?php
namespace App\Domain\Models;

class Caja {
    public $id_caja;
    public $id_usuario;
    public $fecha_apertura;
    public $monto_inicial;
    public $fecha_cierre;
    public $efectivo_real;
    public $diferencia;

    public function __construct($id_usuario = null, $monto_inicial = 0) {
        $this->id_usuario = $id_usuario;
        $this->monto_inicial = $monto_inicial;
        $this->fecha_apertura = date('Y-m-d H:i:s');
    }
}
