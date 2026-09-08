/**
 * Utilitário central de resolução de assets (imagens, mídias e ícones)
 * Garante que qualquer imagem estática funcione perfeitamente:
 * 1. No ambiente de desenvolvimento local / AI Studio Preview (/src/assets/... ou /assets/...)
 * 2. No WordPress / Hostinger (onde arquivos residem em /wp-content/themes/3p-patrimonio/assets/...)
 * 3. Em subpastas ou domínios com prefixo
 */

declare global {
  interface Window {
    P3_DATA?: {
      theme_url?: string;
      site_url?: string;
      api_url?: string;
      whatsapp?: string;
      [key: string]: any;
    };
  }
}

/**
 * Resolve o caminho completo de um asset respeitando a instalação WordPress atual
 */
export function resolveAssetUrl(url?: string | null): string {
  if (!url) return '';

  // URLs já completas (http, https, data:, blob:)
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  // Detecta se estamos rodando dentro do WordPress (window.P3_DATA.theme_url fornecido pelo PHP)
  if (typeof window !== 'undefined' && window.P3_DATA?.theme_url) {
    const themeUrl = window.P3_DATA.theme_url.replace(/\/+$/, '');

    // Se o Vite gerou ex: "/assets/screenshot-BMGL8Qxd.png"
    if (url.startsWith('/assets/')) {
      return `${themeUrl}${url}`;
    }
    if (url.startsWith('assets/')) {
      return `${themeUrl}/${url}`;
    }

    // Se veio ex: "/screenshot.png" ou "screenshot.png"
    const cleanFileName = url.replace(/^\/+/, '');
    return `${themeUrl}/assets/${cleanFileName}`;
  }

  return url;
}
