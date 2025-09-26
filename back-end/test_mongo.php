<?php
require 'vendor/autoload.php'; // Composer autoload

try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
    echo "✅ Connected to MongoDB!";

    $db = $client->project499;
    $collection = $db->students;

    $insertOneResult = $collection->insertOne([
        'name' => 'Test Student',
        'email' => 'test@student.com'
    ]);

    echo "<br>Inserted with ObjectID: " . $insertOneResult->getInsertedId();
} catch (Exception $e) {
    echo "❌ Connection failed: " . $e->getMessage();
}
?>
