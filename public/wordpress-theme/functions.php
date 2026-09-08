<?php
/**
 * Funções e definições do Tema WordPress 3P Patrimônio
 * 100% Otimizado para WordPress e Hospedagem Hostinger (PHP 7.4 / 8.x + LiteSpeed / Apache)
 *
 * @package 3p-patrimonio
 */

if (!defined('ABSPATH')) {
    exit; // Segurança contra acesso direto
}

/**
 * Localizador dinâmico de assets gerados pelo build (CSS e JS)
 * Garante que o tema nunca quebre mesmo se os hashes do build mudarem
 */
function p3_get_theme_asset($extension, $prefix = 'index') {
    $dir = get_template_directory() . '/assets';
    if (!is_dir($dir)) {
        return false;
    }
    $matches = glob($dir . '/' . $prefix . '-*.' . $extension);
    if (!empty($matches)) {
        // Ordena pelo arquivo mais recente
        usort($matches, function($a, $b) {
            return filemtime($b) - filemtime($a);
        });
        return '/assets/' . basename($matches[0]);
    }
    return false;
}

/**
 * Configurações básicas do tema WordPress
 */
function p3_patrimonio_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('elementor'); // Suporte oficial completo ao Elementor Page Builder
    add_theme_support('align-wide');
    add_theme_support('responsive-embeds');
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
        'style',
        'script'
    ));
    add_theme_support('custom-logo');
}
add_action('after_setup_theme', 'p3_patrimonio_setup');

/**
 * Suporte a Elementor Pro Theme Builder e Elementor Header & Footer Builder
 */
function p3_patrimonio_register_elementor_locations($elementor_theme_manager) {
    $elementor_theme_manager->register_all_core_location();
}
add_action('elementor/theme/register_locations', 'p3_patrimonio_register_elementor_locations');

/**
 * Criação automática da tabela de leads no MySQL do Hostinger ao ativar o tema
 */
function p3_patrimonio_ensure_table() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'p3_leads';
    
    // Verifica se a tabela já existe
    if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") !== $table_name) {
        $charset_collate = $wpdb->get_charset_collate();
        $sql = "CREATE TABLE $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            name varchar(255) NOT NULL,
            whatsapp varchar(50) NOT NULL,
            email varchar(100) DEFAULT '',
            objective varchar(150) DEFAULT 'Consórcio',
            credit_amount varchar(100) DEFAULT 'A definir',
            monthly_installment varchar(100) DEFAULT '',
            message text,
            status varchar(50) DEFAULT 'Novo',
            notes text,
            PRIMARY KEY  (id)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
}
add_action('after_switch_theme', 'p3_patrimonio_ensure_table');

/**
 * Enfileira estilos CSS e scripts JS da aplicação 3P Patrimônio
 */
function p3_patrimonio_scripts() {
    $theme_uri = get_template_directory_uri();
    $theme_dir = get_template_directory();

    // 1. CSS Principal compilado do Tailwind/React
    $css_rel = p3_get_theme_asset('css', 'index');
    if ($css_rel && file_exists($theme_dir . $css_rel)) {
        $css_ver = filemtime($theme_dir . $css_rel);
        wp_enqueue_style('p3-main-style', $theme_uri . $css_rel, array(), $css_ver);
    }

    // 2. CSS Padrão do Tema (style.css)
    wp_enqueue_style('p3-theme-style', get_stylesheet_uri(), array(), '1.0.1');

    // 3. Script Principal da Aplicação React 18
    $js_rel = p3_get_theme_asset('js', 'index');
    if ($js_rel && file_exists($theme_dir . $js_rel)) {
        $js_ver = filemtime($theme_dir . $js_rel);
        wp_enqueue_script('p3-main-app', $theme_uri . $js_rel, array(), $js_ver, true);

        // Passa parâmetros do WordPress para o React (URL da REST API, AJAX e Nonce)
        wp_localize_script('p3-main-app', 'P3_DATA', array(
            'site_url'    => home_url(),
            'api_url'     => esc_url_raw(rest_url('p3/v1/lead')),
            'api_leads'   => esc_url_raw(rest_url('p3/v1/leads')),
            'ajax_url'    => admin_url('admin-ajax.php'),
            'ajax_action' => 'p3_submit_lead',
            'nonce'       => wp_create_nonce('wp_rest'),
            'ajax_nonce'  => wp_create_nonce('p3_ajax_lead_action'),
            'whatsapp'    => '5511996876748',
            'theme_url'   => $theme_uri
        ));
    }
}
add_action('wp_enqueue_scripts', 'p3_patrimonio_scripts');

