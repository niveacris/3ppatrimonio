<?php
/**
 * Template Name: 3P Patrimônio - Landing Page Oficial
 * Description: Modelo de página de largura total (Full Width) sem interferência de cabeçalho ou rodapé padrão do WordPress.
 *
 * @package 3p-patrimonio
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php wp_title('|', true, 'right'); bloginfo('name'); ?> - Consultoria em Consórcios Imobiliários e Auto</title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet">
    
    <!-- CSS Compilado do App -->
    <link rel="stylesheet" href="<?php echo get_template_directory_uri(); ?>/assets/index-BTk7EaV_.css">
    
    <?php wp_head(); ?>
</head>
<body <?php body_class('bg-slate-950 text-slate-100 font-sans antialiased selection:bg-amber-500 selection:text-slate-950'); ?>>
<?php wp_body_open(); ?>

    <!-- Container Idêntico à Aplicação React -->
    <div id="root"></div>

    <!-- Script Oficial da Aplicação -->
    <script type="module" crossorigin src="<?php echo get_template_directory_uri(); ?>/assets/index-BwgTa3RM.js"></script>

<?php wp_footer(); ?>
</body>
</html>
