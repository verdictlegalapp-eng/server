document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    loadDashboard();
    loadClients();
    loadAttorneys();
    loadVerifications();
});

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

            // Update active nav
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Update active pane
            tabPanes.forEach(pane => pane.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');

            // Update title
            pageTitle.textContent = item.querySelector('span').textContent + ' Overview';
        });
    });
}

// Dashboard Data
function loadDashboard() {
    const activityList = document.getElementById('recent-verifications-list');
    const activities = [
        { name: 'Sarah Jenkins', type: 'Attorney', time: '2 mins ago', status: 'Pending' },
        { name: 'Robert Fox', type: 'Attorney', time: '1 hour ago', status: 'Verified' },
        { name: 'Michael Chen', type: 'Attorney', time: '3 hours ago', status: 'Pending' },
        { name: 'Emily Davis', type: 'Attorney', time: '5 hours ago', status: 'Verified' }
    ];

    activityList.innerHTML = activities.map(act => `
        <div class="activity-item" style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #f1f5f9;">
            <div style="display: flex; gap: 12px; align-items: center;">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; color: #475569;">
                    ${act.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                    <p style="font-weight: 600; font-size: 14px;">${act.name}</p>
                    <p style="font-size: 12px; color: #64748b;">${act.type} • ${act.time}</p>
                </div>
            </div>
            <span class="status-badge ${act.status === 'Verified' ? 'status-active' : 'status-pending'}">${act.status}</span>
        </div>
    `).join('');
}

// Clients Data
function loadClients() {
    const tableBody = document.getElementById('clients-table-body');
    const clients = [
        { name: 'John Doe', email: 'john@example.com', location: 'Los Angeles, CA', status: 'Active' },
        { name: 'Jane Smith', email: 'jane@example.com', location: 'Austin, TX', status: 'Active' },
        { name: 'Alex Johnson', email: 'alex@example.com', location: 'Miami, FL', status: 'Inactive' },
        { name: 'Maria Garcia', email: 'maria@example.com', location: 'Chicago, IL', status: 'Active' },
        { name: 'David Wilson', email: 'david@example.com', location: 'Seattle, WA', status: 'Active' }
    ];

    tableBody.innerHTML = clients.map(client => `
        <tr>
            <td>
                <div class="user-cell">
                    <div class="avatar" style="width: 32px; height: 32px; font-size: 12px;">${client.name.split(' ').map(n => n[0]).join('')}</div>
                    <span>${client.name}</span>
                </div>
            </td>
            <td>${client.email}</td>
            <td>${client.location}</td>
            <td><span class="status-badge ${client.status === 'Active' ? 'status-active' : 'status-inactive'}">${client.status}</span></td>
            <td>
                <button class="btn btn-link" style="color: #3b82f6; font-size: 12px;"><i class="fas fa-edit"></i> Edit</button>
            </td>
        </tr>
    `).join('');
}

// Attorneys Data
function loadAttorneys() {
    const tableBody = document.getElementById('attorneys-table-body');
    const attorneys = [
        { name: 'Noufal Mace', spec: 'Criminal Law', state: 'California', status: 'Verified' },
        { name: 'Sarah Jenkins', spec: 'Family Law', state: 'Texas', status: 'Pending' },
        { name: 'Robert Fox', spec: 'Corporate Law', state: 'New York', status: 'Verified' },
        { name: 'Emily Davis', spec: 'Intellectual Property', state: 'Florida', status: 'Verified' }
    ];

    tableBody.innerHTML = attorneys.map(atty => `
        <tr>
            <td>
                <div class="user-cell">
                    <div class="avatar" style="width: 32px; height: 32px; font-size: 12px; background-color: #10b981;">${atty.name.split(' ').map(n => n[0]).join('')}</div>
                    <span>${atty.name}</span>
                </div>
            </td>
            <td>${atty.spec}</td>
            <td>${atty.state}</td>
            <td><span class="status-badge ${atty.status === 'Verified' ? 'status-active' : 'status-pending'}">${atty.status}</span></td>
            <td>
                <button class="btn btn-link" style="color: #3b82f6; font-size: 12px;"><i class="fas fa-eye"></i> Profile</button>
            </td>
        </tr>
    `).join('');
}

// Verifications Logic
function loadVerifications() {
    const list = document.getElementById('verifications-list');
    const pending = [
        { name: 'Sarah Jenkins', state: 'Texas', barId: 'TX-882910', submitted: '2 hours ago', docs: ['Bar Card', 'Gov ID'] },
        { name: 'Michael Chen', state: 'California', barId: 'CA-112093', submitted: '4 hours ago', docs: ['Bar Card'] },
        { name: 'Lucas Meyer', state: 'New York', barId: 'NY-445912', submitted: 'Yesterday', docs: ['Bar Card', 'Gov ID'] }
    ];

    list.innerHTML = pending.map(item => `
        <div class="verify-card">
            <div class="attorney-info">
                <div class="avatar" style="width: 44px; height: 44px;">${item.name.split(' ').map(n => n[0]).join('')}</div>
                <div>
                    <h4>${item.name}</h4>
                    <p class="practice">Applied for Verification</p>
                </div>
            </div>
            <div class="verify-details">
                <div><span>Bar State:</span> ${item.state}</div>
                <div><span>Bar ID:</span> ${item.barId}</div>
                <div><span>Submitted:</span> ${item.submitted}</div>
                <div style="margin-top: 8px;">
                    <span style="font-size: 11px; text-transform: uppercase; color: #64748b;">Documents:</span>
                    <div style="display: flex; gap: 5px; margin-top: 5px;">
                        ${item.docs.map(doc => `<span style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 10px;">${doc}</span>`).join('')}
                    </div>
                </div>
            </div>
            <div class="action-btns">
                <button class="btn btn-approve btn-small" onclick="verifyAction('${item.name}', 'approve')">Approve</button>
                <button class="btn btn-reject btn-small" onclick="verifyAction('${item.name}', 'reject')">Reject</button>
            </div>
        </div>
    `).join('');
}

function verifyAction(name, action) {
    const msg = action === 'approve' ? `Approved ${name}'s license.` : `Rejected ${name}'s request.`;
    alert(msg);
    // In a real app, this would call the API:
    // fetch('/api/admin/verify', { method: 'POST', body: JSON.stringify({ name, action }) })
}
