<?php
// Allow requests from React (CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

// Handle preflight (OPTIONS request from browser before POST)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Read JSON from request body
$input = json_decode(file_get_contents("php://input"), true);

if ($input && isset($input['school_id']) && isset($input['password'])) {
    echo json_encode([
        "success" => true,
        "message" => "Received data from React",
        "data" => $input
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "No input received or missing fields"
    ]);
}
?>
