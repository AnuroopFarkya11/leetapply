// ── LeetApply Data Store (localStorage) ──

const Store = {
    KEYS: {
        APPS: 'leetapply_applications',
        PROFILE: 'leetapply_profile',
    },

    // ── Profile ──
    getProfile() {
        const data = localStorage.getItem(this.KEYS.PROFILE);
        return data ? JSON.parse(data) : null;
    },

    hasProfile() {
        return localStorage.getItem(this.KEYS.PROFILE) !== null;
    },

    saveProfile(profile) {
        localStorage.setItem(this.KEYS.PROFILE, JSON.stringify(profile));
    },

    // ── Applications ──
    getApps() {
        const data = localStorage.getItem(this.KEYS.APPS);
        return data ? JSON.parse(data) : [];
    },

    saveApps(apps) {
        localStorage.setItem(this.KEYS.APPS, JSON.stringify(apps));
    },

    addApp(app) {
        const apps = this.getApps();
        app.id = this._generateId();
        app.createdAt = new Date().toISOString();
        apps.unshift(app); // newest first
        this.saveApps(apps);
        return app;
    },

    updateAppStatus(id, status) {
        const apps = this.getApps();
        const app = apps.find(a => a.id === id);
        if (app) {
            app.status = status;
            this.saveApps(apps);
        }
        return app;
    },

    updateApp(id, updates) {
        const apps = this.getApps();
        const idx = apps.findIndex(a => a.id === id);
        if (idx !== -1) {
            apps[idx] = { ...apps[idx], ...updates };
            this.saveApps(apps);
        }
        return apps[idx];
    },

    getApp(id) {
        return this.getApps().find(a => a.id === id) || null;
    },

    addRound(appId, round) {
        const apps = this.getApps();
        const app = apps.find(a => a.id === appId);
        if (app) {
            if (!app.rounds) app.rounds = [];
            round.id = this._generateId();
            app.rounds.push(round);
            this.saveApps(apps);
        }
        return app;
    },

    deleteRound(appId, roundId) {
        const apps = this.getApps();
        const app = apps.find(a => a.id === appId);
        if (app && app.rounds) {
            app.rounds = app.rounds.filter(r => r.id !== roundId);
            this.saveApps(apps);
        }
    },

    deleteApp(id) {
        const apps = this.getApps().filter(a => a.id !== id);
        this.saveApps(apps);
    },

    hasAppliedToday() {
        const today = new Date().toISOString().split('T')[0];
        return this.getApps().some(a => a.dateApplied === today);
    },

    // ── Stats ──
    getStats() {
        const apps = this.getApps();
        const total = apps.length;
        const easy = apps.filter(a => a.difficulty === 'easy').length;
        const medium = apps.filter(a => a.difficulty === 'medium').length;
        const hard = apps.filter(a => a.difficulty === 'hard').length;

        const statusCounts = {
            applied: apps.filter(a => a.status === 'applied').length,
            screening: apps.filter(a => a.status === 'screening').length,
            interview: apps.filter(a => a.status === 'interview').length,
            offer: apps.filter(a => a.status === 'offer').length,
            rejected: apps.filter(a => a.status === 'rejected').length,
        };

        // Heatmap data: count applications per day
        const heatmap = {};
        apps.forEach(app => {
            const date = app.dateApplied;
            if (date) {
                heatmap[date] = (heatmap[date] || 0) + 1;
            }
        });

        // Streak calculation
        const { currentStreak, maxStreak, totalActiveDays } = this._calculateStreaks(heatmap);

        return {
            total, easy, medium, hard,
            statusCounts, heatmap,
            currentStreak, maxStreak, totalActiveDays,
        };
    },

    _calculateStreaks(heatmap) {
        if (Object.keys(heatmap).length === 0) {
            return { currentStreak: 0, maxStreak: 0, totalActiveDays: 0 };
        }

        const totalActiveDays = Object.keys(heatmap).length;

        // Sort dates
        const dates = Object.keys(heatmap).sort();

        // Calculate max streak
        let maxStreak = 1, streak = 1;
        for (let i = 1; i < dates.length; i++) {
            const prev = new Date(dates[i - 1]);
            const curr = new Date(dates[i]);
            const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
            if (diffDays === 1) {
                streak++;
                maxStreak = Math.max(maxStreak, streak);
            } else {
                streak = 1;
            }
        }

        // Calculate current streak (from today backwards)
        let currentStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(today);

        while (true) {
            const dateStr = checkDate.toISOString().split('T')[0];
            if (heatmap[dateStr]) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        return { currentStreak, maxStreak, totalActiveDays };
    },

    // ── Helpers ──
    _generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },

    // Format relative date
    formatRelativeDate(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return '1d';
        if (diffDays < 7) return diffDays + 'd';
        if (diffDays < 30) return Math.floor(diffDays / 7) + 'w';
        if (diffDays < 365) return Math.floor(diffDays / 30) + 'mo';
        return Math.floor(diffDays / 365) + 'y';
    },

    formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
        });
    },
};