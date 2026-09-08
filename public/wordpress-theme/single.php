<?php
/**
 * Template padrão para Posts / Artigos do WordPress
 * 100% Compatível com Elementor e Gutenberg
 *
 * @package 3p-patrimonio
 */

get_header(); ?>

<main id="primary" class="site-main w-full min-h-screen bg-slate-950 text-slate-100 py-12">
    <div class="max-w-4xl mx-auto px-4">
        <?php
        while (have_posts()) : the_post();
            ?>
            <article id="post-<?php the_ID(); ?>" <?php post_class('space-y-6'); ?>>
                <header class="entry-header border-b border-slate-800 pb-6 mb-8">
                    <span class="text-xs font-bold uppercase tracking-widest text-amber-400">Artigo Oficial 3P Patrimônio</span>
                    <h1 class="text-3xl sm:text-4xl font-extrabold text-white mt-2"><?php the_title(); ?></h1>
                    <div class="text-xs text-slate-400 mt-3 flex items-center gap-4">
                        <span>Por <?php the_author(); ?></span>
                        <span>•</span>
                        <time datetime="<?php echo get_the_date('c'); ?>"><?php echo get_the_date(); ?></time>
                    </div>
                </header>

                <div class="entry-content prose prose-invert max-w-none">
                    <?php the_content(); ?>
                </div>
            </article>
            <?php
        endwhile;
        ?>
    </div>
</main>

<?php get_footer();
