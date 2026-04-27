<?php

class RateLimiter {
    private static $window = 60; // Period in seconds
    private static $maxRequests = 40; // Max requests per window

    /**
     * Check if the current IP has exceeded the rate limit
     */
    public static function check() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $ip = $_SERVER['REMOTE_ADDR'];
        $now = time();

        if (!isset($_SESSION['rate_limit_history'])) {
            $_SESSION['rate_limit_history'] = [];
        }

        // Clean up old history
        $_SESSION['rate_limit_history'] = array_filter(
            $_SESSION['rate_limit_history'],
            function($timestamp) use ($now) {
                return $timestamp > ($now - self::$window);
            }
        );

        // Add current request
        $_SESSION['rate_limit_history'][] = $now;

        // Check if exceeded
        if (count($_SESSION['rate_limit_history']) > self::$maxRequests) {
            self::block();
        }
    }

    /**
     * Send 429 header and block execution
     */
    private static function block() {
        header('HTTP/1.1 429 Too Many Requests');
        header('Retry-After: ' . self::$window);
        
        echo "<div style='font-family: Arial, sans-serif; text-align: center; padding: 50px;'>";
        echo "<h1>429 - Too Many Requests</h1>";
        echo "<p>Bạn đang truy cập trang web quá nhanh. Vui lòng thử lại sau giây lát.</p>";
        echo "<hr><p><i>D PRIME CINEMA Protection</i></p>";
        echo "</div>";
        exit;
    }
}
