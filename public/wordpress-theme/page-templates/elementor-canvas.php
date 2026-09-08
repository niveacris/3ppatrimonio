<?php
/**
 * Template Name: 3P Patrimônio - Elementor Canvas (Limpo / Landing Page)
 * Description: Modelo em tela cheia sem cabeçalho e sem rodapé do tema, ideal para criar páginas 100% customizadas no Elementor.
 *
 * @package 3p-patrimonio
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <?php wp_head(); ?>
</head>
<body <?php body_class('bg-slate-950 text-slate-100 font-sans antialiased overflow-x-hidden selection:bg-amber-500 selection:text-slate-950'); ?>>
<?php wp_body_open(); ?>

<div class="elementor-canvas-wrapper min-h-screen">
    <?php
    while (have_posts()) : the_post();
        the_content();
    endwhile;
    ?>
</div>

<?php wp_footer(); ?>
</body>
</html>
