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
    
    const btnRevoke = document.getElementById('btn-revoke');
    if (btnRevoke) {
        btnRevoke.addEventListener('click', handleRevoke);
    }
});

async function handleRevoke() {
    if (!confirm('Are you sure you want to revoke this attorney\'s verification? This will remove their badge and set them to unverified status.')) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/users/${userId}/revoke-verification`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${adminToken}`
            }
        });
        const data = await response.json();
        if (data.success) {
            alert('Verification revoked!');
            document.getElementById('verification-section').style.display = 'none';
        } else {
            alert('Failed: ' + data.message);
        }
    } catch (err) {
        alert('Connection error');
    }
}

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
        // Since we don't have a direct GET user, let's fetch all attorneys and find this one
        // or just rely on the role check if we add a way to get it
        const name = params.get('name') || '';
        const email = params.get('email') || '';
        
        document.getElementById('user-name').value = name;
        document.getElementById('user-email').value = email;

        // Fetch all attorneys to see if this one is verified
        const response = await fetch('/api/admin/attorneys', {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data = await response.json();
        if (data.success) {
            const attorney = data.data.find(u => u.id === userId);
            if (attorney) {
                document.getElementById('user-role').value = 'lawyer';
                if (attorney.lawyerProfile) {
                    document.getElementById('user-city').value = attorney.lawyerProfile.city || '';
                    document.getElementById('user-state').value = attorney.lawyerProfile.state || '';
                    
                    if (attorney.lawyerProfile.isVerified) {
                        document.getElementById('verification-section').style.display = 'block';
                    }
                }
            }
        }
        
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
