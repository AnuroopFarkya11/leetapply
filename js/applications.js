// ── Applications List Page Logic ──

const AppsPage = {
    currentFilter: { status: 'all', difficulty: 'all', search: '' },

    init() {
        this.bindFilters();
        this.refresh();
        this.showStreakBanner();
    },

    refresh() {
        this.render();
        this.updateCount();
        this.updateStatsCards();
    },

    bindFilters() {
        const searchInput = document.getElementById('filter-search');
        const statusSelect = document.getElementById('filter-status');
        const diffSelect = document.getElementById('filter-difficulty');

        if (searchInput) searchInput.addEventListener('input', (e) => {
            this.currentFilter.search = e.target.value.toLowerCase();
            this.render();
        });
        if (statusSelect) statusSelect.addEventListener('change', (e) => {
            this.currentFilter.status = e.target.value;
            this.render();
        });
        if (diffSelect) diffSelect.addEventListener('change', (e) => {
            this.currentFilter.difficulty = e.target.value;
            this.render();
        });
    },

    getFilteredApps() {
        let apps = Store.getApps();
        const f = this.currentFilter;
        if (f.status !== 'all') apps = apps.filter(a => a.status === f.status);
        if (f.difficulty !== 'all') apps = apps.filter(a => a.difficulty === f.difficulty);
        if (f.search) {
            apps = apps.filter(a =>
                a.company.toLowerCase().includes(f.search) ||
                a.role.toLowerCase().includes(f.search)
            );
        }
        return apps;
    },

    updateCount() {
        const el = document.getElementById('apps-count');
        if (el) el.textContent = `(${Store.getApps().length})`;
    },

    updateStatsCards() {
        const stats = Store.getStats();
        const el = (id) => document.getElementById(id);
        if (el('sc-total')) el('sc-total').textContent = stats.total;
        if (el('sc-interviews')) el('sc-interviews').textContent = stats.statusCounts.interview;
        if (el('sc-offers')) el('sc-offers').textContent = stats.statusCounts.offer;

        // Response rate = (screening + interview + offer + rejected) / total
        const responded = stats.statusCounts.screening + stats.statusCounts.interview +
            stats.statusCounts.offer + stats.statusCounts.rejected;
        const rate = stats.total > 0 ? Math.round((responded / stats.total) * 100) : 0;
        if (el('sc-response')) el('sc-response').textContent = rate + '%';
    },

    showStreakBanner() {
        const banner = document.getElementById('streak-banner');
        const message = document.getElementById('streak-message');
        if (!banner || !message) return;

        const stats = Store.getStats();
        const appliedToday = Store.hasAppliedToday();

        if (appliedToday) {
            banner.style.display = 'none';
            return;
        }

        banner.style.display = 'flex';

        if (stats.currentStreak > 0) {
            banner.className = 'streak-banner';
            message.textContent = `You have a ${stats.currentStreak} day streak! Apply today to keep it alive!`;
        } else if (stats.total > 0) {
            banner.className = 'streak-banner danger';
            message.textContent = `Your streak ended! Apply now to start a new one.`;
        } else {
            banner.className = 'streak-banner';
            message.textContent = `Start your job search journey! Add your first application.`;
        }
    },

    render() {
        const tbody = document.getElementById('apps-tbody');
        if (!tbody) return;
        const apps = this.getFilteredApps();

        if (apps.length === 0) {
            const isFiltered = this.currentFilter.status !== 'all' ||
                this.currentFilter.difficulty !== 'all' || this.currentFilter.search;
            const tableWrap = tbody.closest('.apps-table-wrap');

            if (Store.getApps().length === 0 && !isFiltered) {
                tableWrap.innerHTML = `
                    <div class="apps-empty">
                        <div class="empty-icon">\u{1F4CB}</div>
                        <h3>No applications yet</h3>
                        <p>Start tracking your job applications</p>
                        <button class="empty-btn" onclick="Modal.open()">+ Add First Application</button>
                    </div>`;
            } else {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted);">No matching applications</td></tr>`;
            }
            return;
        }

        tbody.innerHTML = apps.map(app => {
            const roundCount = (app.rounds && app.rounds.length) || 0;
            return `
            <tr data-id="${app.id}">
                <td>
                    <div class="app-company" style="cursor:pointer" onclick="EditModal.open('${app.id}')">${app.company}</div>
                    <div class="app-role">${app.role}</div>
                    ${roundCount > 0 ? `<div style="font-size:11px;color:var(--status-screening);margin-top:2px;">${roundCount} round${roundCount > 1 ? 's' : ''} logged</div>` : ''}
                </td>
                <td><span class="diff-tag ${app.difficulty}">${app.difficulty.charAt(0).toUpperCase() + app.difficulty.slice(1)}</span></td>
                <td class="app-date">${Store.formatDate(app.dateApplied)}</td>
                <td>${app.platform || '-'}</td>
                <td>
                    <select class="status-select ${app.status}" onchange="AppsPage.changeStatus('${app.id}', this.value)">
                        <option value="applied" ${app.status === 'applied' ? 'selected' : ''}>Applied</option>
                        <option value="screening" ${app.status === 'screening' ? 'selected' : ''}>Screening</option>
                        <option value="interview" ${app.status === 'interview' ? 'selected' : ''}>Interview</option>
                        <option value="offer" ${app.status === 'offer' ? 'selected' : ''}>Offer</option>
                        <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                    </select>
                </td>
                <td>
                    <div class="app-actions">
                        <button class="app-delete-btn" title="Edit" onclick="EditModal.open('${app.id}')" style="font-size:14px;">\u270E</button>
                        ${app.link ? `<a href="${app.link}" target="_blank" class="app-delete-btn" title="Open link">\u{1F517}</a>` : ''}
                        <button class="app-delete-btn" title="Delete" onclick="AppsPage.deleteApp('${app.id}')">\u00D7</button>
                    </div>
                </td>
            </tr>`;
        }).join('');
    },

    changeStatus(id, status) {
        Store.updateAppStatus(id, status);
        this.render();
        this.updateStatsCards();
    },

    deleteApp(id) {
        if (confirm('Delete this application?')) {
            Store.deleteApp(id);
            this.refresh();
            this.showStreakBanner();
        }
    },
};

