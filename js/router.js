/**
 * SISTEMA DE ROTEAMENTO SPA / MPA
 * Integrado com Vite & HTML5 History
 * 
 * Regras de Roteamento:
 *  - '/'              -> Redireciona e renderiza index.html (Página Principal)
 *  - '/produtos'      -> Redireciona e renderiza produtos.html (Boutique WePink)
 *  - '/agendar'       -> Redireciona e renderiza agendar.html (Agendamento Online)
 *  - Âncoras (#)      -> Navegação fluida entre seções
 */

class AppRouter {
    constructor() {
        this.currentPath = window.location.pathname.replace(/\/$/, '') || '/';
        this.isProdutosPage = this.currentPath === '/produtos' || this.currentPath.endsWith('produtos.html');
        this.isAgendarPage = this.currentPath === '/agendar' || this.currentPath.endsWith('agendar.html');
        this.isIndexPage = this.currentPath === '/' || this.currentPath.endsWith('index.html');

        this.init();
    }

    init() {
        // Intercepta cliques em links de navegação
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href) return;

            // Ignora links externos, tel, mailto ou whatsapp
            if (href.startsWith('http') || href.startsWith('//') || href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('https://wa.me')) {
                return;
            }

            // Caso 1: Clique para ir para /produtos
            if (href === '/produtos' || href === 'produtos.html' || href === '/produtos.html') {
                if (!this.isProdutosPage) {
                    return; // Deixa o navegador navegar para /produtos (Vite servirá produtos.html)
                } else {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                return;
            }

            // Caso 2: Clique para ir para /agendar
            if (href === '/agendar' || href === 'agendar.html' || href === '/agendar.html') {
                if (!this.isAgendarPage) {
                    return; // Deixa o navegador navegar para /agendar (Vite servirá agendar.html)
                } else {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    window.bookingApp?.open();
                }
                return;
            }

            // Caso 3: Clique para ir para a raiz /
            if (href === '/' || href === '/index.html' || href === 'index.html') {
                if (!this.isIndexPage) {
                    return; // Navega para a raiz (Vite servirá index.html)
                } else {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    this.updateActiveNav('home');
                }
                return;
            }

            // Caso 4: Links com âncora (/ #servicos ou #servicos)
            if (href.startsWith('/#') || href.startsWith('#')) {
                const targetHash = href.startsWith('/#') ? href.replace('/', '') : href;
                const sectionId = targetHash.replace('#', '');

                if (!this.isIndexPage) {
                    // Se não estamos na index.html e clicamos em uma seção da home (ex: /#servicos), deixa navegar para /#servicos
                    return;
                } else {
                    // Estamos na index.html
                    const targetEl = document.getElementById(sectionId);
                    if (targetEl) {
                        e.preventDefault();
                        const headerHeight = document.getElementById('header')?.offsetHeight || 70;
                        const topPos = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                        window.scrollTo({ top: topPos, behavior: 'smooth' });
                        this.updateActiveNav(sectionId);
                    }
                }
            }
        });

        // Atualiza o estado da navegação na carga inicial
        if (this.isProdutosPage) {
            this.updateActiveNav('produtos');
        } else if (this.isAgendarPage) {
            this.updateActiveNav('agendar');
        }
    }

    updateActiveNav(activeId) {
        document.querySelectorAll('.nav-desktop .nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (
                (activeId === 'produtos' && (href === '/produtos' || href === 'produtos.html')) ||
                (activeId === 'agendar' && (href === '/agendar' || href === 'agendar.html')) ||
                (activeId === 'home' && (href === '/' || href === '#home')) ||
                (href === `#${activeId}` || href === `/#${activeId}`)
            ) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            const href = item.getAttribute('href');
            if (
                (activeId === 'produtos' && (href === '/produtos' || href === 'produtos.html')) ||
                (activeId === 'agendar' && (href === '/agendar' || href === 'agendar.html')) ||
                (activeId === 'home' && (href === '/' || href === '#home')) ||
                (href === `#${activeId}` || href === `/#${activeId}`)
            ) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
}

// Inicializa o roteador globalmente
let appRouter;
document.addEventListener('DOMContentLoaded', () => {
    appRouter = new AppRouter();
    window.appRouter = appRouter;
});
