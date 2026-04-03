// ── Profile Page Logic ──

const ProfilePage = {
    init() {
        this.renderProfile();
        this.refresh();
        this.initTabs();
        this.showStreakBanner();
    },

    refresh() {
        const stats = Store.getStats();
        this.renderRing(stats);
        this.renderDiffBars(stats);
        this.renderHeatmap(stats);
        this.renderStatsBar(stats);
        this.renderBadges(stats);
        this.renderActiveTab();
    },

    renderProfile() {
        const profile = Store.getProfile();
        if (!profile) return; // onboarding not completed yet

        const el = (id) => document.getElementById(id);

        if (el('profile-name')) {
            // Preserve the verified badge SVG
            const svg = el('profile-name').querySelector('svg');
            el('profile-name').textContent = profile.name;
            if (svg) el('profile-name').appendChild(svg);
        }
        if (el('profile-username')) el('profile-username').textContent = profile.username;
        if (el('profile-company')) el('profile-company').textContent = profile.company && profile.role ? `${profile.company} | ${profile.role}` : (profile.company || profile.role || '');
        if (el('profile-location')) el('profile-location').textContent = profile.location || '';
        if (el('profile-university')) el('profile-university').textContent = profile.university || '';
        if (el('profile-target')) el('profile-target').textContent = profile.target ? `Target: ${profile.target}` : '';
        if (el('profile-github')) el('profile-github').textContent = profile.github || '';

        const skillsEl = el('profile-skills');
        if (skillsEl && profile.skills && profile.skills.length > 0) {
            skillsEl.innerHTML = profile.skills
                .map(s => `<span class="skill-tag">${s}</span>`).join('');
        }

        // Avatar initials
        const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase();
        const avatarEl = document.querySelector('.profile-avatar');
        if (avatarEl) avatarEl.textContent = initials;
        const navAvatar = document.querySelector('.navbar-avatar');
        if (navAvatar) navAvatar.textContent = initials;
    },

    renderRing(stats) {
        const countEl = document.getElementById('ring-count');
        const labelEl = document.getElementById('ring-label');
        if (countEl) countEl.textContent = stats.total;
        if (labelEl) labelEl.textContent = 'Applied';

        // Update SVG arcs
        const circumference = 2 * Math.PI * 58; // r=58
        const total = stats.total || 1;
        const easyRatio = stats.easy / Math.max(total, 1);
        const mediumRatio = stats.medium / Math.max(total, 1);
        const hardRatio = stats.hard / Math.max(total, 1);

        const easyArc = circumference * (1 - easyRatio);
        const mediumArc = circumference * (1 - easyRatio - mediumRatio);
        const hardArc = circumference * (1 - easyRatio - mediumRatio - hardRatio);

        const rings = document.querySelectorAll('.ring-arc');
        if (rings.length >= 3) {
            rings[0].setAttribute('stroke-dashoffset', hardArc);   // hard (bottom)
            rings[1].setAttribute('stroke-dashoffset', mediumArc); // medium
            rings[2].setAttribute('stroke-dashoffset', easyArc);   // easy (top)
        }
    },

    renderDiffBars(stats) {
        const target = { easy: 200, medium: 200, hard: 100 };
        ['easy', 'medium', 'hard'].forEach(diff => {
            const bar = document.getElementById(`bar-${diff}`);
            const count = document.getElementById(`count-${diff}`);
            if (bar) bar.style.width = `${(stats[diff] / target[diff]) * 100}%`;
            if (count) count.innerHTML = `${stats[diff]}<span class="diff-total">/${target[diff]}</span>`;
        });
    },

    renderStatsBar(stats) {
        const el = (id) => document.getElementById(id);
        if (el('stat-total-apps')) el('stat-total-apps').textContent = stats.total;
        if (el('stat-active-days')) el('stat-active-days').textContent = stats.totalActiveDays;
        if (el('stat-max-streak')) el('stat-max-streak').textContent = stats.maxStreak;
        if (el('stat-current-streak')) el('stat-current-streak').textContent = stats.currentStreak;

        // Community stats
        if (el('stat-community-active')) el('stat-community-active').textContent = stats.totalActiveDays;
        if (el('stat-interviews')) el('stat-interviews').textContent = stats.statusCounts.interview;
        if (el('stat-offers')) el('stat-offers').textContent = stats.statusCounts.offer;
        if (el('stat-rejections')) el('stat-rejections').textContent = stats.statusCounts.rejected;
    },

    renderBadges(stats) {
        // Simple badge logic
        const badges = [];
        if (stats.currentStreak >= 7) badges.push({ icon: '\u{1F525}', name: '7 Day Streak' });
        if (stats.currentStreak >= 30) badges.push({ icon: '\u{1F525}', name: '30 Day Streak' });
        if (stats.total >= 50) badges.push({ icon: '\u{1F4AF}', name: '50 Apps Club' });
        if (stats.total >= 100) badges.push({ icon: '\u{1F4AF}', name: '100 Apps Club' });
        if (stats.statusCounts.interview > 0) badges.push({ icon: '\u{1F3AF}', name: 'First Interview' });
        if (stats.statusCounts.offer > 0) badges.push({ icon: '\u{1F3C6}', name: 'First Offer' });

        const countEl = document.getElementById('badges-count');
        if (countEl) countEl.textContent = badges.length;

        const gridEl = document.getElementById('badges-grid');
        if (gridEl) {
            if (badges.length === 0) {
                gridEl.innerHTML = '<div style="color:var(--text-muted);font-size:13px;padding:16px;">Apply consistently to earn badges!</div>';
            } else {
                gridEl.innerHTML = badges.slice(0, 3).map(b =>
                    `<div class="badge-item"><div class="badge-icon">${b.icon}</div></div>`
                ).join('');
            }
        }

        const recentEl = document.getElementById('badge-recent');
        if (recentEl) {
            if (badges.length > 0) {
                recentEl.innerHTML = `Most Recent Badge<br><strong>${badges[badges.length - 1].name}</strong>`;
            } else {
                recentEl.innerHTML = 'No badges yet';
            }
        }
    },

    // ── Heatmap ──
    renderHeatmap(stats) {
        const svg = document.getElementById('heatmap');
        if (!svg) return;
        svg.innerHTML = '';

        // Get container width for responsive sizing
        const container = svg.parentElement;
        const containerWidth = container ? container.clientWidth - 4 : 700;

        const today = new Date();
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const startDate = new Date(oneYearAgo);
        startDate.setDate(startDate.getDate() - startDate.getDay());

        // Count total weeks to calculate cell size dynamically
        const totalDays = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const totalWeeks = Math.ceil(totalDays / 7) + 1;

        // Calculate cell size to fill container width
        const cellGap = 3;
        const cellSize = Math.floor((containerWidth - (totalWeeks - 1) * cellGap) / totalWeeks);
        const actualCellSize = Math.min(Math.max(cellSize, 8), 13); // clamp 8-13px
        const topPadding = 2, leftPadding = 0;
        const bottomPadding = 18;

        function getColor(count) {
            if (count === 0) return '#f0f0f0';
            if (count <= 2) return '#9be9a8';
            if (count <= 4) return '#40c463';
            if (count <= 6) return '#30a14e';
            return '#216e39';
        }

        const tooltip = document.getElementById('tooltip');
        const monthGap = 6; // extra gap between months
        let currentWeek = 0;
        const months = [];
        let lastMonth = -1;
        let xOffset = 0; // cumulative x offset including month gaps
        const weekXPositions = {}; // store x position for each week
        const d = new Date(startDate);

        // First pass: calculate week positions with month gaps
        const tempD = new Date(startDate);
        let tempWeek = 0;
        let tempLastMonth = -1;
        let tempOffset = 0;
        let tempI = 0;
        while (tempD <= today) {
            const day = tempD.getDay();
            if (tempI > 0 && day === 0) tempWeek++;
            const month = tempD.getMonth();
            if (month !== tempLastMonth) {
                // Add month gap except for the very first month
                if (tempLastMonth !== -1 && day === 0) {
                    tempOffset += monthGap;
                }
                tempLastMonth = month;
            }
            weekXPositions[tempWeek] = leftPadding + tempWeek * (actualCellSize + cellGap) + tempOffset;
            tempD.setDate(tempD.getDate() + 1);
            tempI++;
        }

        // Second pass: render cells
        let i = 0;
        let monthGapOffset = 0;
        while (d <= today) {
            const day = d.getDay();
            if (i > 0 && day === 0) currentWeek++;

            const month = d.getMonth();
            if (month !== lastMonth) {
                if (lastMonth !== -1 && day === 0) {
                    monthGapOffset += monthGap;
                }
                months.push({ month, week: currentWeek, offset: monthGapOffset });
                lastMonth = month;
            }

            const dateStr = d.toISOString().split('T')[0];
            const count = stats.heatmap[dateStr] || 0;

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            const x = leftPadding + currentWeek * (actualCellSize + cellGap) + monthGapOffset;
            const y = topPadding + day * (actualCellSize + cellGap);
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', actualCellSize);
            rect.setAttribute('height', actualCellSize);
            rect.setAttribute('rx', 2);
            rect.setAttribute('fill', getColor(count));
            rect.style.cursor = 'pointer';

            const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            rect.addEventListener('mouseenter', () => {
                tooltip.style.opacity = '1';
                tooltip.innerHTML = `<strong>${count} application${count !== 1 ? 's' : ''}</strong> on ${displayDate}`;
            });
            rect.addEventListener('mousemove', (e) => {
                tooltip.style.left = e.clientX + 12 + 'px';
                tooltip.style.top = e.clientY - 30 + 'px';
            });
            rect.addEventListener('mouseleave', () => { tooltip.style.opacity = '0'; });
            svg.appendChild(rect);

            d.setDate(d.getDate() + 1);
            i++;
        }

        // Month labels at BOTTOM
        const gridHeight = topPadding + 7 * (actualCellSize + cellGap);
        const mNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        months.forEach(m => {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', leftPadding + m.week * (actualCellSize + cellGap) + m.offset);
            text.setAttribute('y', gridHeight + 13);
            text.setAttribute('fill', '#b0b0b0');
            text.setAttribute('font-size', '10');
            text.setAttribute('font-family', 'Inter, sans-serif');
            text.textContent = mNames[m.month];
            svg.appendChild(text);
        });

        const totalWidth = leftPadding + (currentWeek + 1) * (actualCellSize + cellGap) + monthGapOffset;
        const totalHeight = gridHeight + bottomPadding;
        svg.setAttribute('width', totalWidth);
        svg.setAttribute('height', totalHeight);
        svg.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`);
        svg.style.width = '100%';
        svg.style.height = 'auto';
    },

    // ── Activity Tabs ──
    initTabs() {
        const tabs = document.querySelectorAll('.activity-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.renderActiveTab();
            });
        });
    },

    renderActiveTab() {
        const activeTab = document.querySelector('.activity-tab.active');
        if (!activeTab) return;
        const tabName = activeTab.dataset.tab;
        const apps = Store.getApps();
        const list = document.getElementById('activity-list');
        if (!list) return;

        const statusLabels = { applied: 'Applied', screening: 'Screening', interview: 'Interview', offer: 'Offer', rejected: 'Rejected' };

        let filtered;
        switch (tabName) {
            case 'applications': filtered = apps.slice(0, 8); break;
            case 'interviews': filtered = apps.filter(a => a.status === 'interview').slice(0, 8); break;
            case 'offers': filtered = apps.filter(a => a.status === 'offer').slice(0, 8); break;
            case 'rejections': filtered = apps.filter(a => a.status === 'rejected').slice(0, 8); break;
            default: filtered = apps.slice(0, 8);
        }

        if (filtered.length === 0) {
            list.innerHTML = `<li class="empty-state"><div class="empty-icon">\u{1F4CB}</div><p>No ${tabName} yet</p></li>`;
            return;
        }

        list.innerHTML = filtered.map(app => `
            <li class="activity-item">
                <div class="activity-info">
                    <div class="activity-company">${app.company}</div>
                    <div class="activity-role">${app.role}</div>
                </div>
                <span class="status-badge status-${app.status}">${statusLabels[app.status]}</span>
                <span class="activity-date">${Store.formatRelativeDate(app.dateApplied)}</span>
            </li>
        `).join('');
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
};

document.addEventListener('DOMContentLoaded', () => ProfilePage.init());