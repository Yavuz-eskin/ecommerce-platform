const API_URL = 'http://localhost:8081/api';

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
                    username: document.getElementById('loginUsername').value,
                    password: document.getElementById('loginPassword').value
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
                    username: document.getElementById('regUsername').value,
                    email: document.getElementById('regEmail').value,
                    password: document.getElementById('regPassword').value,
                    role: document.getElementById('regRole').value
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

    // Add Product
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Adding...';

            try {
                const res = await fetch(`${API_URL}/products`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        name: document.getElementById('prodName').value,
                        description: document.getElementById('prodDesc').value,
                        price: parseFloat(document.getElementById('prodPrice').value),
                        stockQuantity: parseInt(document.getElementById('prodStock').value),
                        categoryId: parseInt(document.getElementById('prodCategory').value)
                    })
                });
                
                const data = await res.json();
                if(res.ok) {
                    showToast('Product added successfully!', 'success');
                    addProductForm.reset();
                    loadVendorDashboard(); // refresh product list
                } else {
                    showToast(data.message || 'Failed to add product', 'error');
                }
            } catch (err) {
                showToast('Connection error', 'error');
            } finally {
                btn.innerHTML = originalText;
            }
        });
    }
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
        loadCategories();
        loadVendorDashboard();
    } else {
        document.getElementById('customerSection').classList.remove('hidden');
        document.getElementById('vendorSection').classList.add('hidden');
        loadAllProducts();
    }
}

async function loadCategories() {
    try {
        const res = await fetch(`${API_URL}/categories`);
        if (res.ok) {
            const categories = await res.json();
            const select = document.getElementById('prodCategory');
            select.innerHTML = '<option value="" disabled selected>Select a category</option>';
            categories.forEach(cat => {
                select.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
            });
        }
    } catch (err) {
        console.error('Failed to load categories', err);
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
        const addProductCard = document.getElementById('addProductCard');
        const myProductsCard = document.getElementById('myProductsCard');

        if (res.ok) {
            const store = await res.json();
            noStoreCard.classList.add('hidden');
            myStoreCard.classList.remove('hidden');
            addProductCard.classList.remove('hidden');
            myProductsCard.classList.remove('hidden');
            
            document.getElementById('displayStoreName').innerText = store.name;
            document.getElementById('displayStoreDesc').innerText = store.description || 'No description provided.';
            document.getElementById('displayStoreStatus').innerText = store.status;
            
            // set avatar initial
            document.querySelector('.store-avatar').innerText = store.name.charAt(0).toUpperCase();

            // load vendor products
            loadVendorProducts();
        } else if (res.status === 404 || res.status === 400 || res.status === 500) {
            noStoreCard.classList.remove('hidden');
            myStoreCard.classList.add('hidden');
            addProductCard.classList.add('hidden');
            myProductsCard.classList.add('hidden');
        }
    } catch (err) {
        console.error('Failed to load store', err);
    }
}

async function loadVendorProducts() {
    try {
        const res = await fetch(`${API_URL}/products/my-products`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (res.ok) {
            const products = await res.json();
            document.getElementById('statProductCount').innerText = products.length;
            
            const list = document.getElementById('vendorProductsList');
            list.innerHTML = '';
            
            if (products.length === 0) {
                list.innerHTML = '<p class="text-secondary">No products yet.</p>';
                return;
            }

            products.forEach(p => {
                list.innerHTML += `
                    <div class="product-card">
                        <div class="product-header">
                            <span class="product-cat">${p.categoryName}</span>
                            <span class="product-price">$${p.price.toFixed(2)}</span>
                        </div>
                        <h4 class="product-title">${p.name}</h4>
                        <p class="product-desc">${p.description || ''}</p>
                        <div class="product-footer">
                            <span class="product-stock">Stock: ${p.stockQuantity}</span>
                        </div>
                    </div>
                `;
            });
        }
    } catch (err) {
        console.error('Failed to load products', err);
    }
}

async function loadAllProducts() {
    try {
        const res = await fetch(`${API_URL}/products`);
        if (res.ok) {
            const products = await res.json();
            const list = document.getElementById('customerProductList');
            list.innerHTML = '';
            
            if (products.length === 0) {
                list.innerHTML = '<p class="text-secondary">No products available at the moment.</p>';
                return;
            }

            products.forEach(p => {
                list.innerHTML += `
                    <div class="product-card">
                        <div class="product-header">
                            <span class="product-cat">${p.categoryName}</span>
                            <span class="product-price">$${p.price.toFixed(2)}</span>
                        </div>
                        <h4 class="product-title">${p.name}</h4>
                        <p class="product-desc">${p.description || ''}</p>
                        <div class="product-footer">
                            <span class="product-store">By: ${p.storeName}</span>
                            <button class="btn primary-btn small-btn">Add to Cart</button>
                        </div>
                    </div>
                `;
            });
        }
    } catch (err) {
        console.error('Failed to load all products', err);
    }
}

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
