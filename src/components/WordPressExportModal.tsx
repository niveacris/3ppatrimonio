import React, { useState } from 'react';
import { X, Globe, Download, Copy, Check, Server, FileCode, Database, Cpu, ExternalLink, ShieldAlert, Sparkles, Layers, GitBranch, AlertTriangle, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface WordPressExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WordPressExportModal: React.FC<WordPressExportModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'theme_zip' | 'guide' | 'php_template' | 'wp_plugin' | 'elementor' | 'github'>('github');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const wpTemplateCode = `<?php
/**
 * Template Name: 3P Patrimônio - Landing Page & CRM
 * Description: Template exclusivo preparado para WordPress e hospedagem Hostinger.
 */

get_header(); ?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3P Patrimônio - Consultoria Estratégica em Consórcios</title>
  <!-- Tailwind CSS via CDN para WordPress -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            amber: { 400: '#f59e0b', 500: '#d97706' }
          }
        }
      }
    }
  </script>
</head>
<body class="bg-slate-950 text-slate-100 font-sans antialiased">

  <div id="wp-3p-patrimonio-root">
    <!-- O formulário abaixo envia leads diretamente para o MySQL do WordPress no Hostinger -->
    <?php
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['wp_3p_submit'])) {
      global $wpdb;
      $table_name = $wpdb->prefix . 'p3_leads';
      
      $name = sanitize_text_field($_POST['name']);
      $whatsapp = sanitize_text_field($_POST['whatsapp']);
      $email = sanitize_email($_POST['email']);
      $objective = sanitize_text_field($_POST['objective']);
      $credit = sanitize_text_field($_POST['credit']);
      $installment = sanitize_text_field($_POST['installment']);
      $message = sanitize_textarea_field($_POST['message']);

      $wpdb->insert(
        $table_name,
        array(
          'created_at' => current_time('mysql'),
          'name' => $name,
          'whatsapp' => $whatsapp,
          'email' => $email,
          'objective' => $objective,
          'credit_amount' => $credit,
          'monthly_installment' => $installment,
          'message' => $message,
          'status' => 'Novo'
        )
      );

      echo '<div class="bg-emerald-500/20 border border-emerald-500 text-emerald-300 p-4 rounded-2xl text-center font-bold my-4">
              Solicitação recebida com sucesso no Hostinger WordPress! Um sócio entrará em contato.
            </div>';
    }
    ?>

    <!-- Conteúdo Principal Exibido com Estilo Bento Grid 3P Patrimônio -->
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div class="text-center space-y-4">
        <h1 class="text-4xl font-black text-white">ESTRATÉGIA PATRIMONIAL COM CONSÓRCIOS</h1>
        <p class="text-slate-400">Consultoria de Consórcios para Investidores - 3P Patrimônio</p>
      </div>
    </div>
  </div>

</body>
</html>

<?php get_footer(); ?>`;

  const wpPluginCode = `<?php
/**
 * Plugin Name: 3P Patrimônio Leads Manager (Hostinger Ready)
 * Plugin URI: https://3ppatrimonio.com.br
 * Description: Plugin customizado para captação de leads e área de movimentação dos sócios no WordPress Hostinger.
 * Version: 1.0.0
 * Author: 3P Patrimônio
 */

if (!defined('ABSPATH')) exit;

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

// 2.1 Ação de Exportar para XLS no WordPress
add_action('admin_init', 'p3_handle_export_xls_leads');
function p3_handle_export_xls_leads() {
  if (isset($_GET['page']) && $_GET['page'] === 'p3-leads-manager' && isset($_GET['action']) && $_GET['action'] === 'export_xls') {
    if (!current_user_can('manage_options')) wp_die('Acesso negado');
    global $wpdb;
    $table_name = $wpdb->prefix . 'p3_leads';
    $leads = $wpdb->get_results("SELECT * FROM $table_name ORDER BY id DESC");
    $filename = 'leads_3p_patrimonio_' . date('Y-m-d') . '.xls';
    header('Content-Type: application/vnd.ms-excel; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    echo '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">';
    echo '<head><meta charset="UTF-8"><style>th{background:#020617;color:#fbbf24;padding:8px;border:1px solid #334155;}td{padding:6px;border:1px solid #cbd5e1;}</style></head><body>';
    echo '<table border="1"><thead><tr><th>ID</th><th>Data</th><th>Nome</th><th>WhatsApp</th><th>E-mail</th><th>Objetivo</th><th>Crédito</th><th>Parcela</th><th>Status</th><th>Notas</th></tr></thead><tbody>';
    foreach ($leads as $l) {
      echo '<tr><td>' . esc_html($l->id) . '</td><td>' . esc_html($l->created_at) . '</td><td>' . esc_html($l->name) . '</td><td>' . esc_html($l->whatsapp) . '</td><td>' . esc_html($l->email ?? '') . '</td><td>' . esc_html($l->objective) . '</td><td>' . esc_html($l->credit_amount) . '</td><td>' . esc_html($l->monthly_installment ?? '') . '</td><td>' . esc_html($l->status) . '</td><td>' . esc_html($l->notes ?? '') . '</td></tr>';
    }
    echo '</tbody></table></body></html>';
    exit;
  }
}

function p3_render_crm_page() {
  global $wpdb;
  $table_name = $wpdb->prefix . 'p3_leads';
  $leads = $wpdb->get_results("SELECT * FROM $table_name ORDER BY id DESC");
  $total = is_array($leads) ? count($leads) : 0;
  
  echo '<div class="wrap">';
  echo '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; margin:20px 0; gap:12px;">';
  echo '<div>';
  echo '<h1 style="color:#d97706; margin:0;">🏛️ Central de Leads dos Sócios - 3P Patrimônio</h1>';
  echo '<p style="margin:4px 0 0 0; color:#64748b;">Hospedado no Hostinger WordPress • Total de Leads: <strong>' . $total . '</strong></p>';
  echo '</div>';
  echo '<a href="' . admin_url('admin.php?page=p3-leads-manager&action=export_xls') . '" style="background:#10b981; color:#020617; font-weight:800; padding:10px 18px; border-radius:8px; text-decoration:none; display:inline-flex; align-items:center; gap:6px; box-shadow:0 2px 8px rgba(16,185,129,0.3);">📊 Exportar Planilha (.XLS)</a>';
  echo '</div>';
  echo '<table class="wp-list-table widefat fixed striped">';
  echo '<thead><tr><th>Data</th><th>Nome</th><th>WhatsApp</th><th>E-mail</th><th>Objetivo</th><th>Crédito</th><th>Status</th></tr></thead>';
  echo '<tbody>';
  if ($total > 0) {
    foreach ($leads as $l) {
      echo '<tr>';
      echo '<td>' . esc_html($l->created_at) . '</td>';
      echo '<td><strong>' . esc_html($l->name) . '</strong></td>';
      echo '<td>' . esc_html($l->whatsapp) . '</td>';
      echo '<td>' . esc_html($l->email ?? '-') . '</td>';
      echo '<td>' . esc_html($l->objective) . '</td>';
      echo '<td>' . esc_html($l->credit_amount) . '</td>';
      echo '<td><span style="background:#fef3c7; color:#92400e; padding:3px 8px; border-radius:12px; font-weight:bold;">' . esc_html($l->status) . '</span></td>';
      echo '</tr>';
    }
  } else {
    echo '<tr><td colspan="7" style="text-align:center; padding: 20px;">Nenhum lead capturado ainda.</td></tr>';
  }
  echo '</tbody></table>';
  echo '</div>';
}

// 3. Endpoint REST API nativo para Webhooks do Instagram Ads no WP Hostinger
add_action('rest_api_init', function () {
  register_rest_route('p3/v1', '/instagram-lead', array(
    'methods' => 'POST',
    'callback' => 'wp_p3_handle_instagram_webhook',
    'permission_callback' => '__return_true'
  ));
});

function wp_p3_handle_instagram_webhook($request) {
  global $wpdb;
  $table = $wpdb->prefix . 'p3_leads';
  $params = $request->get_json_params();
  
  $wpdb->insert($table, array(
    'created_at' => current_time('mysql'),
    'name' => sanitize_text_field($params['name'] ?? 'Lead Instagram'),
    'whatsapp' => sanitize_text_field($params['whatsapp'] ?? ''),
    'email' => sanitize_email($params['email'] ?? ''),
    'objective' => sanitize_text_field($params['objective'] ?? 'Instagram Ads'),
    'credit_amount' => sanitize_text_field($params['creditAmount'] ?? 'A definir'),
    'message' => 'Recebido via Instagram Webhook no Hostinger WP',
    'status' => 'Novo'
  ));
  return new WP_REST_Response(array('success' => true, 'message' => 'Lead do Instagram salvo no MySQL!'), 200);
}`;

  const handleCopy = (code: string, tabKey: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(tabKey);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-950/80 hover:bg-slate-800 rounded-full transition-all border border-slate-800"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-amber-400">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-amber-500/30">
                EXPORTAÇÃO HOSTINGER & WORDPRESS
              </span>
              <h2 className="text-xl font-black text-white tracking-tight">
                Preparado para WordPress / Hostinger
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>Compatível com hPanel, PHP 8.2 & MySQL</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('theme_zip')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'theme_zip'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>📦 Baixar Tema WordPress (.ZIP)</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'guide'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>1. Guia Hostinger (Passo a Passo)</span>
          </button>

          <button
            onClick={() => setActiveTab('php_template')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'php_template'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>2. Arquivos PHP do Tema</span>
          </button>

          <button
            onClick={() => setActiveTab('wp_plugin')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'wp_plugin'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>3. Plugin MySQL de Leads (.php)</span>
          </button>

          <button
            onClick={() => setActiveTab('elementor')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'elementor'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>4. Integração Elementor</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'github'
                ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/40'
                : 'bg-slate-950 text-amber-400 hover:text-amber-300 border border-amber-500/40'
            }`}
          >
            <GitBranch className="w-4 h-4 text-amber-400" />
            <span>5. GitHub & Hostinger (Sem Erros)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          
          {/* TAB 0: TEMA WORDPRESS COMPLETO (.ZIP) */}
          {activeTab === 'theme_zip' && (
            <div className="space-y-6 text-xs text-slate-300">
              <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Cópia 100% Idêntica em PHP & WordPress
                  </div>
                  <h3 className="text-lg font-black text-white">
                    Tema Oficial 3P Patrimônio para WordPress
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    Pacote completo pronto para upload no painel do WordPress. Contém os arquivos nativos 
                    <code className="text-amber-400 font-mono mx-1">style.css</code>, 
                    <code className="text-amber-400 font-mono mx-1">index.php</code>, 
                    <code className="text-amber-400 font-mono mx-1">header.php</code>, 
                    <code className="text-amber-400 font-mono mx-1">footer.php</code>, 
                    <code className="text-amber-400 font-mono mx-1">functions.php</code> e 
                    <code className="text-amber-400 font-mono mx-1">page-landing.php</code> com todos os assets compilados.
                  </p>
                </div>
                
                <a
                  href="/3p-patrimonio-tema-wordpress.zip"
                  download="3p-patrimonio-tema-wordpress.zip"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3.5 rounded-xl shadow-lg shadow-amber-500/30 transition-all transform hover:scale-105 flex items-center gap-2.5 shrink-0 text-sm"
                >
                  <Download className="w-5 h-5" />
                  <span>Baixar Tema (.ZIP)</span>
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <div className="text-amber-400 font-bold text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center font-mono text-xs">1</span>
                    Instalação em 1 Clique
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    No painel do WordPress, vá em <strong>Aparência &rarr; Temas &rarr; Adicionar Novo &rarr; Enviar Tema</strong> e selecione o arquivo <code>3p-patrimonio-tema-wordpress.zip</code>.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <div className="text-amber-400 font-bold text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center font-mono text-xs">2</span>
                    Ativar no WordPress
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Clique em <strong>Ativar</strong>. O WordPress passará a exibir o site exatamente como está aqui: design executivo, simulador de cotas e botão WhatsApp.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <div className="text-amber-400 font-bold text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center font-mono text-xs">3</span>
                    Hostinger Otimizado
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Totalmente compatível com LiteSpeed Cache, PHP 8.1 / 8.2 / 8.3 e banco de dados MySQL padrão da Hostinger.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-6 text-xs text-slate-300">
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-amber-300 text-sm">Hospedagem Hostinger + WordPress</h4>
                  <p className="text-slate-300 mt-1">
                    Esta aplicação React foi totalmente estruturada para rodar como **Landing Page NBR de Alta Conversão**, podendo ser instalada diretamente na sua conta da **Hostinger** com banco de dados MySQL para o controle dos sócios.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Step 1 */}
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center font-mono">1</span>
                    <span>No hPanel da Hostinger</span>
                  </div>
                  <ul className="space-y-2 text-slate-400">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>Acesse seu painel Hostinger (hPanel) e vá em Sites &rarr; Auto Instalador.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>Selecione WordPress e instale na pasta raiz (`public_html`) ou em um subdomínio (ex: `lp.3ppatrimonio.com.br`).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>Ative o SSL Grátis da Hostinger no menu Segurança.</span>
                    </li>
                  </ul>
                </div>

                {/* Step 2 */}
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center font-mono">2</span>
                    <span>Gerenciador de Arquivos</span>
                  </div>
                  <ul className="space-y-2 text-slate-400">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>Abra o Gerenciador de Arquivos (File Manager) na Hostinger.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>Navegue até `wp-content/themes/seu-tema/`.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>Crie o arquivo `page-3p-patrimonio.php` e cole o código da Aba 2.</span>
                    </li>
                  </ul>
                </div>

                {/* Step 3 */}
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center font-mono">3</span>
                    <span>Plugin do Banco MySQL</span>
                  </div>
                  <ul className="space-y-2 text-slate-400">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>Vá em `wp-content/plugins/` e crie a pasta `3p-patrimonio-leads`.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>Salve o arquivo `3p-patrimonio-leads.php` dentro dessa pasta.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>No painel do WordPress, clique em Plugins &rarr; Ativar Plugin 3P Patrimônio.</span>
                    </li>
                  </ul>
                </div>

                {/* Step 4 */}
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center font-mono">4</span>
                    <span>Acesso dos Sócios no WP</span>
                  </div>
                  <ul className="space-y-2 text-slate-400">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>Após ativar o plugin, um menu exclusivo **"3P Patrimônio - Leads"** surgirá no painel do WordPress.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>Os sócios poderão se logar no WordPress com seu usuário/senha e gerenciar a movimentação das propostas!</span>
                    </li>
                  </ul>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: PHP TEMPLATE CODE */}
          {activeTab === 'php_template' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  Arquivo: <code className="text-amber-400 bg-slate-950 px-2 py-0.5 rounded font-mono">page-3p-patrimonio.php</code>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(wpTemplateCode, 'php_template')}
                    className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5"
                  >
                    {copiedCode === 'php_template' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'php_template' ? 'Copiado!' : 'Copiar Código'}</span>
                  </button>

                  <button
                    onClick={() => handleDownloadFile('page-3p-patrimonio.php', wpTemplateCode)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar Arquivo .PHP</span>
                  </button>
                </div>
              </div>

              <pre className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-[11px] font-mono text-amber-200/90 overflow-x-auto max-h-96 leading-relaxed">
                {wpTemplateCode}
              </pre>
            </div>
          )}

          {/* TAB 3: WP PLUGIN CODE */}
          {activeTab === 'wp_plugin' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  Plugin MySQL de Leads: <code className="text-amber-400 bg-slate-950 px-2 py-0.5 rounded font-mono">3p-patrimonio-leads.php</code>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(wpPluginCode, 'wp_plugin')}
                    className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5"
                  >
                    {copiedCode === 'wp_plugin' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'wp_plugin' ? 'Copiado!' : 'Copiar Plugin'}</span>
                  </button>

                  <button
                    onClick={() => handleDownloadFile('3p-patrimonio-leads.php', wpPluginCode)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar Plugin .PHP</span>
                  </button>
                </div>
              </div>

              <pre className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-[11px] font-mono text-emerald-200/90 overflow-x-auto max-h-96 leading-relaxed">
                {wpPluginCode}
              </pre>
            </div>
          )}

          {/* TAB 4: ELEMENTOR */}
          {activeTab === 'elementor' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/30 p-5 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Integração Total com Elementor</span>
                <h4 className="text-base font-extrabold text-white">Como Editar e Atualizar o Site com o Elementor no WordPress</h4>
                <p className="text-slate-300 leading-relaxed">
                  O tema 3P Patrimônio foi configurado com suporte nativo ao <strong>Elementor</strong> e <strong>Elementor Pro</strong>. Ele inclui os templates de largura total e canvas, suporta a função <code className="text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono">the_content()</code> e disponibiliza <strong>Shortcodes Oficiais</strong> para você posicionar qualquer bloco interativo facilmente.
                </p>
              </div>

              {/* Grid de 3 Métodos de Edição no Elementor */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <span className="text-amber-400 font-bold text-xs">MÉTODO 1</span>
                  <h5 className="font-bold text-white text-sm">Editar Qualquer Página</h5>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    No painel do WordPress, vá em <strong>Páginas &rarr; Adicionar Nova</strong> (ou selecione uma existente), escolha o modelo <em>"3P Patrimônio - Elementor Largura Total"</em> e clique em <strong>"Editar com Elementor"</strong>.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <span className="text-amber-400 font-bold text-xs">MÉTODO 2</span>
                  <h5 className="font-bold text-white text-sm">Inserir via Shortcodes</h5>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Arraste o widget de <strong>Shortcode</strong> do Elementor para qualquer coluna ou seção e cole <code className="text-amber-400 font-mono">[p3_app]</code> ou <code className="text-amber-400 font-mono">[p3_whatsapp]</code>.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <span className="text-amber-400 font-bold text-xs">MÉTODO 3</span>
                  <h5 className="font-bold text-white text-sm">Formulários Elementor Pro</h5>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Em formulários criados no Elementor Pro, configure a ação <strong>Webhook</strong> apontando para <code className="text-emerald-400 font-mono">/wp-json/p3/v1/lead</code> para alimentar o CRM dos Sócios no MySQL.
                  </p>
                </div>
              </div>

              {/* Tabela de Shortcodes Disponíveis no Elementor */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-white text-sm">Shortcodes Oficiais Disponíveis no Elementor</h5>
                  <span className="text-[10px] text-slate-400">Clique para copiar</span>
                </div>

                <div className="space-y-2.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                    <div>
                      <span className="text-amber-400 font-bold">[p3_app]</span>
                      <p className="text-slate-400 font-sans text-[11px] mt-0.5">Carrega o aplicativo completo (Simulador, E-book e Análise Patrimonial).</p>
                    </div>
                    <button
                      onClick={() => handleCopy('[p3_app]', 'sc_app')}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-sans transition-colors"
                    >
                      {copiedCode === 'sc_app' ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                    <div>
                      <span className="text-amber-400 font-bold">[p3_whatsapp text="Falar com Carlos Yoshimori no WhatsApp"]</span>
                      <p className="text-slate-400 font-sans text-[11px] mt-0.5">Botão de conversão oficial no WhatsApp com estilo premium e mensagem pré-definida.</p>
                    </div>
                    <button
                      onClick={() => handleCopy('[p3_whatsapp text="Falar com Carlos Yoshimori no WhatsApp"]', 'sc_whats')}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-sans transition-colors"
                    >
                      {copiedCode === 'sc_whats' ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                    <div>
                      <span className="text-amber-400 font-bold">[p3_socios]</span>
                      <p className="text-slate-400 font-sans text-[11px] mt-0.5">Card de apresentação institucional de Carlos Yoshimori e dos sócios fundadores.</p>
                    </div>
                    <button
                      onClick={() => handleCopy('[p3_socios]', 'sc_socios')}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-sans transition-colors"
                    >
                      {copiedCode === 'sc_socios' ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Modelos de Página Disponíveis */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                <h5 className="font-bold text-white text-xs">Modelos de Página Incluídos no Tema:</h5>
                <ul className="space-y-1.5 text-slate-400 text-[11px]">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    <span><strong>3P Patrimônio - Elementor Largura Total (Full Width):</strong> Mantém o cabeçalho e rodapé do tema com área de design livre no Elementor.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    <span><strong>3P Patrimônio - Elementor Canvas:</strong> Tela 100% limpa (sem cabeçalho e rodapé), perfeita para criar páginas de captura ou obrigado.</span>
                  </li>
                </ul>
              </div>

            </div>
          )}

          {/* TAB 5: GITHUB & HOSTINGER DEPLOYMENT SEM ERROS */}
          {activeTab === 'github' && (
            <div className="space-y-6 text-xs text-slate-300">
              
              {/* Alerta de Diagnóstico */}
              <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>Por que o site sumiu ao conectar o GitHub à Hostinger?</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  O repositório anterior continha arquivos de desenvolvimento React (como <code className="text-red-300 bg-red-950/60 px-1 py-0.5 rounded font-mono">index.html</code> e <code className="text-red-300 bg-red-950/60 px-1 py-0.5 rounded font-mono">package.json</code>) que foram clonados diretamente na pasta raiz <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded font-mono">public_html</code> da Hostinger. Como o servidor web (LiteSpeed/Apache) prioriza <code className="font-mono text-white">index.html</code> antes de <code className="font-mono text-white">index.php</code>, ele bloqueou a inicialização do WordPress.
                </p>
              </div>

              {/* Design Autônomo e Sem Dependência de Fotos Externas */}
              <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>Design Executivo Puro (Sem Dependência de Fotos Externas)</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                  O projeto foi atualizado com design institucional vetorial de alta fidelidade para os 3 Pilares e composição patrimonial. Todos os ícones, logotipos e gráficos são nativos e autônomos, sem risco de imagens quebradas (404) ou necessidade de upload manual de fotos.
                </p>
              </div>

              {/* Estrutura Limpa do GitHub */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <GitBranch className="w-5 h-5 text-emerald-400" />
                  <span>Como deixar no GitHub APENAS o que funciona no WordPress</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Para que você nunca mais corra risco de quebrar o WordPress ou perder dados ao fazer <code className="text-amber-300 font-mono">commit</code> e <code className="text-amber-300 font-mono">push</code>, seu repositório no GitHub deve conter <strong>exclusivamente</strong> a pasta do tema WordPress.
                </p>

                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl font-mono text-[11px] text-slate-300 space-y-1">
                  <div className="text-emerald-400 font-bold mb-1">📁 Estrutura Exata que deve ficar no seu GitHub:</div>
                  <div>├── style.css             <span className="text-slate-500"># Identificação do tema no WordPress</span></div>
                  <div>├── index.php             <span className="text-slate-500"># Entrada principal com chave seletora</span></div>
                  <div>├── header.php            <span className="text-slate-500"># Cabeçalho executivo institucional</span></div>
                  <div>├── footer.php            <span className="text-slate-500"># Rodapé institucional e scripts</span></div>
                  <div>├── functions.php         <span className="text-slate-500"># Handlers de leads e rotas REST</span></div>
                  <div>├── page-landing.php      <span className="text-slate-500"># Landing page NBR 3P Patrimônio</span></div>
                  <div>├── page.php & single.php <span className="text-slate-500"># Compatibilidade total com páginas</span></div>
                  <div>├── screenshot.png        <span className="text-slate-500"># Miniatura no painel WordPress</span></div>
                  <div>└── assets/               <span className="text-slate-500"># Imagens, fotos e scripts compilados</span></div>
                </div>

                {/* Passo a Passo de Configuração */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                    <div className="text-amber-400 font-bold text-xs flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-center font-mono text-[10px] leading-5">A</span>
                      Opção Mais Segura (2 minutos):
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                      <li>Vá na <strong>Aba 1 (Baixar Tema .ZIP)</strong> e faça o download do pacote.</li>
                      <li>Descompacte o arquivo no seu computador.</li>
                      <li>Crie um repositório novo no GitHub chamado <code className="text-amber-300 font-mono">3p-patrimonio-tema</code>.</li>
                      <li>Arraste e suba os arquivos descompactados para esse novo repositório.</li>
                    </ol>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                    <div className="text-emerald-400 font-bold text-xs flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-center font-mono text-[10px] leading-5">B</span>
                      Configuração no Hostinger Git (CRUCIAL):
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      No painel da Hostinger (hPanel) &rarr; <strong>Avançado &rarr; Git</strong>:
                    </p>
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px]">
                      <span className="text-slate-400">Install Directory (Diretório de Instalação):</span>
                      <div className="text-emerald-400 font-mono font-bold mt-0.5">
                        public_html/wp-content/themes/3p-patrimonio
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      ⚠️ <strong>Atenção:</strong> NUNCA deixe o diretório de instalação vazio ou como <code>public_html</code>! Apontar para a pasta do tema garante que o WordPress nunca seja sobrescrito.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>3P Patrimônio • Documentação Técnica Hostinger WordPress</span>
          <button
            onClick={onClose}
            className="bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 px-4 py-2 rounded-xl font-bold"
          >
            Concluído
          </button>
        </div>

      </div>
    </div>
  );
};