/**
 * Adiciona type="module" e crossorigin para carregar módulos ES6 do Vite no navegador
 */
function p3_patrimonio_script_loader_tag($tag, $handle, $src) {
    if ('p3-main-app' === $handle) {
        return '<script type="module" crossorigin src="' . esc_url($src) . '"></script>' . "\n";
    }
    return $tag;
}
add_filter('script_loader_tag', 'p3_patrimonio_script_loader_tag', 10, 3);

/**
 * Intercepta requisições de /assets/* na raiz e entrega o arquivo diretamente do tema
 * Resolve 100% o carregamento de imagens e mídias no WordPress / Hostinger
 */
function p3_serve_theme_assets() {
    $uri = $_SERVER['REQUEST_URI'] ?? '';
    $path = parse_url($uri, PHP_URL_PATH);
    if ($path && preg_match('#^/assets/(.+\.(png|jpg|jpeg|gif|svg|webp|js|css|woff2?|json))$#i', $path, $matches)) {
        $file_name = basename($matches[1]);
        $theme_assets_dir = get_template_directory() . '/assets/';
        $target_file = $theme_assets_dir . $file_name;
        
        // Se o arquivo exato existir na pasta de assets do tema
        if (file_exists($target_file)) {
            $ext = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));
            $mimes = array(
                'png'   => 'image/png',
                'jpg'   => 'image/jpeg',
                'jpeg'  => 'image/jpeg',
                'svg'   => 'image/svg+xml',
                'webp'  => 'image/webp',
                'gif'   => 'image/gif',
                'css'   => 'text/css',
                'js'    => 'application/javascript',
                'woff2' => 'font/woff2',
            );
            $mime = isset($mimes[$ext]) ? $mimes[$ext] : 'application/octet-stream';
            
            header('Content-Type: ' . $mime);
            header('Content-Length: ' . filesize($target_file));
            header('Cache-Control: public, max-age=31536000');
            header('Access-Control-Allow-Origin: *');
            readfile($target_file);
            exit;
        }
    }
}
add_action('init', 'p3_serve_theme_assets', 1);

/**
 * Endpoint REST API nativo no WordPress para captação direta de leads no Hostinger
 * Rota: /wp-json/p3/v1/lead e /wp-json/p3/v1/leads
 * Inclui cabeçalhos CORS para suportar acessos www vs não-www no Hostinger
 */
function p3_patrimonio_register_rest_routes() {
    register_rest_route('p3/v1', '/lead', array(
        'methods'             => array('POST', 'OPTIONS'),
        'callback'            => 'p3_patrimonio_handle_lead',
        'permission_callback' => '__return_true'
    ));

    register_rest_route('p3/v1', '/leads', array(
        'methods'             => array('GET', 'OPTIONS'),
        'callback'            => 'p3_patrimonio_get_leads',
        'permission_callback' => '__return_true'
    ));

    register_rest_route('p3/v1', '/lead/(?P<id>\d+)', array(
        'methods'             => array('POST', 'PATCH', 'OPTIONS'),
        'callback'            => 'p3_patrimonio_update_lead',
        'permission_callback' => '__return_true'
    ));

    register_rest_route('p3/v1', '/lead/(?P<id>\d+)', array(
        'methods'             => array('DELETE', 'OPTIONS'),
        'callback'            => 'p3_patrimonio_delete_lead',
        'permission_callback' => '__return_true'
    ));

    register_rest_route('p3/v1', '/instagram-lead', array(
        'methods'             => array('POST', 'OPTIONS'),
        'callback'            => 'p3_patrimonio_handle_lead',
        'permission_callback' => '__return_true'
    ));
}
add_action('rest_api_init', 'p3_patrimonio_register_rest_routes');

/**
 * Suporte a CORS para Hostinger (evita bloqueios de requisições entre domínios www e sem www)
 */
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE, PATCH');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce, X-Requested-With');
        return $value;
    });
}, 15);

/**
 * Fallback via admin-ajax.php para ambientes Hostinger com ModSecurity ou restrição de REST API
 */
