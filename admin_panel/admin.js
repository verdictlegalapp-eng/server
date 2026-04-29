document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initTabs();
    refreshAll();
});

let adminToken = localStorage.getItem('verdict_admin_token');

async function checkAuth() {
    if (!adminToken) {
        const password = prompt('Enter Admin Password:');
        if (password) {
            try {
                const response = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });
                const data = await response.json();
                if (data.success) {
                    adminToken = data.data.token;
                    localStorage.setItem('verdict_admin_token', adminToken);
                    refreshAll();
                } else {
                    alert('Invalid password');
                    checkAuth();
                }
            } catch (err) {
                alert('Login failed');
            }
        }
    }
}

function authFetch(url, options = {}) {
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${adminToken}`
        }
    });
}

function refreshAll() {
    if (!adminToken) return;
    loadDashboard();
    loadClients();
    loadAttorneys();
    loadVerifications();
}

// Tab Navigation Logic
function initTabs() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const pageTitle = document.getElementById('page-title');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.getAttribute('data-tab');
            if (!tabId) return;

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            tabPanes.forEach(pane => pane.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');

            pageTitle.textContent = item.querySelector('span').textContent + ' Overview';
        });
    });

    document.getElementById('btn-sync-db').addEventListener('click', async () => {
        if (!confirm('This will synchronize your database schema. Proceed?')) return;
        try {
            const response = await authFetch('/api/admin/sync-db', { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                alert('Database synced successfully!');
                refreshAll();
            } else {
                alert('Sync failed: ' + data.message);
            }
        } catch (err) {
            alert('Error during sync');
        }
    });
}

// Dashboard Data
async function loadDashboard() {
    try {
        const response = await authFetch('/api/admin/stats');
        const { data } = await response.json();
        
        document.querySelector('.stat-card:nth-child(1) .number').textContent = data.totalClients.toLocaleString();
        document.querySelector('.stat-card:nth-child(2) .number').textContent = data.totalAttorneys.toLocaleString();
        document.querySelector('.stat-card:nth-child(3) .number').textContent = data.pendingVerifications.toLocaleString();
        document.querySelector('.stat-card:nth-child(4) .number').textContent = `$${data.revenue.toLocaleString()}`;
        
        document.getElementById('verification-count').textContent = data.pendingVerifications;
    } catch (err) {
        console.error('Stats error:', err);
    }
}

// Clients Data
async function loadClients() {
    try {
        const response = await authFetch('/api/admin/clients');
        const { data } = await response.json();
        const tableBody = document.getElementById('clients-table-body');

        tableBody.innerHTML = data.map(client => `
            <tr>
                <td>
                    <div class="user-cell">
                        <div class="avatar" style="width: 32px; height: 32px; font-size: 12px;">${(client.name || 'U').split(' ').map(n => n[0]).join('')}</div>
                        <span>${client.name || 'Anonymous User'}</span>
                    </div>
                </td>
                <td>${client.email || '—'}</td>
                <td>${client.city || ''}, ${client.state || ''}</td>
                <td><span class="status-badge status-active">Active</span></td>
                <td>
                    <button class="btn btn-link" style="color: #3b82f6; font-size: 12px;"><i class="fas fa-edit"></i> Edit</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Clients error:', err);
    }
}

// Attorneys Data
async function loadAttorneys() {
    try {
        const response = await authFetch('/api/admin/attorneys');
        const { data } = await response.json();
        const tableBody = document.getElementById('attorneys-table-body');

        tableBody.innerHTML = data.map(atty => `
            <tr>
                <td>
                    <div class="user-cell">
                        <div class="avatar" style="width: 32px; height: 32px; font-size: 12px; background-color: #10b981;">${(atty.name || 'A').split(' ').map(n => n[0]).join('')}</div>
                        <span>${atty.name || 'Attorney'}</span>
                    </div>
                </td>
                <td>${atty.lawyerProfile?.practice || 'General'}</td>
                <td>${atty.state || '—'}</td>
                <td><span class="status-badge status-active">Verified</span></td>
                <td>
                    <button class="btn btn-link" style="color: #3b82f6; font-size: 12px;"><i class="fas fa-eye"></i> Profile</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Attorneys error:', err);
    }
}

// Verifications Logic
async function loadVerifications() {
    try {
        const response = await authFetch('/api/admin/verifications');
        const { data } = await response.json();
        const list = document.getElementById('verifications-list');
        const recentList = document.getElementById('recent-verifications-list');

        const pending = data.filter(r => r.status === 'pending');

        list.innerHTML = pending.map(item => `
            <div class="verify-card">
                <div class="attorney-info">
                    <div class="avatar" style="width: 44px; height: 44px;">${(item.name || 'A').split(' ').map(n => n[0]).join('')}</div>
                    <div>
                        <h4>${item.name}</h4>
                        <p class="practice">Applied for Verification</p>
                    </div>
                </div>
                <div class="verify-details">
                    <div><span>Bar State:</span> ${item.state}</div>
                    <div><span>Bar ID:</span> ${item.barId}</div>
                    <div><span>Submitted:</span> ${new Date(item.createdAt).toLocaleDateString()}</div>
                </div>
                <div class="action-btns">
                    <button class="btn btn-approve btn-small" onclick="verifyAction('${item.id}', 'approve')">Approve</button>
                    <button class="btn btn-reject btn-small" onclick="verifyAction('${item.id}', 'reject')">Reject</button>
                </div>
            </div>
        `).join('');

        // Also update recent activity on dashboard
        recentList.innerHTML = data.slice(0, 5).map(act => `
            <div class="activity-item" style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #f1f5f9;">
                <div style="display: flex; gap: 12px; align-items: center;">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; color: #475569;">
                        ${(act.name || 'A').split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <p style="font-weight: 600; font-size: 14px;">${act.name}</p>
                        <p style="font-size: 12px; color: #64748b;">Attorney • ${new Date(act.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <span class="status-badge ${act.status === 'approved' ? 'status-active' : 'status-pending'}">${act.status}</span>
            </div>
        `).join('');
    } catch (err) {
        console.error('Verifications error:', err);
    }
}

async function verifyAction(id, action) {
    if (!confirm(`Are you sure you want to ${action} this request?`)) return;
    try {
        const response = await authFetch(`/api/admin/verifications/${id}/${action}`, { method: 'POST' });
        const data = await response.json();
        if (data.success) {
            refreshAll();
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert('Action failed');
    }
}
