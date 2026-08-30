// Dados do Salão de Beleza "Glamour Studio"
const salonData = {
    info: {
        name: "Glamour Studio",
        slogan: "Sua beleza em sua melhor versão",
        description: "Salão de beleza conceito por Graziele Bezerra e Luciana Bezerra. Especializado em progressiva, realinhamento capilar, botox, hidratação profunda, escovas, designer de sobrancelhas personalizado, depilação completa, manicure e boutique oficial com produtos WePink com entrega grátis.",
        phone: "+55 (95) 98407-2160", // Luciana Bezerra (Salão)
        phone2: "+55 (95) 98429-8305", // Graziele Bezerra (Vendas WePink & Depilação/Sobrancelhas)
        whatsapp: "5595984072160", // Luciana (Atendimento Salão)
        whatsappVendas: "5595984298305", // Graziele (Vendas Produtos WePink)
        instagram: "@glamourstudio_lg",
        instagramUrl: "https://www.instagram.com/glamourstudio_lg/",
        email: "contato@glamourstudio.com.br",
        address: "Av. Tuxaua Farias, 259, Bonfim - RR, 69380-000",
        logoImage: "assets/images/logo-glamour-studio.jpg",
        businessCardImage: "assets/images/cartao-visita-glamour.jpg",
        hours: {
            mondayToSaturday: { open: "10:00", close: "18:00", label: "Segunda a Sábado: 10h às 18h" },
            sunday: { open: null, close: null, label: "Domingo: Fechado" }
        }
    },
    categories: [
        { id: "all", name: "Todos os Serviços", icon: "✨" },
        { id: "alinhamento", name: "Alisamentos & Alinhamento", icon: "👑" },
        { id: "cabelo", name: "Cabelos & Escovas", icon: "💇‍♀️" },
        { id: "depilacao", name: "Depilação Corporal & Facial", icon: "🌸" },
        { id: "sobrancelhas", name: "Designer de Sobrancelhas", icon: "👁️" },
        { id: "unhas", name: "Manicure e Pedicure", icon: "💅" }
    ],
    services: [
        // ==========================================
        // 1. ALINHAMENTO & ALISAMENTO (PREÇOS OFICIAIS: CURTOS R$ 150 | GRANDES R$ 270)
        // ==========================================
        {
            id: "escova-progressiva",
            category: "alinhamento",
            professionalId: "luciana-bezerra",
            professionalName: "Luciana Bezerra",
            name: "Escova Progressiva Glamour",
            description: "Alisamento completo e duradouro com selagem térmica profunda por Luciana Bezerra. Liso impecável e brilho espelhado.<br><strong>Curtos: R$ 150,00 | Grandes / Longos: R$ 270,00</strong>",
            duration: "3h",
            durationMinutes: 180,
            price: 150.00,
            priceMax: 270.00,
            priceDisplay: "Curtos R$ 150 | Longos R$ 270",
            featured: true,
            badge: "Curtos R$ 150 | Grandes R$ 270",
            image: "assets/images/progressiva-depois.jpg"
        },
        {
            id: "realinhamento-capilar",
            category: "alinhamento",
            professionalId: "luciana-bezerra",
            professionalName: "Luciana Bezerra",
            name: "Realinhamento Capilar Orgânico",
            description: "Alinhamento térmico com redução de volume e reposição de massa sem formol por Luciana Bezerra. Fios disciplinados, sedosos e com balanço natural.<br><strong>Curtos: R$ 150,00 | Grandes / Longos: R$ 270,00</strong>",
            duration: "2h30",
            durationMinutes: 150,
            price: 150.00,
            priceMax: 270.00,
            priceDisplay: "Curtos R$ 150 | Longos R$ 270",
            featured: true,
            badge: "Curtos R$ 150 | Grandes R$ 270",
            image: "assets/images/realinhamento-trabalho.jpg"
        },
        {
            id: "botox-capilar",
            category: "alinhamento",
            professionalId: "luciana-bezerra",
            professionalName: "Luciana Bezerra",
            name: "Botox Capilar Disciplinante",
            description: "Tratamento reconstrutor intensivo antifrizz e redutor de volume por Luciana Bezerra. Preenche a fibra capilar e confere brilho acetinado extremo.<br><strong>Curtos: R$ 150,00 | Grandes / Longos: R$ 270,00</strong>",
            duration: "2h",
            durationMinutes: 120,
            price: 150.00,
            priceMax: 270.00,
            priceDisplay: "Curtos R$ 150 | Longos R$ 270",
            featured: true,
            badge: "Curtos R$ 150 | Grandes R$ 270",
            image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80"
        },
        {
            id: "banho-de-brilho",
            category: "alinhamento",
            professionalId: "luciana-bezerra",
            professionalName: "Luciana Bezerra",
            name: "Banho de Brilho",
            description: "Tratamento revitalizante para realçar a luminosidade da cor, selar as cutículas e proporcionar brilho espelhado deslumbrante por Luciana Bezerra.",
            duration: "1h30",
            durationMinutes: 90,
            price: 0,
            featured: false,
            badge: "Consultar no WhatsApp",
            image: "assets/images/banho-de-brilho.jpg"
        },
        {
            id: "cronograma-capilar",
            category: "alinhamento",
            professionalId: "luciana-bezerra",
            professionalName: "Luciana Bezerra",
            name: "Cronograma Capilar Intensivo",
            description: "Tratamento em etapas com Nutrição lipídica, Hidratação profunda e Reconstrução com aminoácidos por Luciana Bezerra.",
            duration: "1h15",
            durationMinutes: 75,
            price: 0,
            featured: false,
            badge: "Consultar no WhatsApp",
            image: "assets/images/cronograma-capilar.jpg"
        },

        // ==========================================
        // 2. CABELOS & ESCOVAS (PREÇOS OFICIAIS)
        // ==========================================
        {
            id: "hidratacao-escova",
            category: "cabelo",
            professionalId: "luciana-bezerra",
            professionalName: "Luciana Bezerra",
            name: "Hidratação + Escova",
            description: "Lavagem relaxante com hidratação profunda reconstrutora de nutrientes e finalização com escova alinhada, solta e com brilho espelhado por Luciana Bezerra.",
            duration: "1h",
            durationMinutes: 60,
            price: 120.00,
            priceDisplay: "R$ 120,00",
            featured: true,
            badge: "Oficial R$ 120",
            image: "assets/images/hidratacao-escova.jpg"
        },
        {
            id: "hidratacao-escova-babyliss",
            category: "cabelo",
            professionalId: "luciana-bezerra",
            professionalName: "Luciana Bezerra",
            name: "Hidratação + Escova + Babyliss",
            description: "Combo completo de tratamento capilar hidratante, escovação impecável e modelagem de ondas deslumbrantes com babyliss de alta durabilidade por Luciana Bezerra.",
            duration: "1h15",
            durationMinutes: 75,
            price: 120.00,
            priceDisplay: "R$ 120,00",
            featured: true,
            badge: "Super Promoção R$ 120",
            image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80"
        },

        // ==========================================
        // 3. DESIGNER DE SOBRANCELHAS (PREÇOS OFICIAIS)
        // ==========================================
        {
            id: "designer-personalizado",
            category: "sobrancelhas",
            professionalId: "graziele-bezerra",
            professionalName: "Graziele Bezerra",
            name: "Designer Personalizado",
            description: "Mapeamento facial milimétrico e desenho personalizado das sobrancelhas por Graziele Bezerra de acordo com a simetria do seu rosto.",
            duration: "30min",
            durationMinutes: 30,
            price: 20.00,
            priceDisplay: "R$ 20,00",
            featured: true,
            badge: "Oficial R$ 20",
            image: "assets/images/designer-personalizado.jpg"
        },
        {
            id: "design-henna",
            category: "sobrancelhas",
            professionalId: "graziele-bezerra",
            professionalName: "Graziele Bezerra",
            name: "Designer Personalizado + Henna",
            description: "Mapeamento simétrico com pinça e aplicação de henna de alta fixação com efeito sombreado natural por Graziele Bezerra.",
            duration: "45min",
            durationMinutes: 45,
            price: 0,
            featured: false,
            badge: "Consultar no WhatsApp",
            image: "assets/images/designer-henna.jpg"
        },

        // ==========================================
        // 4. DEPILAÇÃO & EPILAÇÃO (PREÇOS OFICIAIS)
        // ==========================================
        {
            id: "depilacao-intimo-completo",
            category: "depilacao",
            professionalId: "graziele-bezerra",
            professionalName: "Graziele Bezerra",
            name: "Depilação Íntimo Completo",
            description: "Técnica suave com cera morna natural por Graziele Bezerra. Remoção completa dos pelos com máximo conforto, higiene e pele sedosa.",
            duration: "40min",
            durationMinutes: 40,
            price: 65.00,
            priceDisplay: "R$ 65,00",
            featured: true,
            badge: "Oficial R$ 65",
            image: "assets/images/depilacao-intimo-completo.jpg"
        },
        {
            id: "depilacao-perna-completa",
            category: "depilacao",
            professionalId: "graziele-bezerra",
            professionalName: "Graziele Bezerra",
            name: "Depilação Perna Completa",
            description: "Depilação integral das pernas com cera suave por Graziele Bezerra e aplicação de loção calmante hidratante pós-procedimento.",
            duration: "35min",
            durationMinutes: 35,
            price: 40.00,
            priceDisplay: "R$ 40,00",
            featured: true,
            badge: "Oficial R$ 40",
            image: "assets/images/depilacao-perna-completa.jpg"
        },
        {
            id: "depilacao-meia-perna",
            category: "depilacao",
            professionalId: "graziele-bezerra",
            professionalName: "Graziele Bezerra",
            name: "Depilação Meia Perna",
            description: "Depilação rápida, prática e suave do joelho aos pés com cera morna natural e hidratação imediata por Graziele Bezerra.",
            duration: "20min",
            durationMinutes: 20,
            price: 25.00,
            priceDisplay: "R$ 25,00",
            featured: false,
            badge: "Oficial R$ 25",
            image: "assets/images/depilacao-meia-perna.jpg"
        },
        {
            id: "depilacao-axilas",
            category: "depilacao",
            professionalId: "graziele-bezerra",
            professionalName: "Graziele Bezerra",
            name: "Depilação Axilas",
            description: "Remoção higiênica e confortável dos pelos das axilas por Graziele Bezerra, diminuindo irritações e deixando a pele macia.",
            duration: "15min",
            durationMinutes: 15,
            price: 25.00,
            priceDisplay: "R$ 25,00",
            featured: false,
            badge: "Oficial R$ 25",
            image: "assets/images/depilacao-axilas.jpg"
        },
        {
            id: "depilacao-bracos",
            category: "depilacao",
            professionalId: "graziele-bezerra",
            professionalName: "Graziele Bezerra",
            name: "Depilação Braços",
            description: "Remoção suave dos pelos dos braços por Graziele Bezerra com cera morna natural e finalização hidratante.",
            duration: "20min",
            durationMinutes: 20,
            price: 25.00,
            priceDisplay: "R$ 25,00",
            featured: false,
            badge: "Oficial R$ 25",
            image: "assets/images/depilacao-bracos.jpg"
        },
        {
            id: "depilacao-facial",
            category: "depilacao",
            professionalId: "graziele-bezerra",
            professionalName: "Graziele Bezerra",
            name: "Depilação Facial",
            description: "Remoção delicada dos pelos faciais (buço e contorno facial) por Graziele Bezerra com produtos calmantes específicos para peles sensíveis.",
            duration: "15min",
            durationMinutes: 15,
            price: 15.00,
            priceDisplay: "R$ 15,00",
            featured: false,
            badge: "Oficial R$ 15",
            image: "assets/images/depilacao-facial.jpg"
        },

        // ==========================================
        // 5. MANICURE E PEDICURE (PREÇOS OFICIAIS)
        // ==========================================
        {
            id: "manicure-mao",
            category: "unhas",
            professionalId: "luciana-bezerra",
            professionalName: "Luciana Bezerra",
            name: "Manicure (Mão Tradicional)",
            description: "Cutilagem cuidadosa e higiênica com autoclave hospitalar por Luciana Bezerra, esfoliação suave, hidratação das cutículas e esmaltação impecável.",
            duration: "40min",
            durationMinutes: 40,
            price: 30.00,
            priceDisplay: "R$ 30,00",
            featured: true,
            badge: "Oficial R$ 30",
            image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80"
        },
        {
            id: "pedicure-pe",
            category: "unhas",
            professionalId: "luciana-bezerra",
            professionalName: "Luciana Bezerra",
            name: "Pedicure (Pé Tradicional)",
            description: "Cuidado completo e higiênico dos pés por Luciana Bezerra. Cutilagem suave, esfoliação, hidratação profunda e esmaltação de alta durabilidade.",
            duration: "45min",
            durationMinutes: 45,
            price: 30.00,
            priceDisplay: "R$ 30,00",
            featured: true,
            badge: "Oficial R$ 30",
            image: "assets/images/pedicure-servico.jpg"
        },
        {
            id: "combo-pe-mao",
            category: "unhas",
            professionalId: "luciana-bezerra",
            professionalName: "Luciana Bezerra",
            name: "Combo Pé e Mão (Completo)",
            description: "Atendimento completo para mãos e pés por Luciana Bezerra com esfoliação, cutilagem esterilizada, hidratação e esmaltação perfeita.",
            duration: "1h20",
            durationMinutes: 80,
            price: 60.00,
            priceDisplay: "R$ 60,00",
            featured: true,
            badge: "Oficial R$ 60",
            image: "assets/images/combo-pe-mao.jpg"
        }
    ],
    // Catálogo Oficial de Produtos WEPINK
    products: [
        // --- PERFUMES LUXO (R$ 170,00) ---
        {
            id: "prod-wepink-perfume-ruby-chocolate",
            name: "Perfume Ruby Chocolate WePink",
            brand: "WePink",
            category: "perfumes",
            description: "Frasco lapidado em cristal rubi com notas envolventes de chocolate nobre, frutas vermelhas e baunilha cremosa.",
            volume: "100ml",
            price: 170.00,
            badge: "Lançamento R$ 170",
            image: "assets/images/wepink-perfume-ruby-chocolate.jpg"
        },
        {
            id: "prod-wepink-perfume-vf-27",
            name: "Perfume VF 2.7 Birthday Edition WePink",
            brand: "WePink",
            category: "perfumes",
            description: "Edição Especial de Aniversário Virginia Fonseca! Frasco rosa vibrante com caixa barroca dourada.",
            volume: "75ml",
            price: 170.00,
            badge: "Edição Especial R$ 170",
            image: "assets/images/wepink-perfume-vf-27.jpg"
        },
        {
            id: "prod-wepink-perfume-vf-tradicional",
            name: "Perfume VF Virginia Fonseca WePink",
            brand: "WePink",
            category: "perfumes",
            description: "A essência do sol e da paixão! Frasco degradê pôr do sol com fragrância floral marcante e envolvente.",
            volume: "75ml",
            price: 170.00,
            badge: "Best Seller R$ 170",
            image: "assets/images/wepink-perfume-vf-tradicional.jpg"
        },
        {
            id: "prod-wepink-perfume-red",
            name: "Perfume RED WePink",
            brand: "WePink",
            category: "perfumes",
            description: "Poder, intensidade e paixão em frasco cubo de vidro vermelho com placa dourada e tampa metálica.",
            volume: "100ml",
            price: 170.00,
            badge: "Top Luxo R$ 170",
            image: "assets/images/wepink-perfume-red.jpg"
        },
        {
            id: "prod-wepink-perfume-liberte",
            name: "Perfume Liberté Eau de Parfum WePink",
            brand: "WePink",
            category: "perfumes",
            description: "Fragrância floral encantadora e sofisticada em frasco branco acetinado com tampa lapidada geométrica.",
            volume: "100ml",
            price: 170.00,
            badge: "Mais Vendido R$ 170",
            image: "assets/images/wepink-perfume-liberte.jpg"
        },
        {
            id: "prod-wepink-perfume-feive",
            name: "Perfume FEIVE Celestial WePink",
            brand: "WePink",
            category: "perfumes",
            description: "Fragrância celestial e envolvente em frasco de cristal rosê acetinado com tampa facetada e caixa capitonê pêssego.",
            volume: "100ml",
            price: 170.00,
            badge: "Perfume R$ 170",
            image: "assets/images/wepink-perfume-feive.jpg"
        },
        {
            id: "prod-wepink-perfume-obsessed",
            name: "Perfume Desodorante Colônia Obsessed WePink",
            brand: "WePink",
            category: "perfumes",
            description: "Fragrância marcante, envolvente e sensual em frasco luxo com tampa lapidada em diamante vermelho.",
            volume: "100ml",
            price: 170.00,
            badge: "Perfume R$ 170",
            image: "assets/images/wepink-perfume-obsessed.jpg"
        },
        {
            id: "prod-wepink-perfume-fatal-black",
            name: "Perfume Fatal Black For Her Extraordinary WePink",
            brand: "WePink",
            category: "perfumes",
            description: "Da Extraordinary Collection! Fragrância misteriosa, sofisticada e poderosa em frasco black luxo com caixa roxa aveludada.",
            volume: "100ml",
            price: 170.00,
            badge: "Perfume R$ 170",
            image: "assets/images/wepink-perfume-fatal-black.jpg"
        },
        {
            id: "prod-wepink-perfume-universe-moon",
            name: "Perfume Universe Moon WePink",
            brand: "WePink",
            category: "perfumes",
            description: "Uma viagem olfativa mística e sedutora com frasco roxo acetinado e tampa de cristal esculpido.",
            volume: "100ml",
            price: 170.00,
            badge: "Perfume R$ 170",
            image: "assets/images/wepink-perfume-universe-moon.jpg"
        },

        // --- ÓLEO CAPILAR REPAIR (R$ 90,00) ---
        {
            id: "prod-wepink-booster-repair",
            name: "Óleo Capilar Booster Repair + Sensitive Mix WePink",
            brand: "WePink",
            category: "cabelo",
            description: "Repara pontas duplas, oferece proteção térmica, controle total do frizz e hidratação profunda sem pesar o cabelo.",
            volume: "30ml",
            price: 90.00,
            badge: "Top Cabelo R$ 90",
            image: "assets/images/wepink-booster-repair-1.jpg"
        },

        // --- PERFUMES CAPILARES / HAIR MIST (R$ 55,00) ---
        {
            id: "prod-wepink-hairmist-liberte",
            name: "Perfume Capilar Hair Mist Liberté WePink",
            brand: "WePink",
            category: "cabelo",
            description: "Perfume para cabelos com Óleo de Argan, Chá Verde e Vitamina E. Brilho imediato, neutraliza odores e perfuma sem ressecar.",
            volume: "50ml",
            price: 55.00,
            badge: "Perfume Capilar R$ 55",
            image: "assets/images/wepink-hairmist-liberte.jpg"
        },
        {
            id: "prod-wepink-hairmist-obsessed",
            name: "Perfume Capilar Hair Mist Obsessed WePink",
            brand: "WePink",
            category: "cabelo",
            description: "Fragrância marcante e envolvente com Óleo de Argan e Vitamina E. Ação antifrizz, toque sedoso e aroma duradouro.",
            volume: "50ml",
            price: 55.00,
            badge: "Perfume Capilar R$ 55",
            image: "assets/images/wepink-hairmist-obsessed.jpg"
        },

        // --- BODY SPLASHES (R$ 70,00) ---
        {
            id: "prod-wepink-bs-vanilla-cuddle",
            name: "Body Splash Vanilla Cuddle WePink",
            brand: "WePink",
            category: "body-splash",
            description: "Edição Limitada com notas quentes de baunilha gourmand, caramelo cremoso e toque sedutor.",
            volume: "200ml",
            price: 70.00,
            badge: "Edição Limitada R$ 70",
            image: "assets/images/wepink-bs-vanilla-cuddle.jpg"
        },
        {
            id: "prod-wepink-bs-obsessed",
            name: "Body Splash Obsessed Exclusive Pink WePink",
            brand: "WePink",
            category: "body-splash",
            description: "Fragrância hipnótica, doce e marcante com degradê magenta luxuoso.",
            volume: "200ml",
            price: 70.00,
            badge: "Exclusive Pink R$ 70",
            image: "assets/images/wepink-bs-obsessed.jpg"
        },
        {
            id: "prod-wepink-bs-auretx",
            name: "Body Splash AURETX WePink",
            brand: "WePink",
            category: "body-splash",
            description: "Fragrância radiante, fresca e vibrante com notas florais modernas e toque frutado sedutor.",
            volume: "200ml",
            price: 70.00,
            badge: "Lançamento R$ 70",
            image: "assets/images/wepink-bs-auretx.jpg"
        },
        {
            id: "prod-wepink-bs-onetouch-warm",
            name: "Body Splash One Touch Warm WePink",
            brand: "WePink",
            category: "body-splash",
            description: "Fragrância quente, acolhedora e irresistível com acordes florais e notas orientais envolventes.",
            volume: "200ml",
            price: 70.00,
            badge: "Mais Vendido R$ 70",
            image: "assets/images/wepink-bs-onetouch-warm.jpg"
        },
        {
            id: "prod-wepink-bs-heaven",
            name: "Body Splash Heaven Extraordinary WePink",
            brand: "WePink",
            category: "body-splash",
            description: "Fragrância angelical, fresca, sofisticada e radiante da Extraordinary Collection.",
            volume: "200ml",
            price: 70.00,
            badge: "Extraordinary R$ 70",
            image: "assets/images/wepink-bs-heaven.jpg"
        },
        {
            id: "prod-wepink-bs-onetouch-latte",
            name: "Body Splash One Touch Latte WePink",
            brand: "WePink",
            category: "body-splash",
            description: "Fragrância aveludada, cremosa e acolhedora com notas sofisticadas de latte e acordes gourmand.",
            volume: "200ml",
            price: 70.00,
            badge: "Queridinho R$ 70",
            image: "assets/images/wepink-bs-onetouch-latte.jpg"
        },
        {
            id: "prod-wepink-bs-vf-onyx",
            name: "Body Splash VF Onyx Virginia Fonseca WePink",
            brand: "WePink",
            category: "body-splash",
            description: "Fragrância noturna misteriosa, poderosa e sedutora com frasco black luxo.",
            volume: "200ml",
            price: 70.00,
            badge: "Edição Especial R$ 70",
            image: "assets/images/wepink-bs-vf-onyx.jpg"
        },
        {
            id: "prod-wepink-bs-liberte",
            name: "Body Splash Liberté WePink",
            brand: "WePink",
            category: "body-splash",
            description: "Fragrância floral encantadora, sofisticada e radiante com ilustração floral dourada.",
            volume: "200ml",
            price: 70.00,
            badge: "Top Luxo R$ 70",
            image: "assets/images/wepink-bs-liberte.jpg"
        },
        {
            id: "prod-wepink-bs-ruby",
            name: "Body Splash Ruby Rhodolite WePink",
            brand: "WePink",
            category: "body-splash",
            description: "Floral elegante e refrescante com flor de cerejeira, pera suculenta, pitaya e cereja.",
            volume: "200ml",
            price: 70.00,
            badge: "Sensação R$ 70",
            image: "assets/images/wepink-ruby.jpg"
        },
        {
            id: "prod-wepink-bs-scarlette",
            name: "Body Splash Scarlette WePink",
            brand: "WePink",
            category: "body-splash",
            description: "Fragrância intensa, quente e sedutora com notas marcantes e envolventes para o corpo todo.",
            volume: "200ml",
            price: 70.00,
            badge: "Promoção R$ 70",
            image: "assets/images/wepink-scarlette.jpg"
        },
        {
            id: "prod-wepink-bs-choices",
            name: "Body Splash VF Choices WePink",
            brand: "WePink",
            category: "body-splash",
            description: "Aroma inovador e incandescente com notas florais e frutadas equilibradas com frescor radiante.",
            volume: "200ml",
            price: 70.00,
            badge: "Promoção R$ 70",
            image: "assets/images/wepink-vf-choices.jpg"
        },
        {
            id: "prod-wepink-bs-golden",
            name: "Body Splash VF Golden WePink",
            brand: "WePink",
            category: "body-splash",
            description: "Fragrância dourada luxuosa, sofisticada e radiante inspirada em momentos inesquecíveis.",
            volume: "200ml",
            price: 70.00,
            badge: "Promoção R$ 70",
            image: "assets/images/wepink-vf-golden.jpg"
        }
    ],
    professionals: [
        {
            id: "graziele-bezerra",
            name: "Graziele Bezerra",
            role: "Designer de Sobrancelhas, Depilação Suave & Vendas WePink",
            specialty: "Designer de Sobrancelhas Personalizado (R$ 20), Depilação Completa (Íntimo R$ 65, Pernas, Axilas R$ 25, Braços R$ 25, Depilação Facial R$ 15) e Consultoria de Produtos WePink",
            image: "",
            experience: "Especialista em visagismo de sobrancelhas, depilação suave e vendas oficiais WePink",
            whatsapp: "5595984298305" // Graziele: Vendas WePink, Depilação & Sobrancelhas
        },
        {
            id: "luciana-bezerra",
            name: "Luciana Bezerra",
            role: "Master Hair Stylist & Visagista (Progressiva, Realinhamento, Botox & Manicure)",
            specialty: "Escova Progressiva (Curtos R$ 150 / Longos R$ 270), Realinhamento Orgânico (Curtos R$ 150 / Longos R$ 270), Botox Capilar (Curtos R$ 150 / Longos R$ 270), Hidratação + Escova (R$ 120), Manicure (R$ 30), Pedicure (R$ 30), Combo Pé e Mão (R$ 60) e Banho de Brilho",
            image: "",
            experience: "Master hair stylist, especialista em alisamentos e alinhamentos capilares, hidratações, manicure e pedicure",
            whatsapp: "5595984072160" // Luciana: Atendimento Salão & Cabelos
        }
    ],
    gallery: [
        {
            title: "Escova Progressiva Liso Espelhado (Luciana Bezerra)",
            category: "alinhamento",
            image: "assets/images/progressiva-depois.jpg"
        },
        {
            title: "Designer Personalizado (Graziele Bezerra)",
            category: "sobrancelhas",
            image: "assets/images/designer-personalizado.jpg"
        },
        {
            title: "Realinhamento Capilar Orgânico (Luciana Bezerra)",
            category: "alinhamento",
            image: "assets/images/realinhamento-trabalho.jpg"
        },
        {
            title: "Depilação Suave com Pele Acetinada (Graziele Bezerra)",
            category: "depilacao",
            image: "assets/images/depilacao-perna-completa.jpg"
        },
        {
            title: "Hidratação + Escova + Babyliss (Luciana Bezerra)",
            category: "cabelo",
            image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80"
        },
        {
            title: "Pedicure Francesinha Impecável (Luciana Bezerra)",
            category: "unhas",
            image: "assets/images/pedicure-galeria.jpg"
        },
        {
            title: "Pedicure Spa & Esmaltação (Luciana Bezerra)",
            category: "unhas",
            image: "assets/images/pedicure-servico.jpg"
        },
        {
            title: "Botox Capilar Antifrizz (Luciana Bezerra)",
            category: "alinhamento",
            image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80"
        }
    ],
    testimonials: [
        {
            name: "Renata Vasconcellos",
            service: "Progressiva & Perfume Ruby Chocolate",
            rating: 5,
            text: "Fiz a progressiva em cabelo longo com a Luciana e o resultado foi maravilhoso, liso espelhado impecável! E já garanti meu Perfume Ruby Chocolate WePink com a Graziele.",
            date: "Há 1 semana",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
        },
        {
            name: "Carolina Meireles",
            service: "Designer Personalizado & Depilação",
            rating: 5,
            text: "O Designer Personalizado da Graziele por R$ 20 e a depilação suave foram perfeitos, muito cuidadosa e rápida. Amei o atendimento!",
            date: "Há 2 semanas",
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
        },
        {
            name: "Fernanda Takahashi",
            service: "Realinhamento & Botox Capilar",
            rating: 5,
            text: "A Luciana recuperou totalmente a saúde do meu cabelo com o realinhamento e botox capilar. O cabelo dura dias perfeito e o atendimento do salão é nota mil!",
            date: "Há 1 mês",
            avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80"
        }
    ],
    faqs: [
        {
            question: "Quais são os valores de Realinhamento, Botox e Progressiva?",
            answer: "O valor de Escova Progressiva, Realinhamento Capilar Orgânico e Botox Capilar é definido pelo tamanho do cabelo: Cabelos Curtos custam R$ 150,00 e Cabelos Grandes/Longos custam R$ 270,00."
        },
        {
            question: "Quais são os valores dos serviços de unhas (manicure e pedicure)?",
            answer: "Manicure (Mão): R$ 30,00 | Pedicure (Pé): R$ 30,00 | Combo Pé e Mão Completo: R$ 60,00."
        },
        {
            question: "Quais são os valores dos serviços de escova e hidratação?",
            answer: "Hidratação + Escova: R$ 120,00 | Hidratação + Escova + Babyliss: R$ 120,00."
        },
        {
            question: "Quais são os valores dos serviços de depilação e sobrancelhas?",
            answer: "Designer Personalizado: R$ 20,00 | Depilação Íntimo Completo: R$ 65,00 | Perna Completa: R$ 40,00 | Meia Perna: R$ 25,00 | Axilas: R$ 25,00 | Braços: R$ 25,00 | Depilação Facial: R$ 15,00."
        },
        {
            question: "Quais Perfumes e Body Splashes da WePink estão disponíveis?",
            answer: "Temos Perfumes Luxo (100ml) por R$ 170,00, Body Splashes (200ml) por R$ 70,00, Perfumes Capilares Hair Mist (50ml) por R$ 55,00 e Óleo Booster Repair por R$ 90,00 com ENTREGA 100% GRÁTIS!"
        },
        {
            question: "Quem é responsável pelo atendimento no WhatsApp?",
            answer: "A Luciana Bezerra cuida de cabelos, alisamentos e salão pelo WhatsApp (95) 98407-2160. A Graziele Bezerra cuida de todas as vendas WePink, depilação e sobrancelhas pelo WhatsApp (95) 98429-8305."
        },
        {
            question: "Quais são os dias e horários de funcionamento?",
            answer: "Funcionamos de Segunda a Sábado, das 10:00 às 18:00. Domingo fechado."
        }
    ]
};

if (typeof window !== 'undefined') {
    window.salonData = salonData;
}
