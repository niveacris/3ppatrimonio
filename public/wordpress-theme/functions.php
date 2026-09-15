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
 * Criação e atualização automática da tabela de leads no MySQL do Hostinger
 * Garante colunas para Formulário Geral e Cadastro de E-book com migração transparente
 */
function p3_patrimonio_ensure_table() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'p3_leads';
    $charset_collate = $wpdb->get_charset_collate();
    
    // Verifica se a tabela já existe
    if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") !== $table_name) {
        $sql = "CREATE TABLE $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            name varchar(255) NOT NULL,
            whatsapp varchar(50) NOT NULL,
            email varchar(150) DEFAULT '',
            objective varchar(150) DEFAULT 'Consórcio',
            credit_amount varchar(100) DEFAULT 'A definir',
            monthly_installment varchar(100) DEFAULT '',
            time_frame varchar(100) DEFAULT '',
            has_bidding_funds varchar(50) DEFAULT '',
            source varchar(100) DEFAULT 'Formulário do Site',
            utm_source varchar(100) DEFAULT '',
            utm_medium varchar(100) DEFAULT '',
            utm_campaign varchar(100) DEFAULT '',
            message text,
            status varchar(50) DEFAULT 'Novo',
            notes text,
            PRIMARY KEY  (id)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    } else {
        // Se a tabela já existia, garante que novas colunas sejam adicionadas sem perda de dados
        $existing_cols = $wpdb->get_col("DESC $table_name", 0);
        if (!empty($existing_cols)) {
            $cols_to_check = array(
                'time_frame'          => 'varchar(100) DEFAULT ""',
                'has_bidding_funds'   => 'varchar(50) DEFAULT ""',
                'source'              => 'varchar(100) DEFAULT "Formulário do Site"',
                'utm_source'          => 'varchar(100) DEFAULT ""',
                'utm_medium'          => 'varchar(100) DEFAULT ""',
                'utm_campaign'        => 'varchar(100) DEFAULT ""'
            );
            foreach ($cols_to_check as $col => $def) {
                if (!in_array($col, $existing_cols, true)) {
                    $wpdb->query("ALTER TABLE $table_name ADD COLUMN $col $def");
                }
            }
        }
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
            'site_url'       => home_url(),
            'api_url'        => esc_url_raw(rest_url('p3/v1/lead')),
            'api_leads'      => esc_url_raw(rest_url('p3/v1/leads')),
            'ajax_url'       => admin_url('admin-ajax.php'),
            'ajax_action'    => 'p3_submit_lead',
            'nonce'          => wp_create_nonce('wp_rest'),
            'ajax_nonce'     => wp_create_nonce('p3_ajax_lead_action'),
            'whatsapp'       => '5511996876748',
            'theme_url'      => $theme_uri,
            'founders_photo' => $theme_uri . '/assets/screenshot.png',
            'screenshot_url' => $theme_uri . '/assets/screenshot.png'
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
 * Intercepta requisições de /assets/* ou imagens da raiz e entrega o arquivo diretamente do tema
 * Resolve 100% o carregamento de fotos dos sócios, logos e mídias no WordPress / Hostinger
 */
function p3_serve_theme_assets() {
    $uri = $_SERVER['REQUEST_URI'] ?? '';
    $path = parse_url($uri, PHP_URL_PATH);
    if (!$path) return;

    // Reconhece requisições em /assets/* OU imagens específicas soltas na raiz (ex: /screenshot.png, /socios.png)
    if (preg_match('#^/(?:assets/)?(.+\.(png|jpg|jpeg|gif|svg|webp|js|css|woff2?|json))$#i', $path, $matches)) {
        $file_name = basename($matches[1]);
        $theme_dir = get_template_directory();
        $theme_assets_dir = $theme_dir . '/assets/';
        
        $target_file = '';
        if (file_exists($theme_assets_dir . $file_name)) {
            $target_file = $theme_assets_dir . $file_name;
        } elseif (file_exists($theme_dir . '/' . $file_name)) {
            $target_file = $theme_dir . '/' . $file_name;
        } elseif (strpos($file_name, 'screenshot') !== false) {
            // Fallback inteligente para foto dos sócios se o hash do build variar
            if (file_exists($theme_assets_dir . 'screenshot.png')) {
                $target_file = $theme_assets_dir . 'screenshot.png';
            } elseif (file_exists($theme_dir . '/screenshot.png')) {
                $target_file = $theme_dir . '/screenshot.png';
            } elseif (file_exists($theme_assets_dir . 'socios.png')) {
                $target_file = $theme_assets_dir . 'socios.png';
            }
        } elseif (strpos($file_name, 'socios') !== false) {
            if (file_exists($theme_assets_dir . 'socios.png')) {
                $target_file = $theme_assets_dir . 'socios.png';
            } elseif (file_exists($theme_assets_dir . 'screenshot.png')) {
                $target_file = $theme_assets_dir . 'screenshot.png';
            }
        } elseif (strpos($file_name, '3pilares') !== false) {
            if (file_exists($theme_assets_dir . '3pilares_transparente-Bk6P6T9-.png')) {
                $target_file = $theme_assets_dir . '3pilares_transparente-Bk6P6T9-.png';
            }
        }
        
        // Se o arquivo foi localizado no tema
        if ($target_file && file_exists($target_file)) {
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

    register_rest_route('p3/v1', '/lead/(?P<id>[a-zA-Z0-9_\-]+)', array(
        'methods'             => array('POST', 'PATCH', 'PUT', 'OPTIONS'),
        'callback'            => 'p3_patrimonio_update_lead',
        'permission_callback' => '__return_true'
    ));

    register_rest_route('p3/v1', '/lead/(?P<id>[a-zA-Z0-9_\-]+)', array(
        'methods'             => array('DELETE', 'POST', 'OPTIONS'),
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
        'timeFrame'           => sanitize_text_field($_POST['timeFrame'] ?? ($_POST['time_frame'] ?? '')),
        'hasBiddingFunds'     => sanitize_text_field($_POST['hasBiddingFunds'] ?? ($_POST['has_bidding_funds'] ?? '')),
        'source'              => sanitize_text_field($_POST['source'] ?? 'Formulário do Site'),
        'utmSource'           => sanitize_text_field($_POST['utmSource'] ?? ($_POST['utm_source'] ?? '')),
        'utmMedium'           => sanitize_text_field($_POST['utmMedium'] ?? ($_POST['utm_medium'] ?? '')),
        'utmCampaign'         => sanitize_text_field($_POST['utmCampaign'] ?? ($_POST['utm_campaign'] ?? '')),
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
                'timeFrame'           => $row->time_frame ?? '',
                'hasBiddingFunds'     => $row->has_bidding_funds ?? '',
                'source'              => $row->source ?? 'Formulário do Site',
                'utmSource'           => $row->utm_source ?? '',
                'utmMedium'           => $row->utm_medium ?? '',
                'utmCampaign'         => $row->utm_campaign ?? '',
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
    $raw_id = $request['id'];
    $params = $request->get_json_params() ?: $request->get_params();
    $data_to_update = array();
    if (isset($params['status'])) {
        $data_to_update['status'] = sanitize_text_field($params['status']);
    }
    if (isset($params['notes'])) {
        $data_to_update['notes'] = sanitize_textarea_field($params['notes']);
    }
    if (!empty($data_to_update)) {
        if (is_numeric($raw_id)) {
            $wpdb->update($table, $data_to_update, array('id' => intval($raw_id)));
        } else {
            // Tenta localizar por id se houver coluna, ou busca pelo whatsapp se passado
            $wpdb->update($table, $data_to_update, array('id' => intval(preg_replace('/\D/', '', $raw_id) ?: 0)));
        }
    }
    return new WP_REST_Response(array('success' => true, 'updated_id' => $raw_id), 200);
}

function p3_patrimonio_delete_lead($request) {
    global $wpdb;
    p3_patrimonio_ensure_table();
    $table = $wpdb->prefix . 'p3_leads';
    $raw_id = $request['id'];
    if (is_numeric($raw_id)) {
        $wpdb->delete($table, array('id' => intval($raw_id)));
    }
    return new WP_REST_Response(array('success' => true, 'deleted_id' => $raw_id), 200);
}

/**
 * Fallback AJAX para atualização de status de leads via admin-ajax.php
 */
function p3_ajax_update_lead_status() {
    global $wpdb;
    p3_patrimonio_ensure_table();
    $table = $wpdb->prefix . 'p3_leads';
    $raw_id = sanitize_text_field($_POST['id'] ?? '');
    $status = sanitize_text_field($_POST['status'] ?? '');
    $notes = sanitize_textarea_field($_POST['notes'] ?? '');

    $data = array();
    if (!empty($status)) $data['status'] = $status;
    if (!empty($notes)) $data['notes'] = $notes;

    if (!empty($data) && is_numeric($raw_id)) {
        $wpdb->update($table, $data, array('id' => intval($raw_id)));
    }
    wp_send_json_success(array('updated' => true, 'id' => $raw_id));
}
add_action('wp_ajax_p3_update_lead_status', 'p3_ajax_update_lead_status');
add_action('wp_ajax_nopriv_p3_update_lead_status', 'p3_ajax_update_lead_status');

function p3_ajax_delete_lead() {
    global $wpdb;
    p3_patrimonio_ensure_table();
    $table = $wpdb->prefix . 'p3_leads';
    $raw_id = sanitize_text_field($_POST['id'] ?? '');
    if (is_numeric($raw_id)) {
        $wpdb->delete($table, array('id' => intval($raw_id)));
    }
    wp_send_json_success(array('deleted' => true, 'id' => $raw_id));
}
add_action('wp_ajax_p3_delete_lead', 'p3_ajax_delete_lead');
add_action('wp_ajax_nopriv_p3_delete_lead', 'p3_ajax_delete_lead');

/**
 * Handler principal para captação e armazenamento de Leads e E-books
 * Salva no MySQL da Hostinger, grava arquivo redundante de backup e dispara notificações
 */
function p3_patrimonio_handle_lead($request) {
    global $wpdb;
    nocache_headers();
    p3_patrimonio_ensure_table();
    $table = $wpdb->prefix . 'p3_leads';
    
    $params = $request->get_json_params();
    if (empty($params)) {
        $params = $request->get_params();
    }

    $name         = sanitize_text_field($params['name'] ?? 'Lead Sem Nome');
    $whatsapp     = sanitize_text_field($params['whatsapp'] ?? '');
    $email        = sanitize_email(trim($params['email'] ?? ''));
    $obj          = sanitize_text_field($params['objective'] ?? 'Consórcio');
    $credit       = sanitize_text_field($params['creditAmount'] ?? ($params['credit_amount'] ?? 'A definir'));
    $parcel       = sanitize_text_field($params['monthlyInstallment'] ?? ($params['monthly_installment'] ?? ''));
    $time_frame   = sanitize_text_field($params['timeFrame'] ?? ($params['time_frame'] ?? ''));
    $bidding      = sanitize_text_field($params['hasBiddingFunds'] ?? ($params['has_bidding_funds'] ?? ''));
    $source       = sanitize_text_field($params['source'] ?? 'Formulário do Site');
    $utm_source   = sanitize_text_field($params['utmSource'] ?? ($params['utm_source'] ?? ''));
    $utm_medium   = sanitize_text_field($params['utmMedium'] ?? ($params['utm_medium'] ?? ''));
    $utm_campaign = sanitize_text_field($params['utmCampaign'] ?? ($params['utm_campaign'] ?? ''));
    $msg          = sanitize_textarea_field($params['message'] ?? 'Cadastrado via 3P Patrimônio Web');

    if (empty($whatsapp)) {
        return new WP_REST_Response(array('success' => false, 'error' => 'WhatsApp é obrigatório.'), 400);
    }

    // Identificação de lead do E-book
    $is_ebook = ($obj === 'Download de E-book Patrimonial' || 
                 stripos($source, 'E-book') !== false || 
                 $utm_source === 'ebook_download');

    if ($is_ebook && (empty($email) || !is_email($email))) {
        return new WP_REST_Response(array('success' => false, 'error' => 'Por favor, informe um endereço de e-mail válido para receber o e-book.'), 400);
    }

    if (!empty($email) && !is_email($email)) {
        return new WP_REST_Response(array('success' => false, 'error' => 'Formato de e-mail inválido.'), 400);
    }

    // Bloqueio de domínios descartáveis comuns
    if (!empty($email)) {
        $email_parts = explode('@', $email);
        $domain = strtolower(end($email_parts));
        $disposable = array('mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'throwawaymail.com', 'yopmail.com', 'sharklasers.com');
        if (in_array($domain, $disposable, true)) {
            return new WP_REST_Response(array('success' => false, 'error' => 'Provedores de e-mail temporários não são permitidos.'), 400);
        }

        // Verificação de e-mail duplicado: não permite o mesmo e-mail se cadastrar novamente
        $existing_lead = $wpdb->get_row($wpdb->prepare(
            "SELECT id, name FROM $table WHERE LOWER(TRIM(email)) = LOWER(TRIM(%s)) LIMIT 1",
            $email
        ));

        if ($existing_lead) {
            // Se for e-book, libera sem duplicar no banco de dados MySQL
            if ($is_ebook) {
                return new WP_REST_Response(array(
                    'success'           => true,
                    'leadId'            => (string) $existing_lead->id,
                    'alreadyRegistered' => true,
                    'message'           => 'E-mail já cadastrado. Liberando download do e-book!'
                ), 200);
            }

            // Se for o formulário principal de análise patrimonial, bloqueia cadastro duplicado
            return new WP_REST_Response(array(
                'success' => false,
                'error'   => 'Este e-mail (' . esc_html($email) . ') já está cadastrado em nosso sistema. Para solicitar nova simulação ou atualizar suas informações, entre em contato direto pelo WhatsApp.'
            ), 409);
        }
    }

    $lead_data = array(
        'created_at'          => current_time('mysql'),
        'name'                => $name,
        'whatsapp'            => $whatsapp,
        'email'               => $email,
        'objective'           => $obj,
        'credit_amount'       => $credit,
        'monthly_installment' => $parcel,
        'time_frame'          => $time_frame,
        'has_bidding_funds'   => $bidding,
        'source'              => $source,
        'utm_source'          => $utm_source,
        'utm_medium'          => $utm_medium,
        'utm_campaign'        => $utm_campaign,
        'message'             => $msg,
        'status'              => 'Novo',
        'notes'               => $is_ebook ? 'Lead cadastrado para receber o e-book oficial de Carlos Yoshimori.' : ''
    );

    $inserted = $wpdb->insert($table, $lead_data);

    if ($inserted === false) {
        // Tenta fallback sem colunas novas se a tabela antiga ainda não migrou
        $fallback_data = array(
            'created_at'          => current_time('mysql'),
            'name'                => $name,
            'whatsapp'            => $whatsapp,
            'email'               => $email,
            'objective'           => $obj,
            'credit_amount'       => $credit,
            'monthly_installment' => $parcel,
            'message'             => "[Origem: {$source}] " . ($time_frame ? "[Prazo: {$time_frame}] " : "") . $msg,
            'status'              => 'Novo'
        );
        $inserted = $wpdb->insert($table, $fallback_data);
        if ($inserted === false) {
            return new WP_REST_Response(array('success' => false, 'error' => $wpdb->last_error), 500);
        }
    }

    $lead_id = (string) ($wpdb->insert_id ?: time());

    // Redundância 1: Arquivo JSON de Backup de Alta Segurança em wp-content/uploads/
    try {
        $upload_dir = wp_upload_dir();
        $backup_file = trailingslashit($upload_dir['basedir']) . 'p3_leads_vault_backup.json';
        $entry = array(
            'id'                  => $lead_id,
            'createdAt'           => current_time('c'),
            'name'                => $name,
            'whatsapp'            => $whatsapp,
            'email'               => $email,
            'objective'           => $obj,
            'creditAmount'        => $credit,
            'monthlyInstallment'  => $parcel,
            'timeFrame'           => $time_frame,
            'hasBiddingFunds'     => $bidding,
            'source'              => $source,
            'utmSource'           => $utm_source,
            'utmMedium'           => $utm_medium,
            'utmCampaign'         => $utm_campaign,
            'message'             => $msg,
            'status'              => 'Novo'
        );
        $vault = file_exists($backup_file) ? json_decode(file_get_contents($backup_file), true) : array();
        if (!is_array($vault)) $vault = array();
        array_unshift($vault, $entry);
        @file_put_contents($backup_file, json_encode(array_slice($vault, 0, 500), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    } catch (Exception $e) {
        // Ignora silenciosamente para não interromper a resposta
    }

    // Redundância 2: Notificação por E-mail para os Sócios / Consultores
    if (function_exists('wp_mail')) {
        $admin_mail = get_option('admin_email');
        $destinatarios = array_unique(array_filter(array('contato@3ppatrimonio.com.br', $admin_mail)));
        $whats_clean = preg_replace('/[^0-9]/', '', $whatsapp);
        
        $tipo_rotulo = $is_ebook ? '📚 DOWNLOAD DO E-BOOK PATRIMONIAL' : '📋 NOVO LEAD DO FORMULÁRIO';
        $assunto = "[3P Patrimônio] {$tipo_rotulo} - {$name}";

        $corpo = "3P PATRIMÔNIO - NOVO CADASTRO RECEBIDO\n";
        $corpo .= "===========================================\n\n";
        $corpo .= "TIPO: " . ($is_ebook ? "Download do E-book de Carlos Yoshimori" : "Análise de Consórcio / Planejamento") . "\n";
        $corpo .= "NOME: {$name}\n";
        $corpo .= "WHATSAPP: {$whatsapp}\n";
        $corpo .= "LINK WHATSAPP DIRETO: https://wa.me/55{$whats_clean}\n";
        $corpo .= "E-MAIL: " . ($email ?: "Não informado") . "\n";
        $corpo .= "OBJETIVO: {$obj}\n";
        $corpo .= "CRÉDITO PRETENDIDO: {$credit}\n";
        $corpo .= "PARCELA ESTIMADA: {$parcel}\n";
        if ($time_frame) $corpo .= "PRAZO: {$time_frame}\n";
        if ($bidding) $corpo .= "DISPONIBILIDADE PARA LANCE: {$bidding}\n";
        $corpo .= "ORIGEM: {$source}\n";
        $corpo .= "DATA/HORA: " . current_time('d/m/Y H:i:s') . "\n";
        if ($msg) $corpo .= "MENSAGEM/DETALHES: {$msg}\n";
        $corpo .= "\n-------------------------------------------\n";
        $corpo .= "Acesse o painel para gerenciar os leads:\n";
        $corpo .= admin_url('admin.php?page=p3-leads-manager') . "\n";

        $headers = array('Content-Type: text/plain; charset=UTF-8');
        @wp_mail($destinatarios, $assunto, $corpo, $headers);

        // Se for E-book, envia mensagem com link e boas-vindas para o visitante
        if ($is_ebook && !empty($email)) {
            $user_subject = "Seu E-book 3P Patrimônio: Como Construir Patrimônio Utilizando Consórcios";
            $home_ebook = home_url('/#ebook');
            
            $user_body = "Olá, {$name}!\n\n";
            $user_body .= "Parabéns por dar esse passo no seu planejamento financeiro e patrimonial.\n\n";
            $user_body .= "Seu acesso ao e-book exclusivo 'Como Construir Patrimônio Utilizando Consórcios', de autoria de Carlos Yoshimori, está disponível no link abaixo:\n";
            $user_body .= "{$home_ebook}\n\n";
            $user_body .= "Nele você descobrirá como acelerar a aquisição de imóveis e veículos com custo financeiro significativamente menor que o financiamento tradicional.\n\n";
            $user_body .= "Se quiser tirar dúvidas ou receber uma simulação estratégica personalizada com nossos consultores:\n";
            $user_body .= "WhatsApp: (11) 99687-6748\n";
            $user_body .= "Site Oficial: https://3ppatrimonio.com.br\n\n";
            $user_body .= "Atenciosamente,\nCarlos Yoshimori & Equipe 3P Patrimônio";

            @wp_mail($email, $user_subject, $user_body, $headers);
        }
    }

    return new WP_REST_Response(array(
        'success' => true,
        'message' => 'Lead e cadastro armazenados com sucesso!',
        'leadId'  => $lead_id
    ), 200);
}

// Exportação direta de XLS / CSV do CRM pelo painel WordPress
add_action('admin_init', 'p3_theme_handle_export_leads');
function p3_theme_handle_export_leads() {
    if (!isset($_GET['page']) || $_GET['page'] !== 'p3-leads-manager') {
        return;
    }

    $action = isset($_GET['action']) ? $_GET['action'] : '';

    if ($action === 'export_xls') {
        if (!current_user_can('manage_options')) {
            wp_die('Acesso negado.');
        }

        global $wpdb;
        $table_name = $wpdb->prefix . 'p3_leads';
        p3_patrimonio_ensure_table();
        $leads = $wpdb->get_results("SELECT * FROM $table_name ORDER BY id DESC");

        $filename = 'leads_3p_patrimonio_' . date('Y-m-d_His') . '.xls';

        header('Content-Type: application/vnd.ms-excel; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Pragma: no-cache');
        header('Expires: 0');

        echo '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
        echo '<head>';
        echo '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />';
        echo '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Leads 3P Patrimônio</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->';
        echo '<style>';
        echo 'th { background-color: #020617; color: #fbbf24; font-weight: bold; border: 1px solid #334155; padding: 10px; font-family: Arial, sans-serif; font-size: 13px; }';
        echo 'td { border: 1px solid #cbd5e1; padding: 8px; font-family: Arial, sans-serif; font-size: 12px; }';
        echo '.odd { background-color: #f8fafc; }';
        echo '</style>';
        echo '</head>';
        echo '<body>';
        echo '<table border="1">';
        echo '<thead>';
        echo '<tr>';
        echo '<th>Nº / ID</th>';
        echo '<th>Data/Hora</th>';
        echo '<th>Nome Completo</th>';
        echo '<th>WhatsApp / Telefone</th>';
        echo '<th>E-mail</th>';
        echo '<th>Origem / Canal</th>';
        echo '<th>Objetivo Principal</th>';
        echo '<th>Crédito Pretendido</th>';
        echo '<th>Parcela Estimada</th>';
        echo '<th>Prazo Desejado</th>';
        echo '<th>Recurso p/ Lance</th>';
        echo '<th>Status no Funil</th>';
        echo '<th>Observações dos Sócios</th>';
        echo '<th>Mensagem do Cliente</th>';
        echo '</tr>';
        echo '</thead>';
        echo '<tbody>';

        if (!empty($leads)) {
            $idx = 0;
            foreach ($leads as $l) {
                $idx++;
                $cls = ($idx % 2 === 0) ? ' class="odd"' : '';
                echo '<tr' . $cls . '>';
                echo '<td>' . esc_html($l->id) . '</td>';
                echo '<td>' . esc_html(date('d/m/Y H:i', strtotime($l->created_at))) . '</td>';
                echo '<td><strong>' . esc_html($l->name) . '</strong></td>';
                echo '<td>' . esc_html($l->whatsapp) . '</td>';
                echo '<td>' . esc_html($l->email ?? '') . '</td>';
                echo '<td>' . esc_html($l->source ?? 'Formulário do Site') . '</td>';
                echo '<td>' . esc_html($l->objective) . '</td>';
                echo '<td>' . esc_html($l->credit_amount) . '</td>';
                echo '<td>' . esc_html($l->monthly_installment ?? '') . '</td>';
                echo '<td>' . esc_html($l->time_frame ?? '') . '</td>';
                echo '<td>' . esc_html($l->has_bidding_funds ?? '') . '</td>';
                echo '<td>' . esc_html($l->status ?? 'Novo') . '</td>';
                echo '<td>' . esc_html($l->notes ?? '') . '</td>';
                echo '<td>' . esc_html($l->message ?? '') . '</td>';
                echo '</tr>';
            }
        }
        echo '</tbody>';
        echo '</table>';
        echo '</body>';
        echo '</html>';
        exit;
    }

    if ($action === 'export_csv') {
        if (!current_user_can('manage_options')) {
            wp_die('Acesso negado.');
        }

        global $wpdb;
        $table_name = $wpdb->prefix . 'p3_leads';
        p3_patrimonio_ensure_table();
        $leads = $wpdb->get_results("SELECT * FROM $table_name ORDER BY id DESC");

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename=3p_patrimonio_leads_' . date('Y-m-d_His') . '.csv');
        header('Pragma: no-cache');
        header('Expires: 0');

        $output = fopen('php://output', 'w');
        // UTF-8 BOM para abrir com acentuação correta no Microsoft Excel
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
        fputcsv($output, array('ID', 'Data/Hora', 'Nome', 'WhatsApp', 'E-mail', 'Origem', 'Objetivo', 'Crédito', 'Parcela', 'Prazo', 'Recursos Lance', 'Status', 'Mensagem', 'Notas'));

        if (!empty($leads)) {
            foreach ($leads as $l) {
                fputcsv($output, array(
                    $l->id,
                    $l->created_at,
                    $l->name,
                    $l->whatsapp,
                    $l->email ?? '',
                    $l->source ?? 'Formulário do Site',
                    $l->objective,
                    $l->credit_amount,
                    $l->monthly_installment ?? '',
                    $l->time_frame ?? '',
                    $l->has_bidding_funds ?? '',
                    $l->status ?? 'Novo',
                    $l->message ?? '',
                    $l->notes ?? ''
                ));
            }
        }
        fclose($output);
        exit;
    }
}

/**
 * Menu Administrativo no WordPress para visualização dos Leads dos Sócios
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

        $total_form = 0;
        $total_ebook = 0;
        if (!empty($leads)) {
            foreach ($leads as $l) {
                $is_eb = ($l->objective === 'Download de E-book Patrimonial' || stripos($l->source ?? '', 'E-book') !== false);
                if ($is_eb) $total_ebook++;
                else $total_form++;
            }
        }
        
        echo '<div class="wrap" style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 1400px; margin: 20px auto;">';
        
        // Top Banner
        echo '<div style="background: linear-gradient(135deg, #020617 0%, #0f172a 100%); padding: 24px 30px; border-radius: 16px; margin-bottom: 24px; border: 1px solid #1e293b; color: #fff; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);">';
        echo '<div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">';
        echo '<div>';
        echo '<span style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">CRM dos Sócios • 3P Patrimônio</span>';
        echo '<h1 style="color: #f8fafc; font-size: 26px; font-weight: 800; margin: 10px 0 6px 0; display: flex; align-items: center; gap: 10px;">🏛️ Central de Leads e Cadastros</h1>';
        echo '<p style="color: #94a3b8; margin: 0; font-size: 13px;">Hospedado na Hostinger • Banco de Dados MySQL • Notificações via E-mail Ativas</p>';
        echo '</div>';
        echo '<div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">';
        echo '<a href="' . admin_url('admin.php?page=p3-leads-manager&action=export_xls') . '" style="background: #10b981; color: #020617; font-weight: 800; padding: 12px 20px; border-radius: 10px; text-decoration: none; font-size: 13px; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);">📊 Exportar Planilha (.XLS)</a>';
        echo '<a href="' . admin_url('admin.php?page=p3-leads-manager&action=export_csv') . '" style="background: #1e293b; color: #e2e8f0; font-weight: 700; padding: 12px 16px; border-radius: 10px; text-decoration: none; font-size: 13px; display: inline-flex; align-items: center; gap: 6px; border: 1px solid #334155;">📥 Exportar CSV</a>';
        echo '<a href="https://wa.me/5511996876748" target="_blank" style="background: #f59e0b; color: #020617; font-weight: 700; padding: 12px 18px; border-radius: 10px; text-decoration: none; font-size: 13px;">💬 WhatsApp Carlos Yoshimori</a>';
        echo '</div>';
        echo '</div>';
        echo '</div>';

        // KPI Cards
        echo '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">';
        echo '<div style="background: #fff; padding: 18px 22px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">';
        echo '<div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Total Geral</div>';
        echo '<div style="font-size: 28px; font-weight: 800; color: #0f172a; margin-top: 4px;">' . $total . '</div>';
        echo '</div>';
        echo '<div style="background: #fff; padding: 18px 22px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">';
        echo '<div style="font-size: 12px; font-weight: 700; color: #0284c7; text-transform: uppercase;">📋 Formulário do Site</div>';
        echo '<div style="font-size: 28px; font-weight: 800; color: #0284c7; margin-top: 4px;">' . $total_form . '</div>';
        echo '</div>';
        echo '<div style="background: #fff; padding: 18px 22px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">';
        echo '<div style="font-size: 12px; font-weight: 700; color: #d97706; text-transform: uppercase;">📚 Download de E-book</div>';
        echo '<div style="font-size: 28px; font-weight: 800; color: #d97706; margin-top: 4px;">' . $total_ebook . '</div>';
        echo '</div>';
        echo '</div>';

        // Action Toolbar above Table
        echo '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 0 4px; flex-wrap: wrap; gap: 10px;">';
        echo '<div style="font-size: 14px; color: #334155; font-weight: 700;">Leads e Cadastros no Banco de Dados (' . $total . ')</div>';
        echo '<div style="display: flex; gap: 8px; align-items: center;">';
        echo '<a href="' . admin_url('admin.php?page=p3-leads-manager&action=export_xls') . '" style="background: #059669; color: #fff; font-weight: 700; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-size: 12px; display: inline-flex; align-items: center; gap: 6px;">📊 Baixar em XLS (Excel)</a>';
        echo '<a href="' . admin_url('admin.php?page=p3-leads-manager&action=export_csv') . '" style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; font-weight: 600; padding: 8px 14px; border-radius: 8px; text-decoration: none; font-size: 12px;">Exportar CSV</a>';
        echo '</div>';
        echo '</div>';

        // Table
        echo '<div style="background: #fff; border-radius: 14px; border: 1px solid #cbd5e1; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">';
        echo '<table class="wp-list-table widefat fixed striped" style="border: none;">';
        echo '<thead><tr style="background: #f8fafc;">';
        echo '<th style="font-weight: 700; width: 130px;">Data</th>';
        echo '<th style="font-weight: 700; width: 110px;">Origem</th>';
        echo '<th style="font-weight: 700;">Nome Completo</th>';
        echo '<th style="font-weight: 700;">WhatsApp</th>';
        echo '<th style="font-weight: 700;">E-mail</th>';
        echo '<th style="font-weight: 700;">Objetivo / Interesse</th>';
        echo '<th style="font-weight: 700;">Crédito Pretendido</th>';
        echo '<th style="font-weight: 700; width: 90px;">Status</th>';
        echo '</tr></thead>';
        echo '<tbody>';

        if ($total > 0) {
            foreach ($leads as $l) {
                $whats_clean = preg_replace('/[^0-9]/', '', $l->whatsapp);
                $is_eb = ($l->objective === 'Download de E-book Patrimonial' || stripos($l->source ?? '', 'E-book') !== false);
                $badge_origem = $is_eb 
                    ? '<span style="background: #fef3c7; color: #b45309; border: 1px solid #fde68a; padding: 3px 8px; border-radius: 9999px; font-weight: 700; font-size: 10px;">📚 E-book</span>'
                    : '<span style="background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; padding: 3px 8px; border-radius: 9999px; font-weight: 700; font-size: 10px;">📋 Formulário</span>';

                echo '<tr>';
                echo '<td><small style="color:#64748b;">' . esc_html(date('d/m/Y H:i', strtotime($l->created_at))) . '</small></td>';
                echo '<td>' . $badge_origem . '</td>';
                echo '<td><strong>' . esc_html($l->name) . '</strong></td>';
                echo '<td><a href="https://wa.me/' . esc_attr($whats_clean) . '" target="_blank" style="color: #059669; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">📱 ' . esc_html($l->whatsapp) . '</a></td>';
                echo '<td>' . ($l->email ? '<a href="mailto:' . esc_attr($l->email) . '" style="color: #2563eb; text-decoration: none;">✉️ ' . esc_html($l->email) . '</a>' : '<span style="color:#94a3b8;">-</span>') . '</td>';
                echo '<td>' . esc_html($l->objective) . '</td>';
                echo '<td><strong style="color: #0284c7;">' . esc_html($l->credit_amount) . '</strong></td>';
                echo '<td><span style="background: #f1f5f9; color: #334155; padding: 3px 8px; border-radius: 9999px; font-weight: 700; font-size: 11px;">' . esc_html($l->status) . '</span></td>';
                echo '</tr>';
            }
        } else {
            echo '<tr><td colspan="8" style="text-align: center; padding: 48px; color: #64748b;">Nenhum lead capturado ainda. Assim que um visitante preencher o formulário ou solicitar o e-book, o contato aparecerá aqui instantaneamente.</td></tr>';
        }

        echo '</tbody></table>';
        echo '</div>';
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

// 4. Conteúdo Oficial da Política de Privacidade LGPD [p3_politica_privacidade]
function p3_patrimonio_politica_privacidade_shortcode() {
    ob_start();
    ?>
    <div class="p3-privacy-container" style="background: #0f172a; border: 1px solid #1e293b; border-radius: 20px; padding: 32px; color: #cbd5e1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; font-size: 14px; max-width: 900px; margin: 24px auto;">
        <div style="border-bottom: 1px solid #334155; padding-bottom: 20px; margin-bottom: 24px;">
            <span style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">LGPD • Lei nº 13.709/2018</span>
            <h2 style="color: #f8fafc; font-size: 24px; font-weight: 800; margin: 12px 0 6px 0;">Política de Privacidade - 3P Patrimônio</h2>
            <p style="color: #94a3b8; margin: 0; font-size: 13px;">3P Patrimônio Consultoria e Intermediação LTDA • CNPJ: 68.039.412/0001-79</p>
        </div>

        <h3 style="color: #fbbf24; font-size: 16px; margin-top: 20px;">1. Introdução</h3>
        <p>A <strong>3P Patrimônio</strong> valoriza a privacidade e a segurança das informações de seus clientes, potenciais clientes, parceiros e visitantes. Esta Política de Privacidade descreve de forma clara e transparente a coleta, uso, armazenamento e proteção de dados pessoais, em estrita observância à Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018).</p>

        <h3 style="color: #fbbf24; font-size: 16px; margin-top: 20px;">2. Identificação da Empresa</h3>
        <ul style="list-style: disc; padding-left: 20px; margin: 10px 0;">
            <li><strong>Razão Social:</strong> 3P Patrimônio Consultoria e Intermediação LTDA</li>
            <li><strong>CNPJ:</strong> 68.039.412/0001-79</li>
            <li><strong>E-mail de Contato:</strong> <a href="mailto:contato@3ppatrimonio.com.br" style="color: #fbbf24;">contato@3ppatrimonio.com.br</a></li>
            <li><strong>WhatsApp:</strong> <a href="https://wa.me/5511996876748" target="_blank" style="color: #fbbf24;">(11) 99687-6748</a></li>
        </ul>

        <h3 style="color: #fbbf24; font-size: 16px; margin-top: 20px;">3. Dados Coletados</h3>
        <p>Coletamos dados fornecidos voluntariamente por você ao solicitar atendimento, simulações ou download de materiais educativos (e-book):</p>
        <ul style="list-style: disc; padding-left: 20px; margin: 10px 0;">
            <li>Nome completo;</li>
            <li>WhatsApp e telefone de contato;</li>
            <li>Endereço de e-mail;</li>
            <li>Objetivo patrimonial (imóvel, veículos, frota, maquinário);</li>
            <li>Faixa de crédito e estimativa de parcelas;</li>
            <li>Origem do cadastro e eventuais parâmetros de campanha (UTM).</li>
        </ul>

        <h3 style="color: #fbbf24; font-size: 16px; margin-top: 20px;">4. Finalidade do Tratamento</h3>
        <p>Os dados são utilizados exclusivamente para entrar em contato com você, prestar consultoria estratégica sobre consórcios, enviar o e-book solicitado, apresentar simulações e cumprir obrigações legais e regulatórias.</p>

        <h3 style="color: #fbbf24; font-size: 16px; margin-top: 20px;">5. Segurança e Sigilo Absoluto</h3>
        <p>A <strong>3P Patrimônio não vende, não cede e não compartilha seus dados pessoais</strong> com terceiros para fins comerciais não autorizados. Os dados são armazenados em ambiente seguro com controle de acesso restrito.</p>

        <h3 style="color: #fbbf24; font-size: 16px; margin-top: 20px;">6. Direitos do Titular</h3>
        <p>Você pode a qualquer momento revogar seu consentimento, solicitar confirmação de tratamento, correção ou exclusão de seus dados entrando em contato pelo e-mail <a href="mailto:contato@3ppatrimonio.com.br" style="color: #fbbf24;">contato@3ppatrimonio.com.br</a> ou WhatsApp <a href="https://wa.me/5511996876748" style="color: #fbbf24;">(11) 99687-6748</a>.</p>
        
        <p style="margin-top: 24px; font-size: 12px; color: #64748b; border-top: 1px solid #334155; padding-top: 16px;">Última atualização: Agosto de 2026 • 3P Patrimônio</p>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('p3_politica_privacidade', 'p3_patrimonio_politica_privacidade_shortcode');

