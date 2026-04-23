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
        doLogout();
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
        document.getElementById('vendorNavLinks').classList.remove('hidden');
        document.getElementById('customerNavLinks').classList.add('hidden');
        loadCategories();
        loadVendorDashboard();
        
        // Setup Vendor Nav
        setupNavTabs('vendorNavLinks', 'vendorSection');
    } else {
        document.getElementById('customerSection').classList.remove('hidden');
        document.getElementById('vendorSection').classList.add('hidden');
        document.getElementById('customerNavLinks').classList.remove('hidden');
        document.getElementById('vendorNavLinks').classList.add('hidden');
        loadAllProducts();
        loadCart();
        
        // Setup Customer Nav
        setupNavTabs('customerNavLinks', 'customerSection');
    }
}

function setupNavTabs(navId, sectionId) {
    const navBtns = document.getElementById(navId).querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        // remove old listeners
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', (e) => {
            document.getElementById(navId).querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active-nav'));
            e.currentTarget.classList.add('active-nav');
            
            const targetId = e.currentTarget.id;
            const section = document.getElementById(sectionId);
            section.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active', 'hidden'));
            section.querySelectorAll('.tab-content').forEach(tc => tc.classList.add('hidden'));
            
            if(targetId === 'vendorStoreBtn') {
                document.getElementById('vendorStoreTab').classList.remove('hidden');
                document.getElementById('vendorStoreTab').classList.add('active');
                loadVendorDashboard();
            } else if(targetId === 'vendorOrdersBtn') {
                document.getElementById('vendorOrdersTab').classList.remove('hidden');
                document.getElementById('vendorOrdersTab').classList.add('active');
                loadVendorOrders();
            } else if(targetId === 'shopBtn') {
                document.getElementById('customerShopTab').classList.remove('hidden');
                document.getElementById('customerShopTab').classList.add('active');
                loadAllProducts();
            } else if(targetId === 'cartBtn') {
                document.getElementById('customerCartTab').classList.remove('hidden');
                document.getElementById('customerCartTab').classList.add('active');
                loadCart();
            } else if(targetId === 'myOrdersBtn') {
                document.getElementById('customerOrdersTab').classList.remove('hidden');
                document.getElementById('customerOrdersTab').classList.add('active');
                loadCustomerOrders();
            }
        });
    });
}

