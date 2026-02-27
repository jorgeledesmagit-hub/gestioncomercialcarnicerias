<?php
namespace App\Data\Repositories;

use PDO;
use App\Domain\Models\Usuario;

class UsuarioRepository {
    private $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function findByUsuario($username) {
        $stmt = $this->db->prepare("SELECT * FROM usuarios WHERE usuario = ? AND activo = 1");
        $stmt->execute([$username]);
        $data = $stmt->fetch();

        if (!$data) return null;

        $user = new Usuario($data['id_usuario'], $data['nombre'], $data['usuario'], $data['rol']);
        $user->password = $data['password'];
        $user->activo = $data['activo'];
        $user->permiso_vender = $data['permiso_vender'];
        $user->permiso_precios = $data['permiso_precios'];
        $user->permiso_reportes = $data['permiso_reportes'];
        return $user;
    }

    public function getAll() {
        $stmt = $this->db->query("SELECT * FROM usuarios WHERE activo = 1 ORDER BY id_usuario DESC");
        return $stmt->fetchAll();
    }

    public function getById($id) {
        $stmt = $this->db->prepare("SELECT * FROM usuarios WHERE id_usuario = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function save(Usuario $usuario) {
        $stmt = $this->db->prepare("INSERT INTO usuarios (nombre, usuario, password, rol, permiso_vender, permiso_precios, permiso_reportes) VALUES (?, ?, ?, ?, ?, ?, ?)");
        return $stmt->execute([
            $usuario->nombre,
            $usuario->usuario,
            password_hash($usuario->password, PASSWORD_DEFAULT),
            $usuario->rol,
            $usuario->permiso_vender,
            $usuario->permiso_precios,
            $usuario->permiso_reportes
        ]);
    }

    public function update(Usuario $usuario) {
        $sql = "UPDATE usuarios SET nombre = ?, usuario = ?, rol = ?, permiso_vender = ?, permiso_precios = ?, permiso_reportes = ?";
        $params = [
            $usuario->nombre,
            $usuario->usuario,
            $usuario->rol,
            $usuario->permiso_vender,
            $usuario->permiso_precios,
            $usuario->permiso_reportes
        ];

        if (!empty($usuario->password)) {
            $sql .= ", password = ?";
            $params[] = password_hash($usuario->password, PASSWORD_DEFAULT);
        }

        $sql .= " WHERE id_usuario = ?";
        $params[] = $usuario->id_usuario;

        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function delete($id) {
        $stmt = $this->db->prepare("UPDATE usuarios SET activo = 0 WHERE id_usuario = ?");
        return $stmt->execute([$id]);
    }
}
