<?php
/**
 * Plugin Name: 3P Patrimônio Leads Manager (Hostinger Ready)
 * Plugin URI: https://3ppatrimonio.com.br
 * Description: Plugin customizado para captação de leads e área de movimentação dos sócios no WordPress Hostinger.
 * Version: 1.0.1
 * Author: 3P Patrimônio & Consultoria
 * License: GPL2
 */

if (!defined('ABSPATH')) {
    exit; // Segurança contra acesso direto
}

// 1. Criação e atualização de tabela MySQL ao ativar o plugin no Hostinger
register_activation_hook(__FILE__, 'p3_create_leads_table');

function p3_create_leads_table() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'p3_leads';
    $charset_collate = $wpdb->get_charset_collate();

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

// 2. Adiciona Menu "3P Patrimônio - Leads" no Painel WordPress
add_action('admin_menu', 'p3_register_admin_menu');

function p3_register_admin_menu() {
    add_menu_page(
        '3P Patrimônio - Leads',
        '3P Patrimônio',
        'manage_options',
        'p3-leads-manager',
        'p3_render_crm_page',
        'dashicons-chart-line',
        30
    );
}

// Handler de exportação CSV para os sócios
add_action('admin_init', 'p3_handle_export_csv');
function p3_handle_export_csv() {
    if (isset($_GET['page']) && $_GET['page'] === 'p3-leads-manager' && isset($_GET['action']) && $_GET['action'] === 'export_csv') {
        if (!current_user_can('manage_options')) {
            wp_die('Acesso negado.');
        }

        global $wpdb;
        $table_name = $wpdb->prefix . 'p3_leads';
        p3_create_leads_table();
        $leads = $wpdb->get_results("SELECT * FROM $table_name ORDER BY id DESC");

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename=3p_patrimonio_leads_' . date('Y-m-d_His') . '.csv');
        header('Pragma: no-cache');
        header('Expires: 0');

        $output = fopen('php://output', 'w');
        // Adiciona BOM para UTF-8 no Excel
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

function p3_render_crm_page() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'p3_leads';
    p3_create_leads_table();
    $leads = $wpdb->get_results("SELECT * FROM $table_name ORDER BY id DESC");
    $total = is_array($leads) ? count($leads) : 0;
    $export_url = admin_url('admin.php?page=p3-leads-manager&action=export_csv');

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
    
    echo '<div style="background: linear-gradient(135deg, #020617 0%, #0f172a 100%); padding: 24px 30px; border-radius: 16px; margin-bottom: 24px; border: 1px solid #1e293b; color: #fff; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);">';
    echo '<div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">';
    echo '<div>';
    echo '<span style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Plugin 3P Patrimônio • CRM Ativo</span>';
    echo '<h1 style="color: #f8fafc; font-size: 26px; font-weight: 800; margin: 10px 0 6px 0;">🏛️ Painel de Movimentação dos Sócios</h1>';
    echo '<p style="color: #94a3b8; margin: 0; font-size: 13px;">Hospedado na Hostinger • Banco MySQL • Total de Leads: <strong style="color: #fbbf24;">' . $total . '</strong></p>';
    echo '</div>';
    echo '<div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">';
    echo '<a href="' . esc_url($export_url) . '" style="background: #10b981; color: #020617; font-weight: 700; padding: 10px 18px; border-radius: 10px; text-decoration: none; font-size: 13px; display: inline-flex; align-items: center; gap: 6px;">📥 Exportar Planilha Excel (CSV)</a>';
    echo '<a href="https://wa.me/5511996876748" target="_blank" style="background: #f59e0b; color: #020617; font-weight: 700; padding: 10px 18px; border-radius: 10px; text-decoration: none; font-size: 13px;">💬 WhatsApp Consultoria</a>';
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
        echo '<tr><td colspan="8" style="text-align: center; padding: 48px; color: #64748b;">Nenhum lead capturado ainda. Os novos contatos cadastrados no site aparecerão aqui automaticamente.</td></tr>';
    }

    echo '</tbody></table>';
    echo '</div>';
    echo '</div>';
}

