// REST endpoint to delete a Google user by email
add_action('rest_api_init', function() {
    register_rest_route('reader/v1', '/delete-google-user', array(
        'methods' => array('POST', 'OPTIONS'),
        'callback' => function($request) {
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: POST, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type');
            if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
                return new WP_REST_Response(null, 204);
            }
            $params = $request->get_json_params();
            $email = isset($params['email']) ? sanitize_email($params['email']) : '';
            if (!$email) {
                return new WP_REST_Response(['success' => false, 'message' => 'Email is required.'], 400);
            }
            global $wpdb;
            $table = $wpdb->prefix . 'reader_mobiles';
            $wpdb->delete($table, ['email' => $email]);
            $user = get_user_by('email', $email);
            if ($user) {
                require_once(ABSPATH.'wp-admin/includes/user.php');
                wp_delete_user($user->ID);
            }
            return new WP_REST_Response(['success' => true, 'message' => 'User deleted.']);
        },
        'permission_callback' => '__return_true',
    ));
});

<?php
/*
Plugin Name: Reader Unified Signup
Description: Handles Google One Tap and mobile signups, collects name/email/mobile, and provides admin UI.
Version: 1.4
Author: Your Name
*/

if (!defined('ABSPATH')) exit;

// Create or update custom table for mobile and Google signups
register_activation_hook(__FILE__, function() {
    global $wpdb;
    $table = $wpdb->prefix . 'reader_mobiles';
    $charset_collate = $wpdb->get_charset_collate();
    $sql = "CREATE TABLE IF NOT EXISTS $table (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        mobile VARCHAR(20) DEFAULT NULL,
    email VARCHAR(100) UNIQUE,
        name VARCHAR(100) DEFAULT NULL,
        source VARCHAR(20) DEFAULT NULL,
        google_sub VARCHAR(100) DEFAULT NULL,
        google_picture TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) $charset_collate;";
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
    // Ensure all columns exist (for upgrades)
    $columns = $wpdb->get_col("DESC $table", 0);
    $alter = [];
    if (!in_array('source', $columns)) $alter[] = "ADD COLUMN source VARCHAR(20) DEFAULT NULL";
    if (!in_array('google_sub', $columns)) $alter[] = "ADD COLUMN google_sub VARCHAR(100) DEFAULT NULL";
    if (!in_array('google_picture', $columns)) $alter[] = "ADD COLUMN google_picture TEXT DEFAULT NULL";
    if ($alter) {
        $wpdb->query("ALTER TABLE $table " . implode(',', $alter));
    }
});


// Google One Tap endpoint (signup/login) - also stores in custom table
add_action('rest_api_init', function() {
    register_rest_route('reader/v1', '/google-login', array(
        'methods' => array('POST', 'OPTIONS'),
        'callback' => function($request) {
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: POST, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type');
            if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
                return new WP_REST_Response(null, 204);
            }
            $params = $request->get_json_params();
            $email = isset($params['email']) ? sanitize_email($params['email']) : '';
            $name = isset($params['name']) ? sanitize_text_field($params['name']) : '';
            $picture = isset($params['picture']) ? esc_url_raw($params['picture']) : '';
            $sub = isset($params['sub']) ? sanitize_text_field($params['sub']) : '';
            $mobile = isset($params['mobile']) ? sanitize_text_field($params['mobile']) : '';
            if (!$email || !$name || !$mobile || !$sub) {
                return new WP_REST_Response(['success' => false, 'message' => 'Email, name, mobile, and sub are required.'], 400);
            }
            $user = get_user_by('email', $email);
            global $wpdb;
            $table = $wpdb->prefix . 'reader_mobiles';
            $existing = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE email = %s", $email));
            if ($existing) {
                return new WP_REST_Response(['success' => true, 'user' => $existing, 'message' => 'Profile exists.'], 200);
            } else {
                // Create WP user if not exists
                if (!$user) {
                    $random_password = wp_generate_password(12, false);
                    $user_id = wp_create_user($email, $random_password, $email);
                    if (is_wp_error($user_id)) {
                        return new WP_REST_Response(['success' => false, 'message' => 'User creation failed'], 500);
                    }
                    $user = get_user_by('id', $user_id);
                    wp_update_user(['ID' => $user_id, 'display_name' => $name]);
                } else {
                    $user_id = $user->ID;
                    if ($name) {
                        wp_update_user(['ID' => $user_id, 'display_name' => $name]);
                    }
                }
                update_user_meta($user_id, 'google_sub', $sub);
                update_user_meta($user_id, 'google_picture', $picture);
                $wpdb->insert($table, [
                    'email' => $email,
                    'name' => $name,
                    'mobile' => $mobile,
                    'source' => 'google',
                    'google_sub' => $sub,
                    'google_picture' => $picture,
                    'created_at' => current_time('mysql', 1),
                    'updated_at' => current_time('mysql', 1)
                ]);
                $user = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE email = %s", $email));
                return new WP_REST_Response(['success' => true, 'user' => $user, 'message' => 'Google profile registered.']);
            }
        },
        'permission_callback' => '__return_true',
    ));
});

