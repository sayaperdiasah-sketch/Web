const API_BASE = 'http://localhost:5000/api';

// Fungsi fetch helper
async function apiGet(endpoint) {
    const res = await fetch(API_BASE + endpoint);
    return res.json();
}

async function apiPost(endpoint, data) {
    const res = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
}

// Load user info
async function loadUserInfo() {
    const data = await apiGet('/user');
    document.getElementById('level').textContent = data.level;
    document.getElementById('xp').textContent = data.total_xp;
    document.getElementById('streak').textContent = data.current_streak;
}

// Load aktivitas
async function loadActivities() {
    const data = await apiGet('/activities');
    const container = document.getElementById('activities-list');
    container.innerHTML = '';
    data.forEach(activity => {
        const div = document.createElement('div');
        div.className = 'activity-item';
        div.innerHTML = `
            <div>
                <strong>${activity.title}</strong> 
                <small>(${activity.category}, ${activity.difficulty}, weight ${activity.weight})</small>
                <p>${activity.description || ''}</p>
            </div>
            <button onclick="completeActivity(${activity.id})">Selesai</button>
        `;
        container.appendChild(div);
    });
}

// Complete activity
async function completeActivity(activityId) {
    const data = await apiPost('/complete_activity', { activity_id: activityId });
    alert(`XP +${data.xp_earned}! Level: ${data.level}, Streak: ${data.current_streak}`);
    loadUserInfo();
}

// Check-in energi
document.querySelectorAll('.energy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        const energy = btn.dataset.energy;
        const data = await apiPost('/checkin', { energy });
        document.getElementById('checkin-result').textContent = `Check-in berhasil: ${data.energy}`;
    });
});

// Rekomendasi
document.getElementById('recommend-btn').addEventListener('click', async () => {
    const text = document.getElementById('recommend-input').value;
    if (!text) return alert('Isi dulu input rekomendasi');
    const data = await apiPost('/recommend', { text });
    const container = document.getElementById('recommend-results');
    container.innerHTML = '<h3>Hasil Rekomendasi:</h3>';
    data.forEach(item => {
        container.innerHTML += `<p><strong>${item.title}</strong> (score: ${item.similarity_score}) - ${item.description}</p>`;
    });
});

// Custom activity
document.getElementById('custom-create-btn').addEventListener('click', async () => {
    const title = document.getElementById('custom-title').value;
    const description = document.getElementById('custom-desc').value;
    const category = document.getElementById('custom-category').value;
    const difficulty = document.getElementById('custom-difficulty').value;
    if (!title) return alert('Judul wajib diisi');
    const data = await apiPost('/custom_activity', { title, description, category, difficulty });
    alert('Aktivitas custom dibuat!');
    loadActivities();
    document.getElementById('custom-title').value = '';
    document.getElementById('custom-desc').value = '';
});

// Chat AI Coach
document.getElementById('chat-send-btn').addEventListener('click', async () => {
    const input = document.getElementById('chat-input');
    const message = input.value;
    if (!message) return;
    // Tampilkan pesan user
    const log = document.getElementById('chat-log');
    log.innerHTML += `<div class="chat-message user">${message}</div>`;
    input.value = '';
    const data = await apiPost('/chat', { message });
    log.innerHTML += `<div class="chat-message ai">${data.response}</div>`;
    log.scrollTop = log.scrollHeight;
});

// Restart
document.getElementById('restart-btn').addEventListener('click', async () => {
    if (confirm('Reset streak? XP dan level tetap tersimpan.')) {
        const data = await apiPost('/restart', {});
        alert(data.message);
        loadUserInfo();
    }
});

// Inisialisasi
loadUserInfo();
loadActivities();
