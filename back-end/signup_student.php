<?php
// Allow requests from React (http://localhost:5173)
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get raw POST data (JSON)
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['school_id'], $data['email'], $data['password'])) {
    $school_id = $data['school_id'];
    $email = $data['email'];
    $password = $data['password'];

    // TODO: Save into database instead of dummy response
    echo json_encode([
        "success" => true,
        "message" => "Student registered successfully 🎉",
        "data" => [
            "school_id" => $school_id,
            "email" => $email
        ]
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields"
    ]);
}
?>
