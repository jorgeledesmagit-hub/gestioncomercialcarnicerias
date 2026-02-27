<?php
namespace App\Application\Services;

use App\Data\Repositories\UsuarioRepository;
use Exception;

class AuthService {
    private $userRepo;

    public function __construct(UsuarioRepository $userRepo) {
        $this->userRepo = $userRepo;
    }

    public function login($username, $password) {
        $user = $this->userRepo->findByUsuario($username);
        
        if (!$user) {
            throw new Exception("Usuario no encontrado.");
        }

        if (!password_verify($password, $user->password)) {
            // Para pruebas iniciales, si la pass no está hasheada, chequeo flat
            if ($password !== $user->password) {
                throw new Exception("Contraseña incorrecta.");
            }
        }

        if ($user->activo == 0) {
            throw new Exception("Usuario inactivo.");
        }

        $_SESSION['user_id'] = $user->id_usuario;
        $_SESSION['user_name'] = $user->nombre;
        $_SESSION['user_rol'] = $user->rol;

        return $user;
    }

    public function logout() {
        session_destroy();
    }

    public static function checkAuth() {
        if (!isset($_SESSION['user_id'])) {
            header('Location: login.php');
            exit;
        }
    }

    public static function hasPermission($required_rol) {
        if ($_SESSION['user_rol'] !== $required_rol && $_SESSION['user_rol'] !== 'administrador') {
            return false;
        }
        return true;
    }
}
