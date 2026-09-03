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

// 1. Criação de tabela MySQL ao ativar o plugin no Hostinger
register_activation_hook(__FILE__, 'p3_create_leads_table');

function p3_create_leads_table() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'p3_leads';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
        name varchar(255) NOT NULL,
        whatsapp varchar(50) NOT NULL,
        email varchar(100),
        objective varchar(150),
        credit_amount varchar(100),
        monthly_installment varchar(100),
        message text,
        status varchar(50) DEFAULT 'Novo',
        notes text,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
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

function p3_render_crm_page() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'p3_leads';
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

// 3. Endpoint REST API nativo para Webhooks de Leads e Instagram Ads no WP Hostinger
add_action('rest_api_init', function () {
    register_rest_route('p3/v1', '/lead', array(
        'methods'             => 'POST',
        'callback'            => 'wp_p3_handle_lead_webhook',
        'permission_callback' => '__return_true'
    ));

    register_rest_route('p3/v1', '/instagram-lead', array(
        'methods'             => 'POST',
        'callback'            => 'wp_p3_handle_lead_webhook',
        'permission_callback' => '__return_true'
    ));
});

function wp_p3_handle_lead_webhook($request) {
    global $wpdb;
    $table = $wpdb->prefix . 'p3_leads';
    $params = $request->get_json_params();

    if (empty($params)) {
        $params = $request->get_params();
    }
    
    $name     = sanitize_text_field($params['name'] ?? 'Lead Sem Nome');
    $whatsapp = sanitize_text_field($params['whatsapp'] ?? '');
    $email    = sanitize_email($params['email'] ?? '');
    $obj      = sanitize_text_field($params['objective'] ?? 'Consórcio');
    $credit   = sanitize_text_field($params['creditAmount'] ?? ($params['credit_amount'] ?? 'A definir'));
    $parcel   = sanitize_text_field($params['monthlyInstallment'] ?? ($params['monthly_installment'] ?? ''));
    $msg      = sanitize_textarea_field($params['message'] ?? 'Cadastrado via formulário / webhook 3P');

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

    return new WP_REST_Response(array('success' => true, 'message' => 'Lead salvo com sucesso no MySQL!'), 200);
}
