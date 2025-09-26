<?php
// Enable CORS so React can access
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get JSON input from React
$data = json_decode(file_get_contents("php://input"), true);

// Validate input
if (!isset($data['user']) || !isset($data['action'])) {
    echo json_encode([
        "success" => false,
        "message" => "Missing user or action"
    ]);
    exit();
}

$user = $data['user']; // 'student' or 'counselor'
$action = $data['action']; // 'login' or 'signup'

// Determine redirect URL (for frontend routing)
$response = ["success" => true];

if ($action === "login") {
    if ($user === "student") {
        $response['redirect'] = "/login/student";
    } else {
        $response['redirect'] = "/login/counselor";
    }
} elseif ($action === "signup") {
    if ($user === "student") {
        $response['redirect'] = "/signup/student";
    } else {
        $response['redirect'] = "/signup/counselor";
    }
} else {
    $response = [
        "success" => false,
        "message" => "Invalid action"
    ];
}

// Return JSON
echo json_encode($response);
exit();
?>