function p3_ajax_handle_lead() {
    check_ajax_referer('p3_ajax_lead_action', 'security', false);
    
    $payload = array(
        'name'                => sanitize_text_field($_POST['name'] ?? ''),
        'whatsapp'            => sanitize_text_field($_POST['whatsapp'] ?? ''),
        'email'               => sanitize_email($_POST['email'] ?? ''),
        'objective'           => sanitize_text_field($_POST['objective'] ?? 'Consórcio'),
        'creditAmount'        => sanitize_text_field($_POST['creditAmount'] ?? ($_POST['credit_amount'] ?? '')),
        'monthlyInstallment'  => sanitize_text_field($_POST['monthlyInstallment'] ?? ($_POST['monthly_installment'] ?? '')),
        'message'             => sanitize_textarea_field($_POST['message'] ?? '')
    );
    
    $fake_request = new WP_REST_Request('POST', '/p3/v1/lead');
    $fake_request->set_body_params($payload);
    
    $response = p3_patrimonio_handle_lead($fake_request);
    $data = $response->get_data();
    
    if ($response->get_status() >= 200 && $response->get_status() < 300) {
        wp_send_json_success($data);
    } else {
        wp_send_json_error($data, $response->get_status());
    }
}
add_action('wp_ajax_nopriv_p3_submit_lead', 'p3_ajax_handle_lead');
add_action('wp_ajax_p3_submit_lead', 'p3_ajax_handle_lead');

function p3_patrimonio_get_leads($request) {
    global $wpdb;
    nocache_headers();
    p3_patrimonio_ensure_table();
    $table = $wpdb->prefix . 'p3_leads';
    $results = $wpdb->get_results("SELECT * FROM $table ORDER BY id DESC");
    $formatted = array();
    if ($results) {
        foreach ($results as $row) {
            $formatted[] = array(
                'id'                  => (string) $row->id,
                'createdAt'           => $row->created_at,
                'name'                => $row->name,
                'whatsapp'            => $row->whatsapp,
                'email'               => $row->email ?? '',
                'objective'           => $row->objective ?? 'Consórcio',
                'creditAmount'        => $row->credit_amount ?? '',
                'monthlyInstallment'  => $row->monthly_installment ?? '',
                'message'             => $row->message ?? '',
                'status'              => $row->status ?? 'Novo',
                'notes'               => $row->notes ?? ''
            );
        }
    }
    return new WP_REST_Response(array('leads' => $formatted, 'total' => count($formatted)), 200);
}

function p3_patrimonio_update_lead($request) {
    global $wpdb;
    p3_patrimonio_ensure_table();
    $table = $wpdb->prefix . 'p3_leads';
    $id = intval($request['id']);
    $params = $request->get_json_params() ?: $request->get_params();
    $data_to_update = array();
    if (isset($params['status'])) {
        $data_to_update['status'] = sanitize_text_field($params['status']);
    }
    if (isset($params['notes'])) {
        $data_to_update['notes'] = sanitize_textarea_field($params['notes']);
    }
    if (!empty($data_to_update)) {
        $wpdb->update($table, $data_to_update, array('id' => $id));
    }
    return new WP_REST_Response(array('success' => true), 200);
}

function p3_patrimonio_delete_lead($request) {
    global $wpdb;
    p3_patrimonio_ensure_table();
    $table = $wpdb->prefix . 'p3_leads';
    $id = intval($request['id']);
    $wpdb->delete($table, array('id' => $id));
    return new WP_REST_Response(array('success' => true), 200);
}

