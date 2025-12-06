<?php
// Este archivo sería necesario si tuvieras un servidor con PHP
// Para GitHub Pages (sólo HTML/CSS/JS), usaremos localStorage

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener datos del formulario
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        $data = $_POST;
    }
    
    // Validar datos requeridos
    $required = ['foundNet', 'location', 'date', 'description', 'name', 'phone', 'email'];
    $missing = [];
    
    foreach ($required as $field) {
        if (empty($data[$field])) {
            $missing[] = $field;
        }
    }
    
    if (!empty($missing)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Faltan campos requeridos: ' . implode(', ', $missing)
        ]);
        exit;
    }
    
    // Validar email
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Email no válido'
        ]);
        exit;
    }
    
    // Añadir timestamp
    $data['timestamp'] = date('Y-m-d H:i:s');
    $data['submission_id'] = uniqid('report_', true);
    
    // Guardar en archivo CSV
    $filename = 'data/formularios.csv';
    
    // Crear directorio si no existe
    if (!file_exists('data')) {
        mkdir('data', 0777, true);
    }
    
    // Crear archivo CSV con cabeceras si no existe
    if (!file_exists($filename)) {
        $headers = ['ID', 'Timestamp', '¿Encontró red?', 'Lugar', 'Fecha hallazgo', 'Descripción', 'Foto', 'Vídeo', 'Nombre', 'Teléfono', 'Email', 'Método contacto', 'Permiso'];
        $file = fopen($filename, 'w');
        fputcsv($file, $headers);
        fclose($file);
    }
    
    // Añadir datos al CSV
    $file = fopen($filename, 'a');
    fputcsv($file, [
        $data['submission_id'],
        $data['timestamp'],
        $data['foundNet'],
        $data['location'],
        $data['date'],
        $data['description'],
        $data['photo'] ?? '',
        $data['video'] ?? '',
        $data['name'],
        $data['phone'],
        $data['email'],
        $data['contactMethod'] ?? 'Correo electrónico',
        'Sí'
    ]);
    fclose($file);
    
    // También guardar en archivo JSON para fácil lectura
    $jsonFile = 'data/formularios.json';
    $jsonData = [];
    
    if (file_exists($jsonFile)) {
        $jsonData = json_decode(file_get_contents($jsonFile), true) ?: [];
    }
    
    $jsonData[] = $data;
    file_put_contents($jsonFile, json_encode($jsonData, JSON_PRETTY_PRINT));
    
    // Responder con éxito
    echo json_encode([
        'success' => true,
        'message' => 'Reporte guardado correctamente',
        'id' => $data['submission_id']
    ]);
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Obtener reportes
    $jsonFile = 'data/formularios.json';
    
    if (file_exists($jsonFile)) {
        $data = file_get_contents($jsonFile);
        header('Content-Type: application/json');
        echo $data;
    } else {
        echo json_encode([]);
    }
    
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
}
?>
