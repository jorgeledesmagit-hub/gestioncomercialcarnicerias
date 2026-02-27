<?php
session_start();
// public/login.php
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Sistema de Gestión Comercial</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap" rel="stylesheet">
</head>
<body>
    <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh;">
        <div class="glass-card fade-in" style="width: 100%; max-width: 400px; padding: 40px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: var(--primary); margin-bottom: 10px;">Sistema de Gestión Comercial</h1>
            </div>
            
            <form id="loginForm">
                <div class="input-group">
                    <label>Usuario</label>
                    <input type="text" id="username" required placeholder="Ingresas tu usuario">
                </div>
                <div class="input-group">
                    <label>Contraseña</label>
                    <input type="password" id="password" required placeholder="••••••••">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Iniciar Sesión</button>
            </form>
            <div id="loginMessage" style="margin-top: 20px; text-align: center; color: var(--accent);"></div>
        </div>
    </div>

    <script src="assets/js/app.js"></script>
    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Simulación AJAX por ahora (luego implementamos api/login.php)
            const response = await fetch('api/auth.php?action=login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
            const result = await response.json();
            
            if (result.success) {
                window.location.href = 'index.php';
            } else {
                document.getElementById('loginMessage').innerText = result.error;
            }
        });
    </script>
</body>
</html>
