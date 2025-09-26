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

if (isset($data['school_id'], $data['password'])) {
    $school_id = $data['school_id'];
    $password = $data['password'];

    // TODO: Replace with database check
    if ($school_id === "12345" && $password === "secret") {
        echo json_encode([
            "success" => true,
            "message" => "Login successful 🎉",
            "user" => [
                "role" => "student",
                "school_id" => $school_id
            ]
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Invalid School ID or Password ❌"
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields"
    ]);
}
?>