// Google One Tap update endpoint (unchanged)
add_action('rest_api_init', function() {
    register_rest_route('reader/v1', '/update-google-user', array(
        'methods' => array('POST', 'OPTIONS'),
        'callback' => function($request) {
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: POST, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type');
            if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
                return new WP_REST_Response(null, 204);
            }
            $params = $request->get_json_params();
            $user_id = isset($params['ID']) ? intval($params['ID']) : 0;
            $name = isset($params['name']) ? sanitize_text_field($params['name']) : '';
            $email = isset($params['email']) ? sanitize_email($params['email']) : '';
            if (!$user_id || (!$name && !$email)) {
                return new WP_REST_Response(['success' => false, 'message' => 'User ID and at least one field required'], 400);
            }
            $userdata = ['ID' => $user_id];
            if ($name) $userdata['display_name'] = $name;
            if ($email) $userdata['user_email'] = $email;
            $result = wp_update_user($userdata);
            if (is_wp_error($result)) {
                return new WP_REST_Response(['success' => false, 'message' => 'Update failed'], 500);
            }
            $user = get_user_by('id', $user_id);
            return new WP_REST_Response(['success' => true, 'user' => [
                'ID' => $user_id,
                'email' => $user->user_email,
                'display_name' => $user->display_name
            ], 'message' => 'Profile updated.']);
        },
        'permission_callback' => '__return_true',
    ));
});

// Unified admin menu for all users with delete functionality
add_action('admin_menu', function() {
    add_menu_page('Reader Users', 'Reader Users', 'manage_options', 'reader-users', function() {
        global $wpdb;
        $table = $wpdb->prefix . 'reader_mobiles';
        // Handle delete actions
        if (isset($_GET['delete_mobile']) && current_user_can('manage_options')) {
            $del_mobile = sanitize_text_field($_GET['delete_mobile']);
            $wpdb->delete($table, ['mobile' => $del_mobile]);
            echo '<div class="notice notice-success is-dismissible"><p>Mobile user deleted.</p></div>';
        }
        if (isset($_GET['delete_google']) && current_user_can('delete_users')) {
            $del_uid = intval($_GET['delete_google']);
            require_once(ABSPATH.'wp-admin/includes/user.php');
            wp_delete_user($del_uid);
            echo '<div class="notice notice-success is-dismissible"><p>Google user deleted.</p></div>';
        }
        $rows = $wpdb->get_results("SELECT * FROM $table ORDER BY created_at DESC");
        echo '<div class="wrap"><h1>All Reader Users</h1>';
        echo '<table class="widefat"><thead><tr><th>ID</th><th>Email</th><th>Name</th><th>Google Sub</th><th>Picture</th><th>Created</th><th>Updated</th><th>Delete</th></tr></thead><tbody>';
        foreach ($rows as $row) {
            echo '<tr>';
            echo '<td>' . esc_html($row->id) . '</td>';
            echo '<td>' . esc_html($row->email) . '</td>';
            echo '<td>' . esc_html($row->name) . '</td>';
            echo '<td>' . (isset($row->google_sub) ? esc_html($row->google_sub) : '') . '</td>';
            echo '<td>';
            if (isset($row->google_picture) && $row->google_picture) echo '<img src="' . esc_url($row->google_picture) . '" alt="pic" style="width:32px;height:32px;border-radius:50%;">';
            echo '</td>';
            echo '<td>' . esc_html($row->created_at) . '</td>';
            echo '<td>' . esc_html($row->updated_at) . '</td>';
            echo '<td>';
            // Find WP user by email for delete link
            $user = get_user_by('email', $row->email);
            if ($user) {
                echo '<a href="' . admin_url('admin.php?page=reader-users&delete_google=' . intval($user->ID)) . '" onclick="return confirm(\'Delete this Google user?\')" style="color:red;">Delete</a>';
            }
            echo '</td>';
            echo '</tr>';
        }
        echo '</tbody></table></div>';
    });
});
if (!defined('ABSPATH')) exit;