function p3_patrimonio_handle_lead($request) {
    global $wpdb;
    nocache_headers();
    p3_patrimonio_ensure_table();
    $table = $wpdb->prefix . 'p3_leads';
    
    $params = $request->get_json_params();
    if (empty($params)) {
        $params = $request->get_params();
    }

    $name     = sanitize_text_field($params['name'] ?? 'Lead Sem Nome');
    $whatsapp = sanitize_text_field($params['whatsapp'] ?? '');
    $email    = sanitize_email(trim($params['email'] ?? ''));
    $obj      = sanitize_text_field($params['objective'] ?? 'Consórcio');
    $credit   = sanitize_text_field($params['creditAmount'] ?? ($params['credit_amount'] ?? 'A definir'));
    $parcel   = sanitize_text_field($params['monthlyInstallment'] ?? ($params['monthly_installment'] ?? ''));
    $msg      = sanitize_textarea_field($params['message'] ?? 'Cadastrado via 3P Patrimônio Web');

    if (empty($whatsapp)) {
        return new WP_REST_Response(array('success' => false, 'error' => 'WhatsApp obrigatório'), 400);
    }

    // Validação estrita de e-mail
    $is_ebook = ($obj === 'Download de E-book Patrimonial' || ($params['utmSource'] ?? '') === 'ebook_download');
    if ($is_ebook && (empty($email) || !is_email($email))) {
        return new WP_REST_Response(array('success' => false, 'error' => 'Por favor, informe um endereço de e-mail válido para receber o e-book.'), 400);
    }

    if (!empty($email) && !is_email($email)) {
        return new WP_REST_Response(array('success' => false, 'error' => 'Formato de e-mail inválido.'), 400);
    }

    // Bloqueio de domínios descartáveis comuns
    if (!empty($email)) {
        $email_parts = explode('@', $email);
        $domain = end($email_parts);
        $disposable = array('mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'throwawaymail.com', 'yopmail.com', 'sharklasers.com');
        if (in_array(strtolower($domain), $disposable, true)) {
            return new WP_REST_Response(array('success' => false, 'error' => 'Provedores de e-mail temporários não são permitidos para receber o e-book.'), 400);
        }
    }

    $inserted = $wpdb->insert($table, array(
        'created_at'          => current_time('mysql'),
        'name'                => $name,
        'whatsapp'            => $whatsapp,
        'email'               => $email,
        'objective'           => $obj,
        'credit_amount'       => $credit,
        'monthly_installment' => $parcel,
        'message'             => $msg,
        'status'              => 'Novo'
    ));

    if ($inserted === false) {
        return new WP_REST_Response(array('success' => false, 'error' => $wpdb->last_error), 500);
    }

    // Se for e-book e houver e-mail válido, tenta disparar notificação/entrega via wp_mail
    if ($is_ebook && !empty($email) && function_exists('wp_mail')) {
        $site_name = get_bloginfo('name') ?: '3P Patrimônio';
        $subject = "Seu E-book 3P Patrimônio: Como Construir Patrimônio Utilizando Consórcios";
        $home = home_url('/#ebook');
        $body_mail = "Olá, {$name}!\n\nSeu exemplar exclusivo do e-book oficial 'Como Construir Patrimônio Utilizando Consórcios', de autoria de Carlos Yoshimori, foi liberado com sucesso.\n\nVocê pode acessá-lo e fazer o download do PDF completo no link:\n{$home}\n\nFicamos à disposição para tirar dúvidas e apresentar simulações patrimoniais personalizadas.\n\nAtenciosamente,\nCarlos Yoshimori & Equipe 3P Patrimônio\nWhatsApp: (11) 99687-6748";
        @wp_mail($email, $subject, $body_mail);
    }

    return new WP_REST_Response(array('success' => true, 'message' => 'Lead cadastrado com sucesso no MySQL!'), 200);
}

/**
 * Menu Administrativo no WordPress para visualização dos Leads dos Sócios
 * (Ativado se o plugin complementar não estiver ativo)
 */
if (!function_exists('p3_register_admin_menu')) {
    function p3_patrimonio_admin_menu() {
        add_menu_page(
            '3P Patrimônio - Leads',
            '3P Patrimônio',
            'manage_options',
            'p3-leads-manager',
            'p3_patrimonio_render_admin_crm',
            'dashicons-chart-line',
            30
        );
    }
    add_action('admin_menu', 'p3_patrimonio_admin_menu');

    function p3_patrimonio_render_admin_crm() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'p3_leads';
        p3_patrimonio_ensure_table();
        $leads = $wpdb->get_results("SELECT * FROM $table_name ORDER BY id DESC");
        $total = is_array($leads) ? count($leads) : 0;
        
        echo '<div class="wrap" style="font-family: -apple-system, BlinkMacSystemFont, sans-serif;">';
        echo '<div style="background: #020617; padding: 24px; border-radius: 16px; margin-bottom: 24px; border: 1px solid #1e293b; color: #fff;">';
        echo '<div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">';
        echo '<div>';
        echo '<span style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: bold; text-transform: uppercase;">Módulo CRM dos Sócios</span>';
        echo '<h1 style="color: #f8fafc; font-size: 24px; font-weight: 800; margin: 8px 0 4px 0;">🏛️ Painel de Movimentação dos Sócios - 3P Patrimônio</h1>';
        echo '<p style="color: #94a3b8; margin: 0; font-size: 13px;">Hospedado na Hostinger • Banco MySQL • Total de Leads: <strong style="color: #fbbf24;">' . $total . '</strong></p>';
        echo '</div>';
        echo '<a href="https://wa.me/5511996876748" target="_blank" style="background: #f59e0b; color: #020617; font-weight: bold; padding: 10px 18px; border-radius: 10px; text-decoration: none; font-size: 13px;">WhatsApp Consultoria &rarr;</a>';
        echo '</div>';
        echo '</div>';

        echo '<table class="wp-list-table widefat fixed striped" style="border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1;">';
        echo '<thead><tr style="background: #f1f5f9;">';
        echo '<th style="font-weight: 700;">Data</th>';
        echo '<th style="font-weight: 700;">Nome</th>';
        echo '<th style="font-weight: 700;">WhatsApp</th>';
        echo '<th style="font-weight: 700;">Objetivo</th>';
        echo '<th style="font-weight: 700;">Crédito</th>';
        echo '<th style="font-weight: 700;">Parcela</th>';
        echo '<th style="font-weight: 700;">Status</th>';
        echo '</tr></thead>';
        echo '<tbody>';

        if ($total > 0) {
            foreach ($leads as $l) {
                $whats_clean = preg_replace('/[^0-9]/', '', $l->whatsapp);
                echo '<tr>';
                echo '<td><small style="color:#64748b;">' . esc_html($l->created_at) . '</small></td>';
                echo '<td><strong>' . esc_html($l->name) . '</strong></td>';
                echo '<td><a href="https://wa.me/' . esc_attr($whats_clean) . '" target="_blank" style="color: #059669; font-weight: 600; text-decoration: none;">📱 ' . esc_html($l->whatsapp) . '</a></td>';
                echo '<td>' . esc_html($l->objective) . '</td>';
                echo '<td><strong style="color: #0284c7;">' . esc_html($l->credit_amount) . '</strong></td>';
                echo '<td>' . esc_html($l->monthly_installment ?? '-') . '</td>';
                echo '<td><span style="background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 9999px; font-weight: bold; font-size: 11px;">' . esc_html($l->status) . '</span></td>';
                echo '</tr>';
            }
        } else {
            echo '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #64748b;">Nenhum lead capturado ainda. Os novos contatos cadastrados no site aparecerão aqui automaticamente.</td></tr>';
        }

        echo '</tbody></table>';
        echo '</div>';
    }
}

