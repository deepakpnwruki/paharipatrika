<?php
/*
Plugin Name: Reader Mobile Collector
Description: Collects mobile numbers from readers and displays them in the WordPress admin dashboard.
Version: 1.1
Author: Your Name
*/

if (!defined('ABSPATH')) exit;

// Create table on plugin activation
register_activation_hook(__FILE__, function() {
    global $wpdb;
    $table = $wpdb->prefix . 'reader_mobile_numbers';
    $charset_collate = $wpdb->get_charset_collate();
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            mobile VARCHAR(20) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY unique_mobile (mobile)
        ) $charset_collate;";
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
});

// REST API endpoint to save mobile number
add_action('rest_api_init', function() {
    register_rest_route('reader/v1', '/save-mobile', [
        'methods' => 'POST',
        'callback' => function($request) {
            global $wpdb;
            $table = $wpdb->prefix . 'reader_mobile_numbers';
            $params = $request->get_json_params();
            $mobile = isset($params['mobile']) ? sanitize_text_field($params['mobile']) : '';
            if (!$mobile) {
                return new WP_REST_Response(['success' => false, 'message' => 'Mobile number required'], 400);
            }
                // Check for duplicate
                $exists = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $table WHERE mobile = %s", $mobile));
                if ($exists) {
                    return new WP_REST_Response(['success' => false, 'message' => 'This mobile number is already registered.'], 409);
                }
                $wpdb->insert($table, ['mobile' => $mobile]);
                return new WP_REST_Response(['success' => true], 200);
        },
        'permission_callback' => '__return_true',
    ]);
});

// Admin menu page to show all numbers
add_action('admin_menu', function() {
    add_menu_page(
        'Reader Mobiles',
        'Reader Mobiles',
        'manage_options',
        'reader-mobile-numbers',
        'reader_mobile_numbers_admin_page',
        'dashicons-list-view',
        26
    );
});

function reader_mobile_numbers_admin_page() {
    global $wpdb;
    $table = $wpdb->prefix . 'reader_mobile_numbers';

    // Handle CSV export
    if (isset($_GET['export_reader_mobiles']) && current_user_can('manage_options')) {
        // Prevent any output before headers
        if (ob_get_level()) ob_end_clean();
        nocache_headers();
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="reader_mobile_numbers.csv"');
        header('Pragma: no-cache');
        header('Expires: 0');
        $output = fopen('php://output', 'w');
        fputcsv($output, ['ID', 'Mobile', 'Date']);
        $results = $wpdb->get_results("SELECT * FROM $table ORDER BY created_at DESC");
        foreach ($results as $row) {
            fputcsv($output, [$row->id, $row->mobile, $row->created_at]);
        }
        fclose($output);
        exit;
    }

    $results = $wpdb->get_results("SELECT * FROM $table ORDER BY created_at DESC");
    echo '<div class="wrap"><h1 style="margin-bottom:24px;">Collected Mobile Numbers</h1>';
    echo '<a href="?page=reader-mobile-numbers&export_reader_mobiles=1" class="button button-primary" style="margin-bottom:20px">Export as CSV</a>';
    if ($results) {
        echo '<div style="overflow-x:auto; max-width:900px; margin-top:20px;">';
        echo '<table class="widefat striped" style="min-width:400px; background:#fff; border-radius:8px; box-shadow:0 2px 8px #e5e5e5;">';
        echo '<thead><tr style="background:#f6f8fa;"><th style="padding:10px 16px;">#</th><th style="padding:10px 16px;">Mobile</th><th style="padding:10px 16px;">Date</th></tr></thead><tbody>';
        $i = 1;
        foreach ($results as $row) {
            $row_style = $i % 2 === 0 ? 'background:#f9f9f9;' : '';
            echo '<tr style="' . $row_style . '"><td style="padding:8px 16px;">' . esc_html($i) . '</td><td style="padding:8px 16px; font-weight:500; color:#1a1a1a;">' . esc_html($row->mobile) . '</td><td style="padding:8px 16px; color:#666;">' . esc_html($row->created_at) . '</td></tr>';
            $i++;
        }
        echo '</tbody></table></div>';
    } else {
        echo '<p style="margin-top:20px;">No numbers collected yet.</p>';
    }
    echo '</div>';
}