// Create or update custom table for mobile and Google signups
register_activation_hook(__FILE__, function() {
    global $wpdb;
    $table = $wpdb->prefix . 'reader_mobiles';
    $charset_collate = $wpdb->get_charset_collate();
    $sql = "CREATE TABLE IF NOT EXISTS $table (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        mobile VARCHAR(20) DEFAULT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(100) DEFAULT NULL,
        source VARCHAR(20) DEFAULT NULL,
        google_sub VARCHAR(100) DEFAULT NULL,
        google_picture TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) $charset_collate;";
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
    // Ensure all columns exist (for upgrades)
    $columns = $wpdb->get_col("DESC $table", 0);
    $alter = [];
    if (!in_array('source', $columns)) $alter[] = "ADD COLUMN source VARCHAR(20) DEFAULT NULL";
    if (!in_array('google_sub', $columns)) $alter[] = "ADD COLUMN google_sub VARCHAR(100) DEFAULT NULL";
    if (!in_array('google_picture', $columns)) $alter[] = "ADD COLUMN google_picture TEXT DEFAULT NULL";
    if ($alter) {
        $wpdb->query("ALTER TABLE $table " . implode(',', $alter));
    }
});

// REST endpoint for mobile signup/update
add_action('rest_api_init', function() {
    register_rest_route('reader/v1', '/save-mobile', array(
        'methods' => array('POST', 'OPTIONS'),
        'callback' => function($request) {
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: POST, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type');
            if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
                return new WP_REST_Response(null, 204);
            }
            $params = $request->get_json_params();
            $mobile = isset($params['mobile']) ? sanitize_text_field($params['mobile']) : '';
            $name = isset($params['name']) ? sanitize_text_field($params['name']) : '';
            $email = isset($params['email']) ? sanitize_email($params['email']) : '';
            if (!$mobile) {
                return new WP_REST_Response(['success' => false, 'message' => 'Mobile required'], 400);
            }
            global $wpdb;
            $table = $wpdb->prefix . 'reader_mobiles';
            $existing = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE mobile = %s", $mobile));
            if ($existing) {
                $update_data = ['updated_at' => current_time('mysql', 1)];
                if (!empty($name)) $update_data['name'] = $name;
                if (!empty($email)) $update_data['email'] = $email;
                $wpdb->update($table, $update_data, ['mobile' => $mobile]);
                $user = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE mobile = %s", $mobile));
                return new WP_REST_Response(['success' => true, 'user' => $user, 'message' => 'Profile updated.']);
            } else {
                $wpdb->insert($table, [
                    'mobile' => $mobile,
                    'name' => $name,
                    'email' => $email,
                    'source' => 'mobile',
                    'created_at' => current_time('mysql', 1),
                    'updated_at' => current_time('mysql', 1)
                ]);
                $user = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE mobile = %s", $mobile));
                return new WP_REST_Response(['success' => true, 'user' => $user, 'message' => 'Mobile registered.']);
            }
        },
        'permission_callback' => '__return_true',
    ));
});

// Google One Tap endpoint (signup/login) - also stores in custom table
add_action('rest_api_init', function() {
    register_rest_route('reader/v1', '/google-login', array(
        'methods' => array('POST', 'OPTIONS'),
        'callback' => function($request) {
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: POST, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type');
            if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
                return new WP_REST_Response(null, 204);
            }
            $params = $request->get_json_params();
            $email = isset($params['email']) ? sanitize_email($params['email']) : '';
            $name = isset($params['name']) ? sanitize_text_field($params['name']) : '';
            $picture = isset($params['picture']) ? esc_url_raw($params['picture']) : '';
            $sub = isset($params['sub']) ? sanitize_text_field($params['sub']) : '';
            if (!$email || !$sub) {
                return new WP_REST_Response(['success' => false, 'message' => 'Email and sub required'], 400);
            }
            $user = get_user_by('email', $email);
            if (!$user) {
                $random_password = wp_generate_password(12, false);
                $user_id = wp_create_user($email, $random_password, $email);
                if (is_wp_error($user_id)) {
                    return new WP_REST_Response(['success' => false, 'message' => 'User creation failed'], 500);
                }
                $user = get_user_by('id', $user_id);
                wp_update_user(['ID' => $user_id, 'display_name' => $name]);
            } else {
                $user_id = $user->ID;
                if ($name) {
                    wp_update_user(['ID' => $user_id, 'display_name' => $name]);
                }
            }
            update_user_meta($user_id, 'google_sub', $sub);
            update_user_meta($user_id, 'google_picture', $picture);

            // Insert/update in custom table
            global $wpdb;
            $table = $wpdb->prefix . 'reader_mobiles';
            $existing = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE email = %s", $email));
            $data = [
                'email' => $email,
                'name' => $name,
                'source' => 'google',
                'google_sub' => $sub,
                'google_picture' => $picture,
                'updated_at' => current_time('mysql', 1)
            ];
            if ($existing) {
                $wpdb->update($table, $data, ['email' => $email]);
            } else {
                $data['created_at'] = current_time('mysql', 1);
                $wpdb->insert($table, $data);
            }

            return new WP_REST_Response(['success' => true, 'user' => [
                'ID' => $user_id,
                'email' => $email,
                'display_name' => $name ?: $user->display_name,
                'picture' => $picture
            ]]);
        },
        'permission_callback' => '__return_true',
    ));
});