/**
 * Shortcodes para uso com o Elementor (Widgets e Blocos)
 */

// 1. Aplicação Completa 3P Patrimônio [p3_app] ou [lp_3p_patrimonio]
function p3_patrimonio_app_shortcode($atts) {
    ob_start();
    ?>
    <div id="p3-elementor-app-container" class="w-full">
        <div id="root">
            <noscript>
                <div style="padding: 30px; text-align: center; color: #fff; background: #020617;">
                    <p>Por favor habilite o JavaScript para interagir com os recursos do 3P Patrimônio.</p>
                </div>
            </noscript>
        </div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('p3_app', 'p3_patrimonio_app_shortcode');
add_shortcode('lp_3p_patrimonio', 'p3_patrimonio_app_shortcode');

// 2. Botão de Conversão WhatsApp Oficial [p3_whatsapp]
function p3_patrimonio_whatsapp_shortcode($atts) {
    $a = shortcode_atts(array(
        'phone'   => '5511996876748',
        'text'    => 'Falar com Carlos Yoshimori no WhatsApp',
        'message' => 'Olá Carlos Yoshimori, conheci o 3P Patrimônio e gostaria de conversar sobre estratégia de consórcio.'
    ), $atts);

    $url = 'https://wa.me/' . preg_replace('/[^0-9]/', '', $a['phone']) . '?text=' . rawurlencode($a['message']);
    
    return '<a href="' . esc_url($url) . '" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: #f59e0b; color: #020617; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; padding: 14px 28px; border-radius: 12px; text-decoration: none; box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.3); transition: all 0.2s ease;">
        <span style="font-size: 18px;">📱</span> ' . esc_html($a['text']) . ' &rarr;
    </a>';
}
add_shortcode('p3_whatsapp', 'p3_patrimonio_whatsapp_shortcode');

// 3. Card de Apresentação dos Sócios [p3_socios]
function p3_patrimonio_socios_shortcode($atts) {
    $img_url = get_template_directory_uri() . '/assets/socios.png';
    return '<div style="background: #020617; border: 1px solid #1e293b; border-radius: 16px; padding: 24px; max-width: 500px; margin: 20px auto; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
        <div style="display: flex; align-items: center; gap: 16px;">
            <img src="' . esc_url($img_url) . '" alt="Carlos Yoshimori e Sócios" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #f59e0b;" />
            <div>
                <span style="color: #fbbf24; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em;">Consultoria Executiva</span>
                <h3 style="margin: 4px 0; font-size: 18px; color: #fff;">Carlos Yoshimori</h3>
                <p style="margin: 0; font-size: 13px; color: #94a3b8;">Especialista em Estruturação Patrimonial via Consórcios de Alto Padrão.</p>
            </div>
        </div>
    </div>';
}
add_shortcode('p3_socios', 'p3_patrimonio_socios_shortcode');
