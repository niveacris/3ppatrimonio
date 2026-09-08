<?php
/**
 * Template principal do Tema 3P Patrimônio
 * Detecta automaticamente páginas construídas no Elementor vs Aplicação React Padrão
 *
 * @package 3p-patrimonio
 */

get_header();

$is_elementor_page = false;
if (is_singular() && defined('ELEMENTOR_VERSION')) {
    $is_elementor_page = \Elementor\Plugin::$instance->db->is_built_with_elementor(get_the_ID());
}

if ($is_elementor_page) :
    // Quando a página é construída com o Elementor, renderiza o construtor visual
    ?>
    <main id="primary" class="site-main w-full min-h-screen bg-slate-950 text-slate-100">
        <?php
        while (have_posts()) : the_post();
            the_content();
        endwhile;
        ?>
    </main>
    <?php
else :
    // Página inicial padrão ou página sem Elementor: renderiza a aplicação completa React
    ?>
    <main id="primary" class="site-main">
        <!-- Ponto de Montagem Exato da Aplicação React 18 3P Patrimônio -->
        <div id="root">
            <noscript>
                <div style="padding: 40px; text-align: center; color: #fff; background: #020617; font-family: sans-serif;">
                    <h1>3P PATRIMÔNIO</h1>
                    <p>Para interagir com o simulador e visualizar todos os recursos exclusivos, por favor habilite o JavaScript em seu navegador.</p>
                    <p><a href="https://wa.me/5511996876748" style="color: #f59e0b;">Fale diretamente com um consultor no WhatsApp</a></p>
                </div>
            </noscript>
        </div>
    </main>
    <?php
endif;

get_footer();
