<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("127.0.0.1", "root", "", "movie_db");
$conn->set_charset("utf8mb4");

$keyword = $_GET['search'] ?? '';
$keyword = $conn->real_escape_string($keyword);

$sql = "SELECT title, slug, poster 
        FROM movies 
        WHERE title LIKE '%$keyword%' 
        LIMIT 6";

$result = $conn->query($sql);
$data = [];

while ($row = $result->fetch_assoc()) {
    // poster đã là đường dẫn đầy đủ từ DB (uploads/posters/...)
    // thêm base URL của file server
    $row['poster'] = "http://127.0.0.1:3002/" . $row['poster'];
    $data[] = $row;
}

echo json_encode($data);
