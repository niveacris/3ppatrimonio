<?php
/**
 * Template Name: 3P Patrimônio - Elementor Largura Total (Full Width)
 * Description: Modelo com cabeçalho e rodapé do 3P Patrimônio e área de conteúdo 100% livre e compatível com Elementor.
 *
 * @package 3p-patrimonio
 */

get_header(); ?>

<main id="primary" class="site-main w-full min-h-screen bg-slate-950 text-slate-100">
    <?php
    while (have_posts()) : the_post();
        the_content();
    endwhile;
    ?>
</main>

<?php get_footer();
