<?php
/**
 * Funções e definições do Tema WordPress 3P Patrimônio
 *
 * @package 3p-patrimonio
 */

if (!defined('ABSPATH')) {
    exit; // Segurança contra acesso direto
}

/**
 * Configurações básicas do tema
 */
function p3_patrimonio_setup() {
    // Suporte a título dinâmico pelo WordPress
    add_theme_support('title-tag');

    // Suporte a imagem destacada
    add_theme_support('post-thumbnails');

    // Suporte a tags HTML5
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
        'style',
        'script'
    ));

    // Suporte a logotipo customizado
    add_theme_support('custom-logo', array(
        'height'      => 100,
        'width'       => 400,
        'flex-height' => true,
        'flex-width'  => true,
    ));
}
add_action('after_setup_theme', 'p3_patrimonio_setup');

/**
 * Enfileira estilos CSS e scripts JS da aplicação 3P Patrimônio
 */
function p3_patrimonio_scripts() {
    $theme_uri = get_template_directory_uri();
    $theme_dir = get_template_directory();

    // 1. CSS Principal do Tailwind e componentes da 3P Patrimônio
    $css_file = '/assets/index-BTk7EaV_.css';
    $css_ver = file_exists($theme_dir . $css_file) ? filemtime($theme_dir . $css_file) : '1.0.0';
    wp_enqueue_style('p3-main-style', $theme_uri . $css_file, array(), $css_ver);

    // 2. CSS Padrão do Tema (style.css)
    wp_enqueue_style('p3-theme-style', get_stylesheet_uri(), array('p3-main-style'), '1.0.0');

    // 3. Script Principal da Aplicação React 18 (Simulador, Áreas Restritas, Modais)
    $js_file = '/assets/index-BwgTa3RM.js';
    $js_ver = file_exists($theme_dir . $js_file) ? filemtime($theme_dir . $js_file) : '1.0.0';
    
    wp_enqueue_script('p3-main-app', $theme_uri . $js_file, array(), $js_ver, true);

    // Passar dados da API do WordPress para o Javascript se necessário
    wp_localize_script('p3-main-app', 'P3_DATA', array(
        'site_url'  => home_url(),
        'ajax_url'  => admin_url('admin-ajax.php'),
        'nonce'     => wp_create_nonce('p3_nonce'),
        'whatsapp'  => '5511996876748',
        'theme_url' => $theme_uri
    ));
}
add_action('wp_enqueue_scripts', 'p3_patrimonio_scripts');

/**
 * Adiciona o atributo type="module" e crossorigin ao script principal para suportar ES Modules no navegador
 */
function p3_patrimonio_script_loader_tag($tag, $handle, $src) {
    if ('p3-main-app' === $handle) {
        return '<script type="module" crossorigin src="' . esc_url($src) . '"></script>' . "\n";
    }
    return $tag;
}
add_filter('script_loader_tag', 'p3_patrimonio_script_loader_tag', 10, 3);

/**
 * Shortcode opcional para incorporar a landing page em qualquer post/página existente: [lp_3p_patrimonio]
 */
function p3_patrimonio_shortcode() {
    ob_start();
    ?>
    <div id="p3-wordpress-wrapper" class="w-full">
        <div id="root"></div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('lp_3p_patrimonio', 'p3_patrimonio_shortcode');
