<?php
header("Content-Type: application/json");

// Allow CORS so React can call this
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit(0);
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Read JSON body
    $data = json_decode(file_get_contents("php://input"), true);

    $schoolId = $data["school_id"] ?? "";
    $email    = $data["email"] ?? "";
    $password = $data["password"] ?? "";
    $license  = $data["license"] ?? "";

    if (empty($schoolId) || empty($email) || empty($password) || empty($license)) {
        echo json_encode(["success" => false, "message" => "All fields are required"]);
        exit;
    }

    // For now, skip MongoDB and photo upload
    // Just pretend we saved successfully
    echo json_encode([
        "success" => true,
        "message" => "Counselor registered successfully (demo only)"
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Invalid request"]);
}
?>