// 3. Endpoint REST API nativo para Webhooks de Leads e Instagram Ads no WP Hostinger
add_action('rest_api_init', function () {
    register_rest_route('p3/v1', '/lead', array(
        'methods'             => array('POST', 'OPTIONS'),
        'callback'            => 'wp_p3_handle_lead_webhook',
        'permission_callback' => '__return_true'
    ));

    register_rest_route('p3/v1', '/instagram-lead', array(
        'methods'             => array('POST', 'OPTIONS'),
        'callback'            => 'wp_p3_handle_lead_webhook',
        'permission_callback' => '__return_true'
    ));
});

// Suporte a CORS para Hostinger no Plugin
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce, X-Requested-With');
        return $value;
    });
}, 15);

function wp_p3_handle_lead_webhook($request) {
    global $wpdb;
    nocache_headers();
    p3_create_leads_table();
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
    $msg          = sanitize_textarea_field($params['message'] ?? 'Cadastrado via formulário / webhook 3P');

    if (empty($whatsapp)) {
        return new WP_REST_Response(array('success' => false, 'error' => 'WhatsApp obrigatório'), 400);
    }

    $is_ebook = ($obj === 'Download de E-book Patrimonial' || 
                 stripos($source, 'E-book') !== false || 
                 $utm_source === 'ebook_download');

    if ($is_ebook && (empty($email) || !is_email($email))) {
        return new WP_REST_Response(array('success' => false, 'error' => 'Por favor, informe um endereço de e-mail válido para receber o e-book.'), 400);
    }

    if (!empty($email) && !is_email($email)) {
        return new WP_REST_Response(array('success' => false, 'error' => 'Formato de e-mail inválido.'), 400);
    }

    // Bloqueio de e-mails descartáveis
    if (!empty($email)) {
        $email_parts = explode('@', $email);
        $domain = strtolower(end($email_parts));
        $disposable = array('mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'throwawaymail.com', 'yopmail.com', 'sharklasers.com');
        if (in_array($domain, $disposable, true)) {
            return new WP_REST_Response(array('success' => false, 'error' => 'Provedores de e-mail temporários não são permitidos para receber o e-book.'), 400);
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
        // Fallback para schema antigo se necessário
        $inserted = $wpdb->insert($table, array(
            'created_at'          => current_time('mysql'),
            'name'                => $name,
            'whatsapp'            => $whatsapp,
            'email'               => $email,
            'objective'           => $obj,
            'credit_amount'       => $credit,
            'monthly_installment' => $parcel,
            'message'             => "[Origem: {$source}] " . ($time_frame ? "[Prazo: {$time_frame}] " : "") . $msg,
            'status'              => 'Novo'
        ));
        if ($inserted === false) {
            return new WP_REST_Response(array('success' => false, 'error' => $wpdb->last_error), 500);
        }
    }

    $lead_id = (string) ($wpdb->insert_id ?: time());

    // Redundância JSON em arquivo local
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
    } catch (Exception $e) {}

    // Notificação por e-mail para os consultores
    if (function_exists('wp_mail')) {
        $admin_mail = get_option('admin_email');
        $destinatarios = array_unique(array_filter(array('contato@3ppatrimonio.com.br', $admin_mail)));
        $whats_clean = preg_replace('/[^0-9]/', '', $whatsapp);
        $tag_tipo = $is_ebook ? '📚 DOWNLOAD DO E-BOOK PATRIMONIAL' : '📋 NOVO LEAD DO FORMULÁRIO';
        $assunto = "[3P Patrimônio] {$tag_tipo} - {$name}";

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

        // Boas-vindas para o lead com o e-book
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

// Shortcodes para o Elementor (compatível com qualquer tema)
if (!shortcode_exists('p3_whatsapp')) {
    add_shortcode('p3_whatsapp', function ($atts) {
        $a = shortcode_atts(array(
            'phone'   => '5511996876748',
            'text'    => 'Falar com Carlos Yoshimori no WhatsApp',
            'message' => 'Olá Carlos Yoshimori, conheci o 3P Patrimônio e gostaria de conversar sobre estratégia de consórcio.'
        ), $atts);

        $url = 'https://wa.me/' . preg_replace('/[^0-9]/', '', $a['phone']) . '?text=' . rawurlencode($a['message']);
        
        return '<a href="' . esc_url($url) . '" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: #f59e0b; color: #020617; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; padding: 14px 28px; border-radius: 12px; text-decoration: none; box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.3); transition: all 0.2s ease;">
            <span style="font-size: 18px;">📱</span> ' . esc_html($a['text']) . ' &rarr;
        </a>';
    });
}

if (!shortcode_exists('p3_app')) {
    add_shortcode('p3_app', function () {
        return '<div id="p3-elementor-app-container" class="w-full"><div id="root"></div></div>';
    });
}

if (!shortcode_exists('p3_politica_privacidade')) {
    add_shortcode('p3_politica_privacidade', function () {
        ob_start();
        ?>
        <div class="p3-privacy-container" style="background: #0f172a; border: 1px solid #1e293b; border-radius: 20px; padding: 32px; color: #cbd5e1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; font-size: 14px; max-width: 900px; margin: 24px auto;">
            <div style="border-bottom: 1px solid #334155; padding-bottom: 20px; margin-bottom: 24px;">
                <span style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">LGPD • Lei nº 13.709/2018</span>
                <h2 style="color: #f8fafc; font-size: 24px; font-weight: 800; margin: 12px 0 6px 0;">Política de Privacidade - 3P Patrimônio</h2>
                <p style="color: #94a3b8; margin: 0; font-size: 13px;">3P Patrimônio Consultoria e Intermediação LTDA • CNPJ: 68.039.412/0001-79</p>
            </div>

            <h3 style="color: #fbbf24; font-size: 16px; margin-top: 20px;">1. Introdução</h3>
            <p>A <strong>3P Patrimônio</strong> valoriza a privacidade e a segurança das informações de seus clientes, parceiros e visitantes. Esta Política de Privacidade descreve de forma clara a coleta, uso, armazenamento e proteção de dados pessoais, em conformidade com a LGPD (Lei nº 13.709/2018).</p>

            <h3 style="color: #fbbf24; font-size: 16px; margin-top: 20px;">2. Identificação da Empresa</h3>
            <ul style="list-style: disc; padding-left: 20px; margin: 10px 0;">
                <li><strong>Razão Social:</strong> 3P Patrimônio Consultoria e Intermediação LTDA</li>
                <li><strong>CNPJ:</strong> 68.039.412/0001-79</li>
                <li><strong>E-mail de Contato:</strong> <a href="mailto:contato@3ppatrimonio.com.br" style="color: #fbbf24;">contato@3ppatrimonio.com.br</a></li>
                <li><strong>WhatsApp:</strong> <a href="https://wa.me/5511996876748" target="_blank" style="color: #fbbf24;">(11) 99687-6748</a></li>
            </ul>

            <h3 style="color: #fbbf24; font-size: 16px; margin-top: 20px;">3. Dados Coletados</h3>
            <p>Coletamos dados fornecidos voluntariamente por você ao solicitar atendimento, simulações ou download de materiais educativos (e-book): Nome, WhatsApp, e-mail, objetivo de consórcio, faixa de crédito pretendida e estimativa de parcelas.</p>

            <h3 style="color: #fbbf24; font-size: 16px; margin-top: 20px;">4. Finalidade do Tratamento</h3>
            <p>Os dados são utilizados exclusivamente para entrar em contato com você, prestar consultoria estratégica personalizada, enviar o e-book solicitado e apresentar propostas adequadas aos seus objetivos.</p>

            <h3 style="color: #fbbf24; font-size: 16px; margin-top: 20px;">5. Segurança e Sigilo Absoluto</h3>
            <p>A <strong>3P Patrimônio não vende, não cede e não transfere seus dados pessoais</strong> para terceiros para finalidades comerciais não autorizadas.</p>

            <h3 style="color: #fbbf24; font-size: 16px; margin-top: 20px;">6. Direitos do Titular</h3>
            <p>Você pode a qualquer momento revogar consentimento ou solicitar exclusão de dados pelo e-mail <a href="mailto:contato@3ppatrimonio.com.br" style="color: #fbbf24;">contato@3ppatrimonio.com.br</a> ou WhatsApp <a href="https://wa.me/5511996876748" style="color: #fbbf24;">(11) 99687-6748</a>.</p>
        </div>
        <?php
        return ob_get_clean();
    });
}