// ================= VENDOR FUNCTIONS =================
async function loadCategories() {
    try {
        const res = await fetch(`${API_URL}/categories`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (res.ok) {
            const categories = await res.json();
            const select = document.getElementById('prodCategory');
            select.innerHTML = '<option value="" disabled selected>Select a category</option>';
            categories.forEach(cat => {
                select.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
            });
        } else if (res.status === 401 || res.status === 403) {
            doLogout();
            showToast('Session expired, please login again', 'error');
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
            loadVendorOrders(true); // only for stats update
        } else if (res.status === 401 || res.status === 403) {
            doLogout();
            showToast('Session expired, please login again', 'error');
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

function doLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    switchView('auth');
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

async function loadVendorOrders(statsOnly = false) {
    try {
        const res = await fetch(`${API_URL}/orders/vendor`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
            const orders = await res.json();
            
            // Update stats
            document.getElementById('statOrderCount').innerText = orders.length;
            let revenue = orders.reduce((sum, item) => sum + item.subTotal, 0);
            document.getElementById('statRevenue').innerText = `$${revenue.toFixed(2)}`;
            
            if(statsOnly) return;
            
            const tbody = document.getElementById('vendorOrderList');
            tbody.innerHTML = '';
            
            if(orders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">No orders found.</td></tr>';
                return;
            }
            
            orders.forEach(o => {
                let statusClass = `status-${o.status.toLowerCase()}`;
                
                let actionHtml = '';
                if(o.status === 'PENDING') {
                    actionHtml = `<button class="btn primary-btn small-btn" onclick="updateOrderStatus(${o.id}, 'SHIPPED')">Ship</button>`;
                } else if(o.status === 'SHIPPED') {
                    actionHtml = `<button class="btn outline-btn small-btn" onclick="updateOrderStatus(${o.id}, 'DELIVERED')">Deliver</button>`;
                } else {
                    actionHtml = `<span class="text-secondary">Done</span>`;
                }
                
                tbody.innerHTML += `
                    <tr>
                        <td>${new Date(o.orderDate).toLocaleDateString()}</td>
                        <td>${o.productName}</td>
                        <td>${o.customerName}</td>
                        <td>${o.quantity}</td>
                        <td class="product-price">$${o.subTotal.toFixed(2)}</td>
                        <td><span class="status-badge ${statusClass}">${o.status}</span></td>
                        <td>${actionHtml}</td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        console.error('Failed to load vendor orders', err);
    }
}

async function updateOrderStatus(itemId, status) {
    try {
        const res = await fetch(`${API_URL}/orders/vendor/${itemId}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status: status })
        });
        if(res.ok) {
            showToast('Order status updated', 'success');
            loadVendorOrders(); // refresh
        } else {
            showToast('Failed to update status', 'error');
        }
    } catch (err) {
        showToast('Connection error', 'error');
    }
}

// ================= CUSTOMER FUNCTIONS =================
async function loadAllProducts() {
    try {
        const res = await fetch(`${API_URL}/products`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
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
                            <button class="btn primary-btn small-btn" onclick="addToCart(${p.id})">Add to Cart</button>
                        </div>
                    </div>
                `;
            });
        } else if (res.status === 401 || res.status === 403) {
            doLogout();
            showToast('Session expired, please login again', 'error');
        }
    } catch (err) {
        console.error('Failed to load all products', err);
    }
}

async function addToCart(productId) {
    try {
        const res = await fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ productId: productId, quantity: 1 })
        });
        
        if (res.ok) {
            showToast('Added to cart', 'success');
            const cartResponse = await res.json();
            updateCartBadge(cartResponse.items.length);
        } else {
            const data = await res.json();
            showToast(data.message || 'Failed to add to cart', 'error');
        }
    } catch (err) {
        showToast('Connection error', 'error');
    }
}

async function loadCart() {
    try {
        const res = await fetch(`${API_URL}/cart`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
            const cart = await res.json();
            updateCartBadge(cart.items.length);
            
            const list = document.getElementById('cartItemsList');
            list.innerHTML = '';
            
            if(cart.items.length === 0) {
                list.innerHTML = '<p class="text-secondary">Your cart is empty.</p>';
                document.getElementById('cartTotal').innerText = '$0.00';
                document.getElementById('checkoutBtn').disabled = true;
                return;
            }
            
            document.getElementById('checkoutBtn').disabled = false;
            document.getElementById('cartTotal').innerText = `$${cart.totalAmount.toFixed(2)}`;
            
            cart.items.forEach(item => {
                list.innerHTML += `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <h4>${item.productName}</h4>
                            <span class="text-secondary">Qty: ${item.quantity}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap: 1rem;">
                            <span class="cart-item-price">$${item.subTotal.toFixed(2)}</span>
                            <button class="btn outline-btn small-btn" onclick="removeFromCart(${item.id})" style="border-color:var(--error); color:var(--error)">Remove</button>
                        </div>
                    </div>
                `;
            });
        }
    } catch (err) {
        console.error('Failed to load cart', err);
    }
}

async function removeFromCart(itemId) {
    try {
        const res = await fetch(`${API_URL}/cart/${itemId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if(res.ok) {
            showToast('Item removed', 'success');
            loadCart();
        }
    } catch (err) {
        showToast('Connection error', 'error');
    }
}

function updateCartBadge(count) {
    document.getElementById('cartBadge').innerText = count;
}

// Checkout listener
document.getElementById('checkoutBtn').addEventListener('click', async (e) => {
    const btn = e.target;
    btn.innerHTML = 'Processing...';
    try {
        const res = await fetch(`${API_URL}/orders/checkout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
            showToast('Order placed successfully!', 'success');
            loadCart(); // will be empty now
            document.getElementById('myOrdersBtn').click(); // navigate to orders tab
        } else {
            const data = await res.json();
            showToast(data.message || 'Checkout failed', 'error');
        }
    } catch(err) {
        showToast('Connection error', 'error');
    } finally {
        btn.innerHTML = 'Proceed to Checkout';
    }
});

async function loadCustomerOrders() {
    try {
        const res = await fetch(`${API_URL}/orders/customer`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
            const orders = await res.json();
            const list = document.getElementById('customerOrderHistory');
            list.innerHTML = '';
            
            if(orders.length === 0) {
                list.innerHTML = '<p class="text-secondary">You have no previous orders.</p>';
                return;
            }
            
            orders.forEach(o => {
                let itemsHtml = o.items.map(i => `
                    <div class="order-card-item">
                        <span>${i.quantity}x ${i.productName} (from ${i.storeName})</span>
                        <span>$${i.subTotal.toFixed(2)} - <b class="status-${i.status.toLowerCase()}">${i.status}</b></span>
                    </div>
                `).join('');

                list.innerHTML += `
                    <div class="order-card">
                        <div class="order-card-header">
                            <div>
                                <h4>Order #${o.id}</h4>
                                <span class="text-secondary">${new Date(o.createdAt).toLocaleString()}</span>
                            </div>
                            <h3 class="price-big">$${o.totalAmount.toFixed(2)}</h3>
                        </div>
                        <div class="order-card-items">
                            ${itemsHtml}
                        </div>
                    </div>
                `;
            });
        }
    } catch (err) {
        console.error('Failed to load orders', err);
    }
}

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
