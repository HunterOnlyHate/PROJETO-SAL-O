/**
 * GLAMOUR STUDIO - SISTEMA DE AGENDAMENTO INTERATIVO & INTEGRAÇÃO WHATSAPP
 * Personalizado para Graziele Bezerra e Luciana Bezerra
 */

class BookingSystem {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.selectedServices = [];
        this.selectedProfessional = null;
        this.selectedDate = '';
        this.selectedTime = '';
        this.clientData = {
            name: '',
            phone: '',
            notes: ''
        };

        this.initElements();
        this.bindEvents();
        this.populateModalData();
    }

    initElements() {
        this.modalBackdrop = document.getElementById('bookingModal');
        this.closeBtn = document.getElementById('closeBookingModal');
        this.prevBtn = document.getElementById('modalPrevBtn');
        this.nextBtn = document.getElementById('modalNextBtn');
        this.submitBtn = document.getElementById('modalSubmitBtn');
        
        this.stepIndicators = document.querySelectorAll('.step-indicator');
        this.stepContainers = document.querySelectorAll('.step-container');

        this.servicesListEl = document.getElementById('modalServicesList');
        this.professionalsListEl = document.getElementById('modalProfessionalsList');
        this.dateInput = document.getElementById('bookingDate');
        this.timeSlotsEl = document.getElementById('bookingTimeSlots');
        
        this.summaryServicesEl = document.getElementById('summaryServices');
        this.summaryProEl = document.getElementById('summaryProfessional');
        this.summaryDateTimeEl = document.getElementById('summaryDateTime');
        this.summaryDurationEl = document.getElementById('summaryDuration');
        this.summaryTotalPriceEl = document.getElementById('summaryTotalPrice');
    }

    bindEvents() {
        // Fechar Modal
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }

        if (this.modalBackdrop) {
            this.modalBackdrop.addEventListener('click', (e) => {
                if (e.target === this.modalBackdrop) this.close();
            });
        }

        // Navegação de Passos
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextStep());
        }

        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevStep());
        }

        if (this.submitBtn) {
            this.submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.completeBooking();
            });
        }

        // Eventos de inputs do cliente
        const nameInput = document.getElementById('clientName');
        const phoneInput = document.getElementById('clientPhone');
        const notesInput = document.getElementById('clientNotes');

        if (nameInput) nameInput.addEventListener('input', (e) => this.clientData.name = e.target.value);
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                let v = e.target.value.replace(/\D/g, '');
                if (v.length > 11) v = v.substring(0, 11);
                if (v.length > 10) {
                    v = v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                } else if (v.length > 5) {
                    v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
                } else if (v.length > 2) {
                    v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
                }
                e.target.value = v;
                this.clientData.phone = v;
            });
        }
        if (notesInput) notesInput.addEventListener('input', (e) => this.clientData.notes = e.target.value);

        // Data mínima para hoje
        if (this.dateInput) {
            const today = new Date().toISOString().split('T')[0];
            this.dateInput.min = today;
            this.dateInput.value = today;
            this.selectedDate = today;

            this.dateInput.addEventListener('change', (e) => {
                this.selectedDate = e.target.value;
                this.updateTimeSlots();
            });
        }
    }

    populateModalData() {
        if (!this.servicesListEl || !this.professionalsListEl) return;

        // Renderizar Serviços no Modal
        this.servicesListEl.innerHTML = salonData.services.map(s => {
            let priceText = '';
            if (s.priceDisplay) {
                priceText = `<span style="font-size:0.85rem; color:var(--gold-600); font-weight:700;">${s.priceDisplay}</span>`;
            } else if (s.price > 0) {
                priceText = `R$ ${s.price.toFixed(2).replace('.', ',')}`;
            } else {
                priceText = `<span style="font-size:0.85rem; color:var(--gold-600); font-weight:600;">Sob Consulta</span>`;
            }

            return `
            <div class="modal-service-option" data-id="${s.id}">
                <div>
                    <strong style="display:block; color:var(--text-primary); font-size:0.95rem;">${s.name}</strong>
                    <span style="font-size:0.8rem; color:var(--text-muted);">⏱️ ${s.duration}</span>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:700; color:var(--gold-600); font-family:var(--font-heading); font-size:1.05rem;">
                        ${priceText}
                    </div>
                </div>
            </div>
        `}).join('');

        // Event listener para seleção de serviços
        this.servicesListEl.querySelectorAll('.modal-service-option').forEach(el => {
            el.addEventListener('click', () => {
                const id = el.dataset.id;
                this.toggleService(id);
                el.classList.toggle('selected', this.selectedServices.includes(id));
                this.updateSummary();
            });
        });

        // Renderizar Profissionais no Modal
        let proHtml = `
            <div class="modal-pro-option selected" data-id="any">
                <div class="card-icon-circle" style="width:40px; height:40px; font-size:1.1rem;">⭐</div>
                <div>
                    <strong style="display:block; font-size:0.9rem;">Sem preferência</strong>
                    <span style="font-size:0.75rem; color:var(--text-muted);">Primeira especialista disponível</span>
                </div>
            </div>
        `;

        proHtml += salonData.professionals.map(p => {
            const initials = p.name.split(' ').map(n => n[0]).join('').substring(0, 2);
            return `
            <div class="modal-pro-option" data-id="${p.id}">
                <div class="card-icon-circle" style="width:40px; height:40px; font-size:0.88rem; font-weight:700; background:var(--gold-100); color:var(--gold-700); border:1px solid var(--gold-300);">${initials}</div>
                <div>
                    <strong style="display:block; font-size:0.9rem;">${p.name}</strong>
                    <span style="font-size:0.75rem; color:var(--text-muted);">${p.role}</span>
                </div>
            </div>
        `}).join('');

        this.professionalsListEl.innerHTML = proHtml;
        this.selectedProfessional = 'any';

        this.professionalsListEl.querySelectorAll('.modal-pro-option').forEach(el => {
            el.addEventListener('click', () => {
                this.professionalsListEl.querySelectorAll('.modal-pro-option').forEach(item => item.classList.remove('selected'));
                el.classList.add('selected');
                this.selectedProfessional = el.dataset.id;
                this.updateSummary();
            });
        });

        this.updateTimeSlots();
    }

    updateTimeSlots() {
        if (!this.timeSlotsEl) return;
        const slots = ["10:00", "11:00", "12:00", "13:30", "14:30", "15:30", "16:30", "17:00"];
        
        this.timeSlotsEl.innerHTML = `
            <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:0.6rem; margin-top:0.8rem;">
                ${slots.map(t => `
                    <button type="button" class="time-slot-btn ${this.selectedTime === t ? 'active' : ''}" 
                        style="padding:0.6rem 0.4rem; border-radius:var(--radius-sm); border:1px solid var(--border-gray); font-weight:600; font-size:0.85rem; background: ${this.selectedTime === t ? 'var(--gold-500)' : 'var(--bg-surface)'}; color: ${this.selectedTime === t ? '#fff' : 'var(--text-primary)'}; transition:var(--transition-fast);">
                        ${t}
                    </button>
                `).join('')}
            </div>
        `;

        this.timeSlotsEl.querySelectorAll('.time-slot-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.timeSlotsEl.querySelectorAll('.time-slot-btn').forEach(b => {
                    b.style.background = 'var(--bg-surface)';
                    b.style.color = 'var(--text-primary)';
                });
                btn.style.background = 'var(--gold-500)';
                btn.style.color = '#fff';
                this.selectedTime = btn.innerText.trim();
                this.updateSummary();
            });
        });

        if (!this.selectedTime) {
            this.selectedTime = slots[0];
        }
    }

    toggleService(serviceId) {
        const index = this.selectedServices.indexOf(serviceId);
        if (index > -1) {
            this.selectedServices.splice(index, 1);
        } else {
            this.selectedServices.push(serviceId);
        }
    }

    open(preselectedServiceId = null) {
        if (preselectedServiceId) {
            this.selectedServices = [preselectedServiceId];
            if (this.servicesListEl) {
                this.servicesListEl.querySelectorAll('.modal-service-option').forEach(el => {
                    el.classList.toggle('selected', el.dataset.id === preselectedServiceId);
                });
            }
        }
        
        this.currentStep = 1;
        this.updateStepView();
        this.updateSummary();
        
        if (this.modalBackdrop) {
            this.modalBackdrop.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    close() {
        if (this.modalBackdrop) {
            this.modalBackdrop.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    nextStep() {
        if (this.currentStep === 1) {
            if (this.selectedServices.length === 0) {
                window.showToast?.('Selecione ao menos um procedimento.');
                return;
            }
        } else if (this.currentStep === 2) {
            if (!this.selectedDate || !this.selectedTime) {
                window.showToast?.('Selecione uma data e horário.');
                return;
            }
        } else if (this.currentStep === 3) {
            if (!this.clientData.name || this.clientData.name.trim().length < 3) {
                window.showToast?.('Por favor, informe seu nome completo.');
                return;
            }
            if (!this.clientData.phone || this.clientData.phone.replace(/\D/g, '').length < 10) {
                window.showToast?.('Por favor, informe um WhatsApp válido.');
                return;
            }
        }

        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateStepView();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepView();
        }
    }

    updateStepView() {
        this.stepContainers.forEach((container, index) => {
            container.classList.toggle('active', index + 1 === this.currentStep);
        });

        this.stepIndicators.forEach((ind, index) => {
            ind.classList.toggle('active', index < this.currentStep);
        });

        if (this.prevBtn) {
            this.prevBtn.style.display = this.currentStep === 1 ? 'none' : 'inline-flex';
        }

        if (this.nextBtn && this.submitBtn) {
            if (this.currentStep === this.totalSteps) {
                this.nextBtn.style.display = 'none';
                this.submitBtn.style.display = 'inline-flex';
            } else {
                this.nextBtn.style.display = 'inline-flex';
                this.submitBtn.style.display = 'none';
            }
        }

        this.updateSummary();
    }

    updateSummary() {
        const services = salonData.services.filter(s => this.selectedServices.includes(s.id));
        const totalPrice = services.reduce((acc, curr) => acc + curr.price, 0);
        const totalMinutes = services.reduce((acc, curr) => acc + curr.durationMinutes, 0);

        // Formatar tempo total
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        let durationFormatted = '';
        if (hours > 0) durationFormatted += `${hours}h`;
        if (mins > 0) durationFormatted += `${mins}min`;
        if (!durationFormatted) durationFormatted = '0min';

        // Profissional selecionada
        let proName = 'Sem preferência (Primeira disponível)';
        if (this.selectedProfessional && this.selectedProfessional !== 'any') {
            const pro = salonData.professionals.find(p => p.id === this.selectedProfessional);
            if (pro) proName = pro.name;
        }

        // Data formatada
        let dateFormatted = this.selectedDate;
        if (this.selectedDate) {
            const [y, m, d] = this.selectedDate.split('-');
            dateFormatted = `${d}/${m}/${y}`;
        }

        const hasCustomPrice = services.some(s => s.price === 0);
        let priceDisplay = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
        if (hasCustomPrice) {
            priceDisplay = totalPrice > 0 
                ? `R$ ${totalPrice.toFixed(2).replace('.', ',')} (+ itens sob consulta)` 
                : 'A consultar no WhatsApp';
        }

        if (this.summaryServicesEl) {
            this.summaryServicesEl.innerHTML = services.length > 0 
                ? services.map(s => `<div>• ${s.name} ${s.price > 0 ? `(R$ ${s.price.toFixed(2).replace('.', ',')})` : '(Sob consulta)'}</div>`).join('')
                : '<em>Nenhum serviço selecionado</em>';
        }

        if (this.summaryProEl) this.summaryProEl.innerText = proName;
        if (this.summaryDateTimeEl) this.summaryDateTimeEl.innerText = `${dateFormatted} às ${this.selectedTime || '--:--'}`;
        if (this.summaryDurationEl) this.summaryDurationEl.innerText = durationFormatted;
        if (this.summaryTotalPriceEl) this.summaryTotalPriceEl.innerText = priceDisplay;
    }

    completeBooking() {
        const services = salonData.services.filter(s => this.selectedServices.includes(s.id));
        const totalPrice = services.reduce((acc, curr) => acc + curr.price, 0);
        const hasCustomPrice = services.some(s => s.price === 0);
        
        let proName = 'Sem preferência (Primeira disponível)';
        let targetWhatsapp = salonData.info.whatsapp;

        if (this.selectedProfessional && this.selectedProfessional !== 'any') {
            const pro = salonData.professionals.find(p => p.id === this.selectedProfessional);
            if (pro) {
                proName = `${pro.name} (${pro.role})`;
                if (pro.whatsapp) targetWhatsapp = pro.whatsapp;
            }
        }

        const [y, m, d] = this.selectedDate.split('-');
        const dateFormatted = `${d}/${m}/${y}`;

        const totalFormatted = totalPrice > 0 
            ? (hasCustomPrice ? `R$ ${totalPrice.toFixed(2).replace('.', ',')} (+ itens sob consulta)` : `R$ ${totalPrice.toFixed(2).replace('.', ',')}`)
            : 'A consultar no WhatsApp';

        // Montar mensagem para o WhatsApp
        const message = 
`✨ *SOLICITAÇÃO DE AGENDAMENTO - GLAMOUR STUDIO* ✨
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Cliente:* ${this.clientData.name}
📱 *WhatsApp:* ${this.clientData.phone}

✂️ *Procedimento(s):*
${services.map(s => `• ${s.name} - ${s.price > 0 ? `R$ ${s.price.toFixed(2).replace('.', ',')}` : 'Consultar no WhatsApp'}`).join('\n')}

💰 *Valor Estimado:* ${totalFormatted}
💇‍♀️ *Profissional:* ${proName}
📅 *Data:* ${dateFormatted}
🕒 *Horário:* ${this.selectedTime}
${this.clientData.notes ? `📝 *Observações:* ${this.clientData.notes}\n` : ''}━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 _Av. Tuxaua Farias, 259, Bonfim - RR, 69380-000 - Glamour Studio_`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${targetWhatsapp}?text=${encodedMessage}`;

        window.showToast?.('Agendamento preparado! Redirecionando para o WhatsApp...');

        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
            this.close();
        }, 800);
    }
}

// Instanciar globalmente após DOM carregado
let bookingApp;
document.addEventListener('DOMContentLoaded', () => {
    bookingApp = new BookingSystem();
    window.bookingApp = bookingApp;
});
