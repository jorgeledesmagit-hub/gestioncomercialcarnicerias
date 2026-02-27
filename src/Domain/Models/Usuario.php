<?php
namespace App\Domain\Models;

class Usuario {
    public $id_usuario;
    public $nombre;
    public $usuario;
    public $password;
    public $rol;
    public $activo;
    public $permiso_vender;
    public $permiso_precios;
    public $permiso_reportes;

    public function __construct($id = null, $nombre = '', $usuario = '', $rol = 'empleado') {
        $this->id_usuario = $id;
        $this->nombre = $nombre;
        $this->usuario = $usuario;
        $this->rol = $rol;
        $this->permiso_vender = 1;
        $this->permiso_precios = 0;
        $this->permiso_reportes = 0;
    }
}
