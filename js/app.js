/**
 * GLAMOUR STUDIO - SCRIPT PRINCIPAL DA APLICAÇÃO
 * Gerencia renderização dinâmica de serviços, produtos da boutique, filtros, sliders e status.
 */

document.addEventListener('DOMContentLoaded', () => {
    initSalonStatus();
    renderCategories();
    renderServices('all');
    renderProducts();
    renderGallery();
    renderTeam();
    renderTestimonials();
    renderFaqs();
    initMobileMenu();
    initScrollEffects();
    initNewsletter();
});

/* ----------------- Toast Notification ----------------- */
window.showToast = function(message) {
    let toast = document.getElementById('toastNotification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastNotification';
        toast.className = 'toast-notification';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>✨</span> <span>${message}</span>`;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
};

/* ----------------- Status do Salão em Tempo Real ----------------- */
function initSalonStatus() {
    const statusPill = document.getElementById('salonStatusPill');
    const statusFooter = document.getElementById('salonStatusFooter');
    if (!statusPill) return;

    const now = new Date();
    const day = now.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hour + minutes / 60;

    let isOpen = false;
    let statusText = '';

    if (day >= 1 && day <= 6) { // Segunda a Sábado: 10h às 18h
        if (currentTime >= 10 && currentTime < 18) {
            isOpen = true;
            statusText = 'Aberto agora até às 18:00';
        } else if (currentTime < 10) {
            statusText = 'Fechado no momento • Abre hoje às 10:00';
        } else {
            if (day === 6) {
                statusText = 'Fechado no momento • Abre segunda às 10:00';
            } else {
                statusText = 'Fechado no momento • Abre amanhã às 10:00';
            }
        }
    } else { // Domingo
        statusText = 'Fechado hoje • Abre segunda às 10:00';
    }

    const html = `
        <span class="status-dot" style="${isOpen ? '' : 'background: #e74c3c; animation: none; box-shadow: 0 0 8px rgba(231,76,60,0.5);'}"></span>
        <span style="${isOpen ? '' : 'color: #c0392b;'}">${statusText}</span>
    `;

    statusPill.innerHTML = html;
    if (statusFooter) statusFooter.innerHTML = html;
}

/* ----------------- Renderizar Categorias & Filtros de Serviços ----------------- */
let currentCategory = 'all';
let currentProfessional = 'all';
let searchQuery = '';

function renderCategories() {
    const container = document.getElementById('categoryTabs');
    if (!container) return;

    container.innerHTML = salonData.categories.map(cat => `
        <button type="button" class="tab-btn ${cat.id === currentCategory ? 'active' : ''}" data-cat="${cat.id}">
            <span>${cat.icon}</span>
            <span>${cat.name}</span>
        </button>
    `).join('');

    container.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.cat;
            filterServices();
        });
    });

    // Filtros de profissional (se existirem na página, ex: agendar.html)
    const proFilterContainer = document.getElementById('professionalTabs');
    if (proFilterContainer) {
        proFilterContainer.querySelectorAll('.pro-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                proFilterContainer.querySelectorAll('.pro-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentProfessional = btn.dataset.pro;
                filterServices();
            });
        });
    }

    const searchInput = document.getElementById('serviceSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            filterServices();
        });
    }
}

function filterServices() {
    let filtered = salonData.services;

    if (currentCategory !== 'all') {
        filtered = filtered.filter(s => s.category === currentCategory);
    }

    if (currentProfessional !== 'all') {
        filtered = filtered.filter(s => s.professionalId === currentProfessional);
    }

    if (searchQuery) {
        filtered = filtered.filter(s => 
            s.name.toLowerCase().includes(searchQuery) || 
            s.description.toLowerCase().includes(searchQuery) ||
            (s.professionalName && s.professionalName.toLowerCase().includes(searchQuery))
        );
    }

    renderServicesList(filtered);
}

function renderServices(category) {
    currentCategory = category;
    filterServices();
}

window.filterByProfessional = function(proId) {
    currentProfessional = proId;
    const proFilterContainer = document.getElementById('professionalTabs');
    if (proFilterContainer) {
        proFilterContainer.querySelectorAll('.pro-filter-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.pro === proId);
        });
    }
    filterServices();
    
    // Rolar suavemente para a lista de serviços se estiver na página
    const servicesSection = document.getElementById('servicos-agendamento') || document.getElementById('servicos');
    if (servicesSection) {
        const headerHeight = document.getElementById('header')?.offsetHeight || 70;
        const topPos = servicesSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({ top: topPos, behavior: 'smooth' });
    }
};

function renderServicesList(services) {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;

    if (services.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
                <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
                <p style="font-size: 1.1rem; font-weight: 600;">Nenhum serviço encontrado</p>
                <p style="font-size: 0.9rem;">Tente buscar por outro termo ou limpe os filtros.</p>
                <button type="button" class="btn btn-secondary btn-sm" style="margin-top:1rem;" onclick="window.resetServiceFilters()">
                    Limpar Filtros
                </button>
            </div>
        `;
        return;
    }

    grid.innerHTML = services.map(s => {
        let priceHtml = '';
        if (s.priceDisplay) {
            priceHtml = `<div class="service-price" style="font-size:0.95rem; font-weight:700; color:var(--gold-600);">${s.priceDisplay}</div>`;
        } else if (s.price > 0) {
            priceHtml = `<div class="service-price">R$ ${s.price.toFixed(2).replace('.', ',')}</div>`;
        } else {
            priceHtml = `<div class="service-price" style="font-size:0.92rem; color:var(--gold-600); font-weight:700;">Consultar no WhatsApp</div>`;
        }

        const proIcon = s.professionalId === 'luciana-bezerra' ? '💇‍♀️' : '🌸';
        const proName = s.professionalName || (s.professionalId === 'luciana-bezerra' ? 'Luciana Bezerra' : 'Graziele Bezerra');

        return `
        <div class="service-card reveal-fade">
            <div class="service-card-image">
                <img src="${s.image}" alt="${s.name}" loading="lazy">
                ${s.badge ? `<span class="service-badge">${s.badge}</span>` : ''}
            </div>
            <div class="service-card-body">
                <div class="service-meta" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.4rem;">
                    <span>⏱️ ${s.duration}</span>
                    <span class="service-pro-pill" style="font-size:0.78rem; font-weight:600; background:var(--gold-100); color:var(--gold-700); padding:0.2rem 0.6rem; border-radius:999px; border:1px solid var(--gold-300);">
                        ${proIcon} ${proName}
                    </span>
                </div>
                <h3 class="service-title">${s.name}</h3>
                <p class="service-description">${s.description}</p>
                <div class="service-card-footer">
                    ${priceHtml}
                    <button type="button" class="btn btn-primary btn-sm" onclick="window.bookingApp?.open('${s.id}')">
                        <span>📅</span> Agendar
                    </button>
                </div>
            </div>
        </div>
    `}).join('');

    initScrollEffects();
}

