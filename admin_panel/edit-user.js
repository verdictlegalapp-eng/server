let adminToken = localStorage.getItem('verdict_admin_token');
const params = new URLSearchParams(window.location.search);
const userId = params.get('id');

if (!userId || !adminToken) {
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadUserData();
    
    document.getElementById('edit-user-form').addEventListener('submit', handleUpdate);
    document.getElementById('direct-notif-form').addEventListener('submit', handleDirectNotif);
});

async function handleDirectNotif(e) {
    e.preventDefault();
    const payload = {
        target: 'individual',
        userId: userId,
        title: document.getElementById('notif-title').value,
        body: document.getElementById('notif-body').value
    };

    try {
        const response = await fetch('/api/admin/send-notification', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (data.success) {
            alert('Notification sent to user!');
            e.target.reset();
        } else {
            alert('Failed: ' + data.message);
        }
    } catch (err) {
        alert('Connection error');
    }
}

async function loadUserData() {
    try {
        // We can fetch from general list for now or add a specific get user route
        // Since we don't have a specific get user by ID route yet, let's just use the current data if passed or fetch all
        // For better stability, I'll use the prompt values passed in URL for now or fetch
        const name = params.get('name') || '';
        const email = params.get('email') || '';
        
        document.getElementById('user-name').value = name;
        document.getElementById('user-email').value = email;
        
    } catch (err) {
        console.error('Load error:', err);
    }
}

async function handleUpdate(e) {
    e.preventDefault();
    
    const payload = {
        name: document.getElementById('user-name').value,
        email: document.getElementById('user-email').value,
        role: document.getElementById('user-role').value,
        city: document.getElementById('user-city').value,
        state: document.getElementById('user-state').value
    };

    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        if (data.success) {
            alert('User updated successfully!');
            window.location.href = 'index.html';
        } else {
            alert('Update failed: ' + data.message);
        }
    } catch (err) {
        alert('Connection error');
    }
}
