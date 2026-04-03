// ── Onboarding Flow ──

const Onboarding = {
    overlay: null,
    currentStep: 1,
    totalSteps: 3,

    init() {
        if (Store.hasProfile()) return;
        this.overlay = document.getElementById('onboarding-overlay');
        if (!this.overlay) return;
        this.overlay.classList.add('active');
        this.showStep(1);
    },

    showStep(step) {
        this.currentStep = step;
        // Hide all steps
        this.overlay.querySelectorAll('.onboarding-step').forEach(s => s.classList.remove('active'));
        // Show current
        const current = this.overlay.querySelector(`[data-step="${step}"]`);
        if (current) current.classList.add('active');
        // Update dots
        this.overlay.querySelectorAll('.onboarding-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i < step);
        });
        // Update buttons
        const backBtn = document.getElementById('ob-back');
        const nextBtn = document.getElementById('ob-next');
        const finishBtn = document.getElementById('ob-finish');
        if (backBtn) backBtn.style.display = step > 1 ? '' : 'none';
        if (nextBtn) nextBtn.style.display = step < this.totalSteps ? '' : 'none';
        if (finishBtn) finishBtn.style.display = step === this.totalSteps ? '' : 'none';
        // Update next button text
        if (nextBtn && step === 1) nextBtn.textContent = 'Get Started';
        if (nextBtn && step === 2) nextBtn.textContent = 'Next';
    },

    next() {
        if (this.currentStep < this.totalSteps) {
            this.showStep(this.currentStep + 1);
            // Focus first input on step 2
            if (this.currentStep === 2) {
                const input = this.overlay.querySelector('[data-step="2"] input');
                if (input) setTimeout(() => input.focus(), 100);
            }
        }
    },

    back() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
        }
    },

    finish() {
        const get = (id) => {
            const el = document.getElementById(id);
            return el ? el.value.trim() : '';
        };

        const name = get('ob-name');
        if (!name) {
            document.getElementById('ob-name').focus();
            return;
        }

        // Collect skills from chips
        const skillEls = this.overlay.querySelectorAll('.ob-skill-chip.selected');
        const skills = Array.from(skillEls).map(el => el.textContent);

        const profile = {
            name: name,
            username: get('ob-username') || name.toLowerCase().replace(/\s+/g, ''),
            company: get('ob-company'),
            role: get('ob-role'),
            location: get('ob-location'),
            university: get('ob-university'),
            target: get('ob-target'),
            github: get('ob-github'),
            skills: skills,
        };

        Store.saveProfile(profile);
        this.overlay.classList.remove('active');

        // Refresh profile if on dashboard
        if (typeof ProfilePage !== 'undefined' && ProfilePage.renderProfile) {
            ProfilePage.renderProfile();
        }
        // Update navbar avatar on any page
        const navAvatar = document.querySelector('.navbar-avatar');
        if (navAvatar) {
            const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase();
            navAvatar.textContent = initials;
        }
    },

    toggleSkill(el) {
        el.classList.toggle('selected');
    },
};

document.addEventListener('DOMContentLoaded', () => Onboarding.init());