// Google One Tap update endpoint (unchanged)
add_action('rest_api_init', function() {
    register_rest_route('reader/v1', '/update-google-user', array(
        'methods' => array('POST', 'OPTIONS'),
        'callback' => function($request) {
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: POST, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type');
            if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
                return new WP_REST_Response(null, 204);
            }
            $params = $request->get_json_params();
            $user_id = isset($params['ID']) ? intval($params['ID']) : 0;
            $name = isset($params['name']) ? sanitize_text_field($params['name']) : '';
            $email = isset($params['email']) ? sanitize_email($params['email']) : '';
            if (!$user_id || (!$name && !$email)) {
                return new WP_REST_Response(['success' => false, 'message' => 'User ID and at least one field required'], 400);
            }
            $userdata = ['ID' => $user_id];
            if ($name) $userdata['display_name'] = $name;
            if ($email) $userdata['user_email'] = $email;
            $result = wp_update_user($userdata);
            if (is_wp_error($result)) {
                return new WP_REST_Response(['success' => false, 'message' => 'Update failed'], 500);
            }
            $user = get_user_by('id', $user_id);
            return new WP_REST_Response(['success' => true, 'user' => [
                'ID' => $user_id,
                'email' => $user->user_email,
                'display_name' => $user->display_name
            ], 'message' => 'Profile updated.']);
        },
        'permission_callback' => '__return_true',
    ));
});

// Unified admin menu for all users with delete functionality
add_action('admin_menu', function() {
    add_menu_page('Reader Users', 'Reader Users', 'manage_options', 'reader-users', function() {
        global $wpdb;
        $table = $wpdb->prefix . 'reader_mobiles';
        // Handle delete actions
        if (isset($_GET['delete_mobile']) && current_user_can('manage_options')) {
            $del_mobile = sanitize_text_field($_GET['delete_mobile']);
            $wpdb->delete($table, ['mobile' => $del_mobile]);
            echo '<div class="notice notice-success is-dismissible"><p>Mobile user deleted.</p></div>';
        }
        if (isset($_GET['delete_google']) && current_user_can('delete_users')) {
            $del_uid = intval($_GET['delete_google']);
            require_once(ABSPATH.'wp-admin/includes/user.php');
            wp_delete_user($del_uid);
            echo '<div class="notice notice-success is-dismissible"><p>Google user deleted.</p></div>';
        }
        $rows = $wpdb->get_results("SELECT * FROM $table ORDER BY created_at DESC");
        echo '<div class="wrap"><h1>All Reader Users</h1>';
        echo '<table class="widefat"><thead><tr><th>Source</th><th>ID</th><th>Mobile</th><th>Email</th><th>Name</th><th>Google Sub</th><th>Picture</th><th>Created</th><th>Updated</th><th>Delete</th></tr></thead><tbody>';
        foreach ($rows as $row) {
            echo '<tr>';
            echo '<td>' . (isset($row->source) ? esc_html($row->source) : '') . '</td>';
            echo '<td>' . esc_html($row->id) . '</td>';
            echo '<td>' . esc_html($row->mobile) . '</td>';
            echo '<td>' . esc_html($row->email) . '</td>';
            echo '<td>' . esc_html($row->name) . '</td>';
            echo '<td>' . (isset($row->google_sub) ? esc_html($row->google_sub) : '') . '</td>';
            echo '<td>';
            if (isset($row->google_picture) && $row->google_picture) echo '<img src="' . esc_url($row->google_picture) . '" alt="pic" style="width:32px;height:32px;border-radius:50%;">';
            echo '</td>';
            echo '<td>' . esc_html($row->created_at) . '</td>';
            echo '<td>' . esc_html($row->updated_at) . '</td>';
            echo '<td>';
            if (isset($row->source) && $row->source === 'mobile') {
                echo '<a href="' . admin_url('admin.php?page=reader-users&delete_mobile=' . urlencode($row->mobile)) . '" onclick="return confirm(\'Delete this mobile user?\')" style="color:red;">Delete</a>';
            } else {
                // Find WP user by email for delete link
                $user = get_user_by('email', $row->email);
                if ($user) {
                    echo '<a href="' . admin_url('admin.php?page=reader-users&delete_google=' . intval($user->ID)) . '" onclick="return confirm(\'Delete this Google user?\')" style="color:red;">Delete</a>';
                }
            }
            echo '</td>';
            echo '</tr>';
        }
        echo '</tbody></table></div>';
    });
});
