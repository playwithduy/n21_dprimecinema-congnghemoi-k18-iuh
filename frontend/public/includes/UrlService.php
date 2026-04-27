<?php

class UrlService {
    private static $salt = "DPRIME_SECURE_2026"; // Secret salt to prevent simple decoding if desired

    /**
     * Encode page and params into a pretty URL segment
     */
    public static function encode($page, $slug, $params = []) {
        $slug = self::slugify($slug);
        
        $data = ["p" => $page];
        if (!empty($params)) {
            $data = array_merge($data, $params);
        }
        
        $json = json_encode($data);
        $encoded = base64_encode($json);
        // Replace chars that might break URLs
        $encoded = str_replace(['+', '/', '='], ['-', '_', ''], $encoded);
        
        return "v/{$slug}--{$encoded}";
    }

    /**
     * Decode the 'v' parameter from the URL
     */
    public static function decode($v) {
        $parts = explode('--', $v);
        if (count($parts) < 2) return null;

        $encoded = $parts[1];
        // Restore Base64 chars
        $encoded = str_replace(['-', '_'], ['+', '/'], $encoded);
        $mod4 = strlen($encoded) % 4;
        if ($mod4) {
            $encoded .= substr('====', $mod4);
        }

        $json = base64_decode($encoded);
        $data = json_decode($json, true);

        if (!$data || !isset($data['p'])) return null;

        // Also extract slug if needed (though usually purely for SEO)
        $data['slug'] = $parts[0];

        return $data;
    }

    /**
     * Helper to create SEO slugs
     */
    public static function slugify($text) {
        $text = preg_replace('~[^\pL\d]+~u', '-', $text);
        $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
        $text = preg_replace('~[^-\w]+~', '', $text);
        $text = trim($text, '-');
        $text = preg_replace('~-+~', '-', $text);
        $text = strtolower($text);
        if (empty($text)) return 'n-a';
        return $text;
    }
}