// ── Edit Modal ──
const EditModal = {
    currentAppId: null,

    open(id) {
        this.currentAppId = id;
        const app = Store.getApp(id);
        if (!app) return;

        document.getElementById('edit-modal-title').textContent = `${app.company} — ${app.role}`;
        document.getElementById('edit-id').value = app.id;
        document.getElementById('edit-company').value = app.company;
        document.getElementById('edit-role').value = app.role;
        document.getElementById('edit-link').value = app.link || '';
        document.getElementById('edit-platform').value = app.platform || 'linkedin';
        document.getElementById('edit-date').value = app.dateApplied || '';
        document.getElementById('edit-notes').value = app.notes || '';

        // Set difficulty radio
        const diffRadio = document.getElementById(`edit-diff-${app.difficulty}`);
        if (diffRadio) diffRadio.checked = true;

        this.switchTab('details');
        this.renderRounds();
        document.getElementById('edit-modal').classList.add('active');
    },

    close() {
        document.getElementById('edit-modal').classList.remove('active');
        this.currentAppId = null;
        document.getElementById('round-form').style.display = 'none';
    },

    switchTab(tab) {
        document.querySelectorAll('[data-edit-tab]').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-edit-tab="${tab}"]`).classList.add('active');
        document.querySelectorAll('.modal-tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(`edit-tab-${tab}`).classList.add('active');
    },

    renderRounds() {
        const app = Store.getApp(this.currentAppId);
        const list = document.getElementById('rounds-list');
        if (!list || !app) return;

        const rounds = app.rounds || [];
        if (rounds.length === 0) {
            list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px;">No interview rounds logged yet</div>';
            return;
        }

        const outcomeColors = {
            pending: 'background:var(--status-interview-bg);color:var(--status-interview)',
            cleared: 'background:var(--status-offer-bg);color:var(--status-offer)',
            failed: 'background:var(--status-rejected-bg);color:var(--status-rejected)',
            ghosted: 'background:var(--subtle-bg);color:var(--text-muted)',
        };

        list.innerHTML = rounds.map((r, i) => `
            <div class="round-card">
                <div class="round-header">
                    <span class="round-title">Round ${i + 1}: ${r.type}</span>
                    <div style="display:flex;align-items:center;gap:6px;">
                        <span class="round-outcome" style="${outcomeColors[r.outcome] || ''}">${r.outcome.charAt(0).toUpperCase() + r.outcome.slice(1)}</span>
                        <button class="app-delete-btn" onclick="EditModal.deleteRound('${r.id}')" style="width:24px;height:24px;font-size:14px;">\u00D7</button>
                    </div>
                </div>
                ${r.date ? `<div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">${Store.formatDate(r.date)}</div>` : ''}
                ${r.notes ? `<div class="round-notes">${r.notes.replace(/\n/g, '<br>')}</div>` : ''}
            </div>
        `).join('');
    },

    toggleRoundForm() {
        const form = document.getElementById('round-form');
        form.style.display = form.style.display === 'none' ? 'flex' : 'none';
        if (form.style.display === 'flex') {
            document.getElementById('round-date').value = new Date().toISOString().split('T')[0];
        }
    },

    saveRound() {
        const round = {
            type: document.getElementById('round-type').value,
            date: document.getElementById('round-date').value,
            outcome: document.getElementById('round-outcome').value,
            notes: document.getElementById('round-notes').value.trim(),
        };

        Store.addRound(this.currentAppId, round);
        this.renderRounds();
        document.getElementById('round-form').style.display = 'none';
        document.getElementById('round-notes').value = '';
        AppsPage.render();
    },

    deleteRound(roundId) {
        Store.deleteRound(this.currentAppId, roundId);
        this.renderRounds();
        AppsPage.render();
    },
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('apps-tbody')) {
        AppsPage.init();
    }

    // Edit form submit
    const editForm = document.getElementById('edit-app-form');
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            Store.updateApp(EditModal.currentAppId, {
                company: formData.get('company').trim(),
                role: formData.get('role').trim(),
                link: formData.get('link').trim(),
                difficulty: formData.get('difficulty'),
                platform: formData.get('platform'),
                dateApplied: formData.get('dateApplied'),
                notes: formData.get('notes').trim(),
            });
            EditModal.close();
            AppsPage.refresh();
        });
    }

    // Edit modal overlay close
    const editOverlay = document.getElementById('edit-modal');
    if (editOverlay) {
        editOverlay.addEventListener('click', (e) => {
            if (e.target === editOverlay) EditModal.close();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && editOverlay.classList.contains('active')) EditModal.close();
        });
    }
});