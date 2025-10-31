<?php
// Add this to your theme's functions.php or a custom plugin
add_action('graphql_register_types', function() {
    register_graphql_field('User', 'linkedin_url', [
        'type' => 'String',
        'description' => __('LinkedIn URL', 'your-textdomain'),
        'resolve' => function($user) {
            return get_user_meta($user->userId, 'linkedin_url', true);
        }
    ]);
    register_graphql_field('User', 'facebook_url', [
        'type' => 'String',
        'description' => __('Facebook URL', 'your-textdomain'),
        'resolve' => function($user) {
            return get_user_meta($user->userId, 'facebook_url', true);
        }
    ]);
    register_graphql_field('User', 'twitter_url', [
        'type' => 'String',
        'description' => __('Twitter URL', 'your-textdomain'),
        'resolve' => function($user) {
            return get_user_meta($user->userId, 'twitter_url', true);
        }
    ]);
});
