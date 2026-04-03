// ── Add Application Modal ──

const Modal = {
    overlay: null,

    init() {
        this.overlay = document.getElementById('add-modal');
        if (!this.overlay) return;

        // Close on overlay click
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.classList.contains('active')) {
                this.close();
            }
        });

        // Close button
        const closeBtn = this.overlay.querySelector('.modal-close');
        if (closeBtn) closeBtn.addEventListener('click', () => this.close());

        // Form submit
        const form = document.getElementById('add-app-form');
        if (form) form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Wire up all "add" buttons
        document.querySelectorAll('[data-action="open-add-modal"]').forEach(btn => {
            btn.addEventListener('click', () => this.open());
        });
    },

    open() {
        if (!this.overlay) return;
        this.overlay.classList.add('active');
        const firstInput = this.overlay.querySelector('input[name="company"]');
        if (firstInput) setTimeout(() => firstInput.focus(), 100);
    },

    close() {
        if (!this.overlay) return;
        this.overlay.classList.remove('active');
        const form = document.getElementById('add-app-form');
        if (form) form.reset();
        // Re-set date to today
        const dateInput = form?.querySelector('input[name="dateApplied"]');
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    },

    handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        const app = {
            company: formData.get('company').trim(),
            role: formData.get('role').trim(),
            link: formData.get('link').trim(),
            difficulty: formData.get('difficulty') || 'medium',
            platform: formData.get('platform'),
            dateApplied: formData.get('dateApplied'),
            notes: formData.get('notes').trim(),
            status: 'applied',
        };

        if (!app.company || !app.role) return;

        Store.addApp(app);
        this.close();

        // Refresh page data
        if (typeof ProfilePage !== 'undefined' && ProfilePage.refresh) {
            ProfilePage.refresh();
            ProfilePage.showStreakBanner();
        }
        if (typeof AppsPage !== 'undefined' && AppsPage.refresh) {
            AppsPage.refresh();
            AppsPage.showStreakBanner();
        }
    },
};

document.addEventListener('DOMContentLoaded', () => Modal.init());