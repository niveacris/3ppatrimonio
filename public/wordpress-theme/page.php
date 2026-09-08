<?php
/**
 * Template padrão para Páginas do WordPress
 * 100% Compatível com Elementor, Gutenberg e Shortcodes 3P Patrimônio
 *
 * @package 3p-patrimonio
 */

get_header(); ?>

<main id="primary" class="site-main w-full min-h-screen bg-slate-950 text-slate-100">
    <?php
    if (have_posts()) :
        while (have_posts()) : the_post();
            the_content();
        endwhile;
    else :
        ?>
        <div class="max-w-4xl mx-auto px-4 py-20 text-center">
            <h1 class="text-3xl font-bold text-white mb-4">Página em Construção</h1>
            <p class="text-slate-400 mb-6">Esta página está pronta para ser editada com o Elementor no WordPress.</p>
            <a href="<?php echo esc_url(home_url('/')); ?>" class="inline-block bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-3 rounded-xl font-bold transition-all">
                Voltar à Página Principal
            </a>
        </div>
        <?php
    endif;
    ?>
</main>

<?php get_footer();
