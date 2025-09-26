<?php
header("Content-Type: application/json");

// Allow CORS from React
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit(0);
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Get JSON body
    $data = json_decode(file_get_contents("php://input"), true);

    $schoolId = $data["school_id"] ?? "";
    $password = $data["password"] ?? "";

    if (empty($schoolId) || empty($password)) {
        echo json_encode(["success" => false, "message" => "All fields are required"]);
        exit;
    }

    // Demo only (no DB for now)
    if ($schoolId === "counselor123" && $password === "testpass") {
        echo json_encode(["success" => true, "message" => "Counselor login successful"]);
    } else {
        echo json_encode(["success" => false, "message" => "Invalid School ID or Password"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request"]);
}
?>
