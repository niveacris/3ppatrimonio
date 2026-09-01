import React, { useState } from 'react';
import { X, Globe, Download, Copy, Check, Server, FileCode, Database, Cpu, ExternalLink, ShieldAlert, Sparkles, Layers } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface WordPressExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WordPressExportModal: React.FC<WordPressExportModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'php_template' | 'wp_plugin' | 'elementor'>('guide');
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
      $table_name = $wpdb->prefix . '3p_leads';
      
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
register_activation_hook(__FILE__, '3p_create_leads_table');

function 3p_create_leads_table() {
  global $wpdb;
  $table_name = $wpdb->prefix . '3p_leads';
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
add_action('admin_menu', '3p_register_admin_menu');

function 3p_register_admin_menu() {
  add_menu_page(
    '3P Patrimônio - Leads',
    '3P Patrimônio',
    'manage_options',
    '3p-leads-manager',
    '3p_render_crm_page',
    'dashicons-chart-line',
    30
  );
}

function 3p_render_crm_page() {
  global $wpdb;
  $table_name = $wpdb->prefix . '3p_leads';
  $leads = $wpdb->get_results("SELECT * FROM $table_name ORDER BY id DESC");
  
  echo '<div class="wrap">';
  echo '<h1 style="color:#d97706;">🏛️ Painel de Movimentação dos Sócios - 3P Patrimônio</h1>';
  echo '<p>Hospedado no Hostinger WordPress • Total de Leads: ' . count($leads) . '</p>';
  echo '<table class="wp-list-table widefat fixed striped">';
  echo '<thead><tr><th>Data</th><th>Nome</th><th>WhatsApp</th><th>Objetivo</th><th>Crédito</th><th>Status</th></tr></thead>';
  echo '<tbody>';
  foreach ($leads as $l) {
    echo '<tr>';
    echo '<td>' . $l->created_at . '</td>';
    echo '<td><strong>' . esc_html($l->name) . '</strong></td>';
    echo '<td>' . esc_html($l->whatsapp) . '</td>';
    echo '<td>' . esc_html($l->objective) . '</td>';
    echo '<td>' . esc_html($l->credit_amount) . '</td>';
    echo '<td><span style="background:#fef3c7; color:#92400e; padding:3px 8px; border-radius:12px; font-weight:bold;">' . esc_html($l->status) . '</span></td>';
    echo '</tr>';
  }
  echo '</tbody></table>';
  echo '</div>';
}

// 3. Endpoint REST API nativo para Webhooks do Instagram Ads no WP Hostinger
add_action('rest_api_init', function () {
  register_rest_route('3p/v1', '/instagram-lead', array(
    'methods' => 'POST',
    'callback' => 'wp_3p_handle_instagram_webhook',
    'permission_callback' => '__return_true'
  ));
});

function wp_3p_handle_instagram_webhook($request) {
  global $wpdb;
  $table = $wpdb->prefix . '3p_leads';
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
            <span>2. Template WordPress (.php)</span>
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
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          
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
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                <h4 className="text-sm font-extrabold text-amber-400">Como usar no Elementor / Elementor Pro</h4>
                <p className="text-slate-400">
                  Se você utiliza o construtor Elementor no seu WordPress do Hostinger:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-slate-300">
                  <li>No Elementor, crie uma nova página e defina o Modelo de Página como **Elementor Largura Total** ou **Canvas**.</li>
                  <li>Adicione um widget de **HTML Personalizado**.</li>
                  <li>Cole o código gerado no arquivo do template para renderizar toda a estética Bento Grid da 3P Patrimônio.</li>
                  <li>Para o formulário de captação, conecte o Webhook do Elementor Forms apontando para a API do seu servidor Hostinger.</li>
                </ol>
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
