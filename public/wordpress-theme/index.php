<?php
/**
 * Template principal do Tema 3P Patrimônio
 *
 * @package 3p-patrimonio
 */

get_header(); ?>

<main id="primary" class="site-main">
    <!-- Ponto de Montagem Exato da Aplicação React 18 3P Patrimônio -->
    <div id="root">
        <!-- Pré-carregador elegante caso o JavaScript demore a carregar -->
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
get_footer();
