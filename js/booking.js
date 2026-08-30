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
        this.selectedTime = '10:00';
        this.modalSearchQuery = '';
        this.clientData = {
            name: '',
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
        this.customTimeInput = document.getElementById('bookingCustomTime');
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
        const notesInput = document.getElementById('clientNotes');

        if (nameInput) nameInput.addEventListener('input', (e) => this.clientData.name = e.target.value);
        if (notesInput) notesInput.addEventListener('input', (e) => this.clientData.notes = e.target.value);

        // Data mínima para hoje
        if (this.dateInput) {
            const today = new Date().toISOString().split('T')[0];
            this.dateInput.min = today;
            this.dateInput.value = today;
            this.selectedDate = today;

            this.dateInput.addEventListener('change', (e) => {
                this.selectedDate = e.target.value;
                this.updateSummary();
            });
        }

        // Horário customizado
        if (this.customTimeInput) {
            this.customTimeInput.value = this.selectedTime;
            this.customTimeInput.addEventListener('input', (e) => {
                if (e.target.value) {
                    this.selectedTime = e.target.value;
                    this.highlightActiveTimeSlot();
                    this.updateSummary();
                }
            });
        }
    }

    populateModalData() {
        if (!this.servicesListEl || !this.professionalsListEl) return;

        // Renderizar Serviços no Modal
        this.renderServicesList();

        // Renderizar Especialistas de acordo com os procedimentos
        this.updateProfessionalsUI();

        // Renderizar Horários
        this.updateTimeSlots();
    }

    renderServicesList() {
        if (!this.servicesListEl) return;

        this.servicesListEl.innerHTML = salonData.services.map(s => {
            let priceText = '';
            if (s.priceDisplay) {
                priceText = `<span style="font-size:0.85rem; color:var(--gold-600); font-weight:700;">${s.priceDisplay}</span>`;
            } else if (s.price > 0) {
                priceText = `R$ ${s.price.toFixed(2).replace('.', ',')}`;
            } else {
                priceText = `<span style="font-size:0.85rem; color:var(--gold-600); font-weight:600;">Sob Consulta</span>`;
            }

            const proIcon = s.professionalId === 'luciana-bezerra' ? '💇‍♀️' : '🌸';
            const proName = s.professionalName || (s.professionalId === 'luciana-bezerra' ? 'Luciana Bezerra' : 'Graziele Bezerra');
            const isSelected = this.selectedServices.includes(s.id);

            return `
            <div class="modal-service-option ${isSelected ? 'selected' : ''}" data-id="${s.id}" data-pro="${s.professionalId || ''}">
                <div style="flex:1; padding-right:0.8rem;">
                    <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; margin-bottom:0.2rem;">
                        <strong style="color:var(--text-primary); font-size:0.95rem;">${s.name}</strong>
                        <span style="font-size:0.72rem; font-weight:600; background:var(--gold-100); color:var(--gold-700); padding:0.15rem 0.5rem; border-radius:999px; border:1px solid var(--gold-300);">
                            ${proIcon} ${proName}
                        </span>
                    </div>
                    <span style="font-size:0.8rem; color:var(--text-muted);">⏱️ ${s.duration}</span>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:700; color:var(--gold-600); font-family:var(--font-heading); font-size:1.05rem;">
                        ${priceText}
                    </div>
                    <span style="font-size:0.75rem; color:${isSelected ? 'var(--gold-700)' : 'var(--text-muted)'}; font-weight:600;">
                        ${isSelected ? '✓ Selecionado' : '+ Adicionar'}
                    </span>
                </div>
            </div>
        `}).join('');

        // Event listener para seleção de serviços
        this.servicesListEl.querySelectorAll('.modal-service-option').forEach(el => {
            el.addEventListener('click', () => {
                const id = el.dataset.id;
                this.toggleService(id);
            });
        });
    }

    updateProfessionalsUI() {
        if (!this.professionalsListEl) return;

        const selectedObjs = salonData.services.filter(s => this.selectedServices.includes(s.id));
        const lucianaServices = selectedObjs.filter(s => s.professionalId === 'luciana-bezerra');
        const grazieleServices = selectedObjs.filter(s => s.professionalId === 'graziele-bezerra');

        const hasLuciana = lucianaServices.length > 0;
        const hasGraziele = grazieleServices.length > 0;

        // Caso 1: Procedimentos selecionados de AMBAS as especialistas (Atendimento Conjunto)
        if (hasLuciana && hasGraziele) {
            this.selectedProfessional = 'combo-both';
            this.professionalsListEl.innerHTML = `
                <div class="modal-dual-pro-container" style="grid-column: 1 / -1;">
                    <div class="modal-dual-pro-header">
                        <span>✨</span> Atendimento Especializado em Conjunto
                    </div>
                    <div class="modal-dual-pro-list">
                        <div class="dual-pro-card">
                            <div class="modal-pro-badge">LB</div>
                            <div>
                                <strong>Luciana Bezerra</strong>
                                <span class="dual-services-text">✂️ Cabelos & Unhas: <strong>${lucianaServices.map(s => s.name).join(', ')}</strong></span>
                            </div>
                        </div>
                        <div class="dual-pro-card">
                            <div class="modal-pro-badge">GB</div>
                            <div>
                                <strong>Graziele Bezerra</strong>
                                <span class="dual-services-text">🌸 Sobrancelhas & Depilação: <strong>${grazieleServices.map(s => s.name).join(', ')}</strong></span>
                            </div>
                        </div>
                    </div>
                    <div style="font-size:0.78rem; color:var(--text-muted); margin-top:0.75rem; text-align:center;">
                        🔒 Cada procedimento será realizado com exclusividade pela sua respectiva especialista técnica.
                    </div>
                </div>
            `;
            return;
        }

        // Caso 2: Apenas serviços da Luciana (Cabelos, Alisamentos, Escovas, Manicure, Pedicure)
        if (hasLuciana && !hasGraziele) {
            this.selectedProfessional = 'luciana-bezerra';
            this.professionalsListEl.innerHTML = `
                <div class="modal-pro-option selected" data-id="luciana-bezerra" style="grid-column: 1 / -1;">
                    <div class="modal-pro-badge">LB</div>
                    <div class="modal-pro-text">
                        <span class="modal-pro-name">Luciana Bezerra</span>
                        <span class="modal-pro-role">Master Hair Stylist & Visagista (Cabelos, Alisamentos & Unhas)</span>
                        <span class="modal-pro-badge-tag tag-success">✓ Especialista exclusiva designada para seus procedimentos</span>
                    </div>
                </div>
                <div class="modal-pro-option disabled" data-id="graziele-bezerra">
                    <div class="modal-pro-badge">GB</div>
                    <div class="modal-pro-text">
                        <span class="modal-pro-name">Graziele Bezerra</span>
                        <span class="modal-pro-role">Sobrancelhas, Depilação & WePink</span>
                        <span class="modal-pro-badge-tag tag-disabled">🔒 Especialista exclusiva em Sobrancelhas e Depilação</span>
                    </div>
                </div>
            `;
            return;
        }

        // Caso 3: Apenas serviços da Graziele (Sobrancelhas, Henna, Depilações)
        if (!hasLuciana && hasGraziele) {
            this.selectedProfessional = 'graziele-bezerra';
            this.professionalsListEl.innerHTML = `
                <div class="modal-pro-option selected" data-id="graziele-bezerra" style="grid-column: 1 / -1;">
                    <div class="modal-pro-badge">GB</div>
                    <div class="modal-pro-text">
                        <span class="modal-pro-name">Graziele Bezerra</span>
                        <span class="modal-pro-role">Designer de Sobrancelhas & Depilação Suave</span>
                        <span class="modal-pro-badge-tag tag-success">✓ Especialista exclusiva designada para seus procedimentos</span>
                    </div>
                </div>
                <div class="modal-pro-option disabled" data-id="luciana-bezerra">
                    <div class="modal-pro-badge">LB</div>
                    <div class="modal-pro-text">
                        <span class="modal-pro-name">Luciana Bezerra</span>
                        <span class="modal-pro-role">Cabelos, Alisamentos & Unhas</span>
                        <span class="modal-pro-badge-tag tag-disabled">🔒 Especialista exclusiva em Cabelos e Unhas</span>
                    </div>
                </div>
            `;
            return;
        }

        // Caso 4: Nenhum serviço selecionado ainda
        this.selectedProfessional = 'any';
        this.professionalsListEl.innerHTML = `
            <div class="modal-pro-option selected" data-id="any">
                <div class="modal-pro-badge star-badge">⭐</div>
                <div class="modal-pro-text">
                    <span class="modal-pro-name">Automático por Especialidade</span>
                    <span class="modal-pro-role">Designada conforme a categoria do procedimento</span>
                </div>
            </div>
            <div class="modal-pro-option" data-id="luciana-bezerra">
                <div class="modal-pro-badge">LB</div>
                <div class="modal-pro-text">
                    <span class="modal-pro-name">Luciana Bezerra</span>
                    <span class="modal-pro-role">Cabelos, Alisamentos & Unhas</span>
                </div>
            </div>
            <div class="modal-pro-option" data-id="graziele-bezerra">
                <div class="modal-pro-badge">GB</div>
                <div class="modal-pro-text">
                    <span class="modal-pro-name">Graziele Bezerra</span>
                    <span class="modal-pro-role">Sobrancelhas & Depilação</span>
                </div>
            </div>
        `;

        this.professionalsListEl.querySelectorAll('.modal-pro-option:not(.disabled)').forEach(el => {
            el.addEventListener('click', () => {
                this.selectProfessional(el.dataset.id);
            });
        });
    }

    updateCombosUI() {
        const alertEl = document.getElementById('modalSelectedAlert');
        const countBadge = document.getElementById('selectedServicesCount');
        
        if (countBadge) {
            countBadge.innerText = `${this.selectedServices.length} selecionado(s)`;
        }

        if (alertEl) {
            if (this.selectedServices.length > 0) {
                const selectedNames = salonData.services
                    .filter(s => this.selectedServices.includes(s.id))
                    .map(s => s.name)
                    .join(', ');
                alertEl.style.display = 'flex';
                alertEl.innerHTML = `
                    <div class="modal-selected-alert-text">
                        ✨ <strong>${this.selectedServices.length} serviço(s) no agendamento:</strong> ${selectedNames}
                    </div>
                `;
            } else {
                alertEl.style.display = 'none';
            }
        }

        // Atualizar chips rápidos
        document.querySelectorAll('.combo-chip-btn').forEach(chip => {
            const serviceId = chip.dataset.id;
            chip.classList.toggle('selected', this.selectedServices.includes(serviceId));
        });
    }

    selectProfessional(proId) {
        this.selectedProfessional = proId || 'any';
        if (this.professionalsListEl) {
            this.professionalsListEl.querySelectorAll('.modal-pro-option:not(.disabled)').forEach(item => {
                item.classList.toggle('selected', item.dataset.id === this.selectedProfessional);
            });
        }
        this.updateSummary();
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
                const timeVal = btn.innerText.trim();
                this.setTime(timeVal);
            });
        });

        if (!this.selectedTime) {
            this.setTime(slots[0]);
        }
    }

    setTime(timeVal) {
        this.selectedTime = timeVal;
        if (this.customTimeInput) {
            this.customTimeInput.value = timeVal;
        }
        this.highlightActiveTimeSlot();
        this.updateSummary();
    }

    highlightActiveTimeSlot() {
        if (!this.timeSlotsEl) return;
        this.timeSlotsEl.querySelectorAll('.time-slot-btn').forEach(btn => {
            const isMatch = btn.innerText.trim() === this.selectedTime;
            btn.style.background = isMatch ? 'var(--gold-500)' : 'var(--bg-surface)';
            btn.style.color = isMatch ? '#fff' : 'var(--text-primary)';
        });
    }

    toggleService(serviceId) {
        const index = this.selectedServices.indexOf(serviceId);
        if (index > -1) {
            this.selectedServices.splice(index, 1);
        } else {
            this.selectedServices.push(serviceId);
        }
        this.renderServicesList();
        this.updateCombosUI();
        this.updateProfessionalsUI();
        this.updateSummary();
    }

    goToStep(stepNumber) {
        if (stepNumber >= 1 && stepNumber <= this.totalSteps) {
            this.currentStep = stepNumber;
            this.updateStepView();
        }
    }

    open(preselectedServiceId = null) {
        if (preselectedServiceId) {
            if (!this.selectedServices.includes(preselectedServiceId)) {
                this.selectedServices = [preselectedServiceId];
            }
        }
        
        this.renderServicesList();
        this.updateCombosUI();
        this.updateProfessionalsUI();
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
                window.showToast?.('Por favor, selecione ao menos um procedimento.');
                return;
            }
        } else if (this.currentStep === 2) {
            if (!this.selectedDate || !this.selectedTime) {
                window.showToast?.('Selecione uma data e o horário que você deseja.');
                return;
            }
        } else if (this.currentStep === 3) {
            if (!this.clientData.name || this.clientData.name.trim().length < 2) {
                window.showToast?.('Por favor, informe seu nome completo.');
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

        this.updateProfessionalsUI();
        this.updateSummary();
    }

    updateSummary() {
        const services = salonData.services.filter(s => this.selectedServices.includes(s.id));
        const totalPrice = services.reduce((acc, curr) => acc + curr.price, 0);
        const totalMinutes = services.reduce((acc, curr) => acc + curr.durationMinutes, 0);

        // Separar especialistas dos serviços
        const lucianaServices = services.filter(s => s.professionalId === 'luciana-bezerra');
        const grazieleServices = services.filter(s => s.professionalId === 'graziele-bezerra');

        // Formatar tempo total
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        let durationFormatted = '';
        if (hours > 0) durationFormatted += `${hours}h`;
        if (mins > 0) durationFormatted += `${mins}min`;
        if (!durationFormatted) durationFormatted = '0min';

        // Profissional designada
        let proDisplayName = '';
        if (lucianaServices.length > 0 && grazieleServices.length > 0) {
            proDisplayName = 'Luciana Bezerra (Cabelos/Unhas) & Graziele Bezerra (Sobrancelhas/Depilação)';
        } else if (grazieleServices.length > 0) {
            proDisplayName = 'Graziele Bezerra (Designer de Sobrancelhas & Depilação)';
        } else if (lucianaServices.length > 0) {
            proDisplayName = 'Luciana Bezerra (Master Hair Stylist & Unhas)';
        } else {
            proDisplayName = 'Conforme Especialidade';
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
            if (lucianaServices.length > 0 && grazieleServices.length > 0) {
                this.summaryServicesEl.innerHTML = `
                    <div style="margin-bottom:0.4rem;"><strong>💇‍♀️ Luciana:</strong> ${lucianaServices.map(s => s.name).join(', ')}</div>
                    <div><strong>🌸 Graziele:</strong> ${grazieleServices.map(s => s.name).join(', ')}</div>
                `;
            } else {
                this.summaryServicesEl.innerHTML = services.length > 0 
                    ? services.map(s => `<div>• ${s.name} ${s.price > 0 ? `(R$ ${s.price.toFixed(2).replace('.', ',')})` : '(Sob consulta)'}</div>`).join('')
                    : '<em>Nenhum serviço selecionado</em>';
            }
        }

        if (this.summaryProEl) this.summaryProEl.innerText = proDisplayName;
        if (this.summaryDateTimeEl) this.summaryDateTimeEl.innerText = `${dateFormatted} às ${this.selectedTime || '--:--'}`;
        if (this.summaryDurationEl) this.summaryDurationEl.innerText = durationFormatted;
        if (this.summaryTotalPriceEl) this.summaryTotalPriceEl.innerText = priceDisplay;
    }

    completeBooking() {
        const services = salonData.services.filter(s => this.selectedServices.includes(s.id));
        const totalPrice = services.reduce((acc, curr) => acc + curr.price, 0);
        const hasCustomPrice = services.some(s => s.price === 0);
        
        const lucianaServices = services.filter(s => s.professionalId === 'luciana-bezerra');
        const grazieleServices = services.filter(s => s.professionalId === 'graziele-bezerra');

        let proDisplayName = '';
        let targetWhatsapp = salonData.info.whatsapp || '5595984072160';

        if (lucianaServices.length > 0 && grazieleServices.length > 0) {
            proDisplayName = 'Luciana Bezerra (Cabelos/Unhas) & Graziele Bezerra (Sobrancelhas/Depilação)';
            targetWhatsapp = salonData.info.whatsapp; // Luciana coordena
        } else if (grazieleServices.length > 0) {
            proDisplayName = 'Graziele Bezerra (Designer de Sobrancelhas & Depilação)';
            targetWhatsapp = salonData.info.whatsappVendas || '5595984298305';
        } else {
            proDisplayName = 'Luciana Bezerra (Master Hair Stylist & Visagista)';
            targetWhatsapp = salonData.info.whatsapp || '5595984072160';
        }

        const [y, m, d] = this.selectedDate.split('-');
        const dateFormatted = `${d}/${m}/${y}`;

        const totalFormatted = totalPrice > 0 
            ? (hasCustomPrice ? `R$ ${totalPrice.toFixed(2).replace('.', ',')} (+ itens sob consulta)` : `R$ ${totalPrice.toFixed(2).replace('.', ',')}`)
            : 'A consultar no WhatsApp';

        // Montar lista de serviços na mensagem
        let servicesSection = '';
        if (lucianaServices.length > 0 && grazieleServices.length > 0) {
            servicesSection = 
`💇‍♀️ *Procedimentos Luciana Bezerra (Cabelos & Unhas):*
${lucianaServices.map(s => `  • ${s.name} - ${s.price > 0 ? `R$ ${s.price.toFixed(2).replace('.', ',')}` : 'Sob consulta'}`).join('\n')}

🌸 *Procedimentos Graziele Bezerra (Sobrancelhas & Depilação):*
${grazieleServices.map(s => `  • ${s.name} - ${s.price > 0 ? `R$ ${s.price.toFixed(2).replace('.', ',')}` : 'Sob consulta'}`).join('\n')}`;
        } else {
            servicesSection = 
`✂️ *Procedimento(s):*
${services.map(s => `• ${s.name} - ${s.price > 0 ? `R$ ${s.price.toFixed(2).replace('.', ',')}` : 'Consultar no WhatsApp'}`).join('\n')}`;
        }

        // Montar mensagem para o WhatsApp
        const message = 
`✨ *SOLICITAÇÃO DE AGENDAMENTO - GLAMOUR STUDIO* ✨
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Cliente:* ${this.clientData.name}

${servicesSection}

💰 *Valor Estimado:* ${totalFormatted}
👩‍🦰 *Especialista(s):* ${proDisplayName}
📅 *Data:* ${dateFormatted}
🕒 *Horário Desejado:* ${this.selectedTime}
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

