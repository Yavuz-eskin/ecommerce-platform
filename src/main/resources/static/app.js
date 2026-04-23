const API_URL = 'http://localhost:8080/api';

// State
let currentUser = null;

// DOM Elements
const authView = document.getElementById('authView');
const dashboardView = document.getElementById('dashboardView');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const tabBtns = document.querySelectorAll('.tab-btn');
const toast = document.getElementById('toast');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            tabBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const targetId = e.target.getAttribute('data-target');
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Loading...';
        
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: loginForm.loginUsername.value,
                    password: loginForm.loginPassword.value
                })
            });
            
            const data = await res.json();
            if(res.ok) {
                handleLoginSuccess(data);
            } else {
                showToast(data.message || 'Login failed', 'error');
            }
        } catch (err) {
            showToast('Connection error. Is backend running?', 'error');
        } finally {
            btn.innerHTML = originalText;
        }
    });

    // Register
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Creating...';

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: registerForm.regUsername.value,
                    email: registerForm.regEmail.value,
                    password: registerForm.regPassword.value,
                    role: registerForm.regRole.value
                })
            });
            
            const data = await res.json();
            if(res.ok) {
                handleLoginSuccess(data);
            } else {
                showToast(data.message || 'Registration failed', 'error');
            }
        } catch (err) {
            showToast('Connection error', 'error');
        } finally {
            btn.innerHTML = originalText;
        }
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        currentUser = null;
        switchView('auth');
        showToast('Logged out successfully', 'success');
    });

    // Create Store
    document.getElementById('createStoreForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Creating...';

        try {
            const res = await fetch(`${API_URL}/stores`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name: document.getElementById('storeName').value,
                    description: document.getElementById('storeDesc').value
                })
            });
            
            const data = await res.json();
            if(res.ok) {
                showToast('Store created successfully!', 'success');
                loadVendorDashboard(); // refresh
            } else {
                showToast(data.message || 'Failed to create store', 'error');
            }
        } catch (err) {
            showToast('Connection error', 'error');
        } finally {
            btn.innerHTML = originalText;
        }
    });
}

function handleLoginSuccess(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({
        username: data.username,
        role: data.role
    }));
    currentUser = data;
    
    loginForm.reset();
    registerForm.reset();
    
    showToast(`Welcome back, ${data.username}!`, 'success');
    initDashboard();
}

function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        currentUser = JSON.parse(user);
        initDashboard();
    } else {
        switchView('auth');
    }
}

function switchView(viewName) {
    if (viewName === 'auth') {
        authView.classList.add('active');
        dashboardView.classList.remove('active');
    } else {
        authView.classList.remove('active');
        dashboardView.classList.add('active');
    }
}

function initDashboard() {
    switchView('dashboard');
    document.getElementById('welcomeText').innerText = currentUser.username;
    
    if (currentUser.role === 'VENDOR') {
        document.getElementById('vendorSection').classList.remove('hidden');
        document.getElementById('customerSection').classList.add('hidden');
        loadVendorDashboard();
    } else {
        document.getElementById('customerSection').classList.remove('hidden');
        document.getElementById('vendorSection').classList.add('hidden');
    }
}

async function loadVendorDashboard() {
    try {
        const res = await fetch(`${API_URL}/stores/my-store`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const noStoreCard = document.getElementById('noStoreCard');
        const myStoreCard = document.getElementById('myStoreCard');

        if (res.ok) {
            const store = await res.json();
            noStoreCard.classList.add('hidden');
            myStoreCard.classList.remove('hidden');
            
            document.getElementById('displayStoreName').innerText = store.name;
            document.getElementById('displayStoreDesc').innerText = store.description || 'No description provided.';
            document.getElementById('displayStoreStatus').innerText = store.status;
            
            // set avatar initial
            document.querySelector('.store-avatar').innerText = store.name.charAt(0).toUpperCase();
        } else if (res.status === 404 || res.status === 400 || res.status === 500) {
            // Probably no store yet
            noStoreCard.classList.remove('hidden');
            myStoreCard.classList.add('hidden');
        }
    } catch (err) {
        console.error('Failed to load store', err);
    }
}

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