window.resetServiceFilters = function() {
    currentCategory = 'all';
    currentProfessional = 'all';
    searchQuery = '';
    
    const searchInput = document.getElementById('serviceSearchInput');
    if (searchInput) searchInput.value = '';
    
    const catContainer = document.getElementById('categoryTabs');
    if (catContainer) {
        catContainer.querySelectorAll('.tab-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.cat === 'all');
        });
    }
    
    const proContainer = document.getElementById('professionalTabs');
    if (proContainer) {
        proContainer.querySelectorAll('.pro-filter-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.pro === 'all');
        });
    }
    
    filterServices();
};

/* ----------------- Renderizar Boutique de Produtos ----------------- */
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid || !salonData.products) return;

    grid.innerHTML = salonData.products.map(prod => `
        <div class="product-card reveal-fade">
            <div class="product-img-wrapper">
                <img src="${prod.image}" alt="${prod.name}" loading="lazy">
                ${prod.badge ? `<span class="product-badge">${prod.badge}</span>` : ''}
            </div>
            <div class="product-body">
                <span class="product-brand">${prod.brand}</span>
                <h4 class="product-title">${prod.name}</h4>
                <p class="product-desc">${prod.description}</p>
                
                <div class="product-footer">
                    <div class="product-price-box">
                        <span class="product-volume">${prod.volume}</span>
                        <div class="product-price">R$ ${prod.price.toFixed(2).replace('.', ',')}</div>
                    </div>
                    <button type="button" class="btn-add-cart" onclick="window.cartApp?.addItem('${prod.id}')">
                        <span>🛒</span> Comprar
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    initScrollEffects();
}


/* ----------------- Galeria de Fotos ----------------- */
function renderGallery() {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;

    grid.innerHTML = salonData.gallery.map(item => `
        <div class="gallery-item reveal-fade" onclick="window.bookingApp?.open()">
            <img src="${item.image}" alt="${item.title}" loading="lazy">
            <div class="gallery-overlay">
                <p>${item.category}</p>
                <h4>${item.title}</h4>
            </div>
        </div>
    `).join('');
}

/* ----------------- Equipe de Especialistas (Apenas Nome & Especialidades) ----------------- */
function renderTeam() {
    const grid = document.getElementById('teamGrid');
    if (!grid) return;

    grid.innerHTML = salonData.professionals.map(p => {
        const initials = p.name.split(' ').map(n => n[0]).join('').substring(0, 2);
        
        return `
        <div class="team-card team-card-elegant reveal-fade">
            <div class="team-header-badge">
                <div class="team-initials-badge">${initials}</div>
            </div>
            <div class="team-info">
                <h4 class="team-name">${p.name}</h4>
                <div class="team-role">${p.role}</div>
                
                <div class="team-specialty-box">
                    <h5 class="team-specialty-title">✨ Especialidades:</h5>
                    <p class="team-specialty">${p.specialty}</p>
                </div>
                
                <div class="team-actions" style="margin-top:1.5rem; display:flex; gap:0.6rem; justify-content:center;">
                    <a href="https://wa.me/${p.whatsapp}?text=Ol%C3%A1%20${encodeURIComponent(p.name.split(' ')[0])}!%20Gostaria%20de%20conversar%20sobre%20atendimento%20no%20Glamour%20Studio." target="_blank" class="btn btn-secondary btn-sm" style="font-size:0.82rem;">
                        💬 WhatsApp
                    </a>
                    <button type="button" class="btn btn-primary btn-sm" style="font-size:0.82rem;" onclick="window.bookingApp?.open()">
                        📅 Agendar
                    </button>
                </div>
            </div>
        </div>
    `}).join('');
}

/* ----------------- Depoimentos ----------------- */
function renderTestimonials() {
    const grid = document.getElementById('testimonialsGrid');
    if (!grid) return;

    grid.innerHTML = salonData.testimonials.map(t => `
        <div class="testimonial-card reveal-fade">
            <div>
                <div class="testimonial-stars">★★★★★</div>
                <p class="testimonial-text">"${t.text}"</p>
            </div>
            <div class="testimonial-author">
                <img src="${t.avatar}" alt="${t.name}" class="author-avatar" loading="lazy">
                <div class="author-info">
                    <h5>${t.name}</h5>
                    <p>${t.service} • ${t.date}</p>
                </div>
            </div>
        </div>
    `).join('');
}

/* ----------------- FAQs Interativo ----------------- */
function renderFaqs() {
    const container = document.getElementById('faqAccordion');
    if (!container) return;

    container.innerHTML = salonData.faqs.map((faq, index) => `
        <div class="faq-item ${index === 0 ? 'active' : ''}">
            <button class="faq-question-btn" type="button">
                <span>${faq.question}</span>
                <span class="faq-icon">▼</span>
            </button>
            <div class="faq-answer" style="${index === 0 ? 'max-height: 200px;' : ''}">
                <p>${faq.answer}</p>
            </div>
        </div>
    `).join('');

    container.querySelectorAll('.faq-item').forEach(item => {
        const btn = item.querySelector('.faq-question-btn');
        const answer = item.querySelector('.faq-answer');
        
        btn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Fechar outros
            container.querySelectorAll('.faq-item').forEach(other => {
                other.classList.remove('active');
                other.querySelector('.faq-answer').style.maxHeight = null;
            });

            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 30 + 'px';
            }
        });
    });
}

/* ----------------- Menu Mobile Premium & Drawer Controller ----------------- */
function initMobileMenu() {
    const toggleBtn = document.getElementById('mobileMenuToggle');
    const drawer = document.getElementById('mobileMenuDrawer');
    const backdrop = document.getElementById('mobileMenuBackdrop');
    const closeBtn = document.getElementById('mobileDrawerClose');

    window.mobileMenuApp = {
        isOpen: false,
        open: function() {
            if (this.isOpen) return;
            this.isOpen = true;
            toggleBtn?.classList.add('open');
            toggleBtn?.setAttribute('aria-expanded', 'true');
            toggleBtn?.setAttribute('aria-label', 'Fechar menu de navegação');
            drawer?.classList.add('open');
            drawer?.setAttribute('aria-hidden', 'false');
            backdrop?.classList.add('open');
            backdrop?.setAttribute('aria-hidden', 'false');
            document.body.classList.add('menu-open');
        },
        close: function() {
            if (!this.isOpen) return;
            this.isOpen = false;
            toggleBtn?.classList.remove('open');
            toggleBtn?.setAttribute('aria-expanded', 'false');
            toggleBtn?.setAttribute('aria-label', 'Abrir menu de navegação');
            drawer?.classList.remove('open');
            drawer?.setAttribute('aria-hidden', 'true');
            backdrop?.classList.remove('open');
            backdrop?.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('menu-open');
        },
        toggle: function() {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        }
    };

    if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.mobileMenuApp.toggle();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.mobileMenuApp.close();
        });
    }

    if (backdrop) {
        backdrop.addEventListener('click', () => {
            window.mobileMenuApp.close();
        });
    }

    // Fechar ao pressionar ESC
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && window.mobileMenuApp.isOpen) {
            window.mobileMenuApp.close();
        }
    });

    // Fechar ao clicar em qualquer link de navegação dentro do Drawer e rolar suavemente
    document.querySelectorAll('.mobile-nav-item').forEach(link => {
        link.addEventListener('click', () => {
            window.mobileMenuApp.close();
        });
    });

    // Suporte a gesto de arrastar para fechar (Touch swipe to close)
    let touchStartX = 0;
    let touchEndX = 0;

    drawer?.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    drawer?.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        // Se arrastar para a direita mais de 60px, fechar drawer
        if (touchEndX - touchStartX > 60) {
            window.mobileMenuApp.close();
        }
    }, { passive: true });
}

/* ----------------- Scroll Effects & ScrollSpy (Indicador Ativo) ----------------- */
function initScrollEffects() {
    const header = document.getElementById('header');
    const sections = ['home', 'servicos', 'produtos', 'sobre', 'faq', 'contato'];
    
    // Função do ScrollSpy
    const updateActiveNav = () => {
        const headerOffset = window.innerWidth <= 768 ? 90 : 110;
        const scrollPosition = window.scrollY + headerOffset;

        let currentSectionId = 'home';
        for (const id of sections) {
            const el = document.getElementById(id);
            if (el) {
                const top = el.offsetTop;
                if (scrollPosition >= top) {
                    currentSectionId = id;
                }
            }
        }

        // Se estiver no final da página, ativar contato
        if ((window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 60)) {
            currentSectionId = 'contato';
        }

        // Atualizar links desktop
        document.querySelectorAll('.nav-desktop .nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${currentSectionId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Atualizar links mobile
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            const href = item.getAttribute('href');
            if (href === `#${currentSectionId}`) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    };

    window.addEventListener('scroll', () => {
        if (window.scrollY > 25) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }

        updateActiveNav();
    }, { passive: true });

    updateActiveNav();

    // Observer para animações de fade in ao rolar a página
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.08 });

    document.querySelectorAll('.reveal-fade').forEach(el => {
        observer.observe(el);
    });
}

/* ----------------- Newsletter ----------------- */
function initNewsletter() {
    const form = document.getElementById('newsletterForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = form.querySelector('input');
            if (input && input.value) {
                window.showToast('Obrigada! Você receberá 10% de desconto em seu primeiro agendamento ou pedido.');
                input.value = '';
            }
        });
    }
}
