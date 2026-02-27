<?php
session_start();
// public/index.php
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Sistema de Gestión Comercial</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap" rel="stylesheet">

</head>
<body>
    <nav class="glass-card" style="margin: 20px; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center;">
        <h2 style="color: var(--primary);">Sistema de Gestión Comercial</h2>
        <div style="display: flex; gap: 20px; align-items: center;">
            <span>Bienvenido, <strong><?php echo $_SESSION['user_name']; ?></strong></span>
            <button onclick="logout()" class="btn btn-primary" style="padding: 8px 16px; font-size: 12px; background: var(--accent);">Cerrar Sesión</button>
        </div>
    </nav>

    <main style="padding: 0 20px; flex-grow: 1;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; max-width: 1200px; margin: 0 auto;">
            
            <!-- Caja Card -->
            <div class="glass-card fade-in" style="padding: 30px; text-align: center; cursor: pointer;" onclick="app.navigateTo('caja')">
                <div style="font-size: 40px; color: var(--primary); margin-bottom: 15px;">💰</div>
                <h3>Caja / Jornada</h3>
                <p style="color: var(--text-muted); margin-top: 10px;">Apertura y cierre de caja diaria.</p>
            </div>

            <!-- Ventas Card -->
            <div class="glass-card fade-in" style="padding: 30px; text-align: center; cursor: pointer; animation-delay: 0.1s;" onclick="app.navigateTo('ventas')">
                <div style="font-size: 40px; color: var(--primary); margin-bottom: 15px;">🥩</div>
                <h3>Proceso de Venta</h3>
                <p style="color: var(--text-muted); margin-top: 10px;">Nueva venta por peso o unidad.</p>
            </div>

            <!-- Stock Card -->
            <?php if ($_SESSION['user_rol'] === 'administrador'): ?>
            <div class="glass-card fade-in" style="padding: 30px; text-align: center; cursor: pointer; animation-delay: 0.2s;" onclick="app.navigateTo('stock')">
                <div style="font-size: 40px; color: var(--primary); margin-bottom: 15px;">📦</div>
                <h3>Gestión de Stock</h3>
                <p style="color: var(--text-muted); margin-top: 10px;">Ingreso de mercadería y mermas.</p>
            </div>
            <?php endif; ?>

            <!-- Reportes Card -->
            <?php if ($_SESSION['user_rol'] === 'administrador'): ?>
            <div class="glass-card fade-in" style="padding: 30px; text-align: center; cursor: pointer; animation-delay: 0.3s;" onclick="app.navigateTo('reportes')">
                <div style="font-size: 40px; color: var(--primary); margin-bottom: 15px;">📊</div>
                <h3>Reportes</h3>
                <p style="color: var(--text-muted); margin-top: 10px;">Estadísticas y ventas mensuales.</p>
            </div>

            <div class="glass-card fade-in" style="padding: 30px; text-align: center; cursor: pointer; animation-delay: 0.4s;" onclick="app.navigateTo('productos')">
                <div style="font-size: 40px; color: var(--primary); margin-bottom: 15px;">🏷️</div>
                <h3>Productos</h3>
                <p style="color: var(--text-muted); margin-top: 10px;">Crear y editar productos.</p>
            </div>

            <div class="glass-card fade-in" style="padding: 30px; text-align: center; cursor: pointer; animation-delay: 0.5s;" onclick="app.navigateTo('usuarios')">
                <div style="font-size: 40px; color: var(--primary); margin-bottom: 15px;">👥</div>
                <h3>Usuarios</h3>
                <p style="color: var(--text-muted); margin-top: 10px;">Gestión de permisos y roles.</p>
            </div>

            <div class="glass-card fade-in" style="padding: 30px; text-align: center; cursor: pointer; animation-delay: 0.6s;" onclick="app.navigateTo('respaldo')">
                <div style="font-size: 40px; color: var(--primary); margin-bottom: 15px;">💾</div>
                <h3>Respaldo</h3>
                <p style="color: var(--text-muted); margin-top: 10px;">Backup de datos y exportación PDF.</p>
            </div>
            <?php endif; ?>

        </div>


        <!-- Dynamic Content Area -->
        <div id="contentArea" style="margin-top: 40px; display: none;">
            <!-- Contenido dinámico cargado por app.js -->
        </div>
    </main>

    <script src="assets/js/app.js?v=<?php echo time(); ?>"></script>
    <script>
        function logout() {
            fetch('api/auth.php?action=logout').then(() => window.location.href = 'login.php');
        }
    </script>
</body>
</html>
