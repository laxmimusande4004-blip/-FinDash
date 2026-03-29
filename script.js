/**
 * FinDash - Personal Finance Visualizer
 * Core Logic & DOM Manipulation
 */

// --- Constants & Config ---
const CATEGORY_COLORS = {
    food: 'var(--cat-food)',
    rent: 'var(--cat-rent)',
    transport: 'var(--cat-transport)',
    entertainment: 'var(--cat-entertainment)',
    salary: 'var(--cat-salary)',
    misc: 'var(--cat-misc)'
};

const CATEGORY_ICONS = {
    food: 'fa-burger',
    rent: 'fa-house',
    transport: 'fa-car',
    entertainment: 'fa-gamepad',
    salary: 'fa-sack-dollar',
    misc: 'fa-box'
};

// --- State Management ---
let transactions = [];
let currentFilter = 'all';

// Load from LocalStorage
function loadTransactions() {
    try {
        const saved = localStorage.getItem('findash_transactions');
        if (saved) {
            transactions = JSON.parse(saved);
        } else {
            seedInitialData();
        }
    } catch (e) {
        console.warn("localStorage is disabled or unavailable. Using in-memory state.");
        seedInitialData();
    }
}

function seedInitialData() {
    transactions = [
        { id: 1, type: 'income', amount: 3000, description: 'Monthly Salary', category: 'salary', date: new Date().toISOString() },
        { id: 2, type: 'expense', amount: 850, description: 'Rent', category: 'rent', date: new Date().toISOString() },
        { id: 3, type: 'expense', amount: 120, description: 'Groceries', category: 'food', date: new Date().toISOString() },
        { id: 4, type: 'expense', amount: 45, description: 'Movie Night', category: 'entertainment', date: new Date().toISOString() }
    ];
    saveTransactions();
}

function saveTransactions() {
    try {
        localStorage.setItem('findash_transactions', JSON.stringify(transactions));
    } catch (e) {
        // Silently fail if localStorage is blocked by browser security
    }
}

// --- DOM Cache ---
// KPI Elements
const kpiBalance = document.getElementById('kpi-balance');
const kpiIncome = document.getElementById('kpi-income');
const kpiExpense = document.getElementById('kpi-expense');

// Chart Elements
const chartContainer = document.getElementById('expense-chart');
const chartLegend = document.querySelector('.chart-legend');

// Sidebar Navigation
const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
const viewSections = document.querySelectorAll('.view-section');

// Transaction List
const transactionList = document.getElementById('transaction-list');
const filterBtns = document.querySelectorAll('.tab-btn');

// Modal & Form Elements
const modal = document.getElementById('transaction-modal');
const openModalBtn = document.getElementById('open-add-modal');
const closeModalBtn = document.getElementById('close-modal');
const backdrop = document.getElementById('modal-backdrop');
const transactionForm = document.getElementById('transaction-form');

// --- Initialization ---
function init() {
    loadTransactions();
    setupEventListeners();
    updateDashboard();
}

function setupEventListeners() {
    // Modal events
    openModalBtn.addEventListener('click', () => toggleModal(true));
    closeModalBtn.addEventListener('click', () => toggleModal(false));
    backdrop.addEventListener('click', () => toggleModal(false));

    // Sidebar Navigation events
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetViewId = e.currentTarget.dataset.view;
            if (!targetViewId) return;

            // Update Active Link State
            sidebarLinks.forEach(l => l.parentElement.classList.remove('active'));
            e.currentTarget.parentElement.classList.add('active');
            
            // Toggle Views Visibility
            viewSections.forEach(section => {
                section.classList.remove('active');
                section.classList.add('hidden');
            });
            
            const targetView = document.getElementById(`view-${targetViewId}`);
            if (targetView) {
                targetView.classList.remove('hidden');
                targetView.classList.add('active');
            }
        });
    });
    
    // Form submission
    transactionForm.addEventListener('submit', handleAddTransaction);
    
    // Filter events
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTransactionList();
        });
    });

    // Handle type change in form to restrict categories
    const typeRadios = document.querySelectorAll('input[name="type"]');
    const categorySelect = document.getElementById('category');
    typeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if(e.target.value === 'income') {
                categorySelect.innerHTML = `
                    <option value="salary">Salary/Income</option>
                    <option value="misc">Other</option>
                `;
            } else {
                categorySelect.innerHTML = `
                    <option value="food">Food & Dining</option>
                    <option value="rent">Rent & Utilities</option>
                    <option value="transport">Transportation</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="misc">Miscellaneous</option>
                `;
            }
        });
    });
}

// --- Logic Generators ---
// 1. Calculate and Render KPIs
function updateKPIs() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const balance = income - expense;

    // Formatting currency
    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    kpiBalance.textContent = formatCurrency(balance);
    kpiIncome.textContent = formatCurrency(income);
    kpiExpense.textContent = formatCurrency(expense);
}

// 2. Render Transaction List
function renderTransactionList() {
    transactionList.innerHTML = '';
    
    // Filter logic
    let filtered = transactions;
    if (currentFilter !== 'all') {
        filtered = transactions.filter(t => t.type === currentFilter);
    }
    
    // Sort logic (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filtered.length === 0) {
        transactionList.innerHTML = `<p class="empty-state">No transactions found.</p>`;
        return;
    }

    filtered.forEach(t => {
        const li = document.createElement('li');
        li.className = 'transaction-item';
        
        // Build the icon section dynamically based on type/category
        const iconClass = t.type === 'income' ? 'fa-arrow-trend-up' : CATEGORY_ICONS[t.category] || 'fa-box';
        const iconColor = t.type === 'income' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)';
        const iconTextColor = t.type === 'income' ? 'var(--accent-secondary)' : CATEGORY_COLORS[t.category];

        li.innerHTML = `
            <div class="t-info">
                <div class="t-icon" style="background: ${iconColor}; color: ${iconTextColor}">
                    <i class="fa-solid ${iconClass}"></i>
                </div>
                <div class="t-details">
                    <h4>${t.description}</h4>
                    <p>${t.category}</p>
                </div>
            </div>
            <div class="t-amount ${t.type}">
                ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}
                <button class="delete-btn" onclick="deleteTransaction(${t.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        transactionList.appendChild(li);
    });
}

// 3. Render Custom DOM Bar Chart (Expenses Breakdown)
function renderChart() {
    chartContainer.innerHTML = '';
    chartLegend.innerHTML = '';

    const expenses = transactions.filter(t => t.type === 'expense');

    if (expenses.length === 0) {
        chartContainer.innerHTML = '<div class="empty-state">No expense data available to chart.</div>';
        return;
    }

    // Group expenses by category
    const categoryTotals = expenses.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {});

    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const maxVal = Math.max(...Object.values(categoryTotals));

    // For each tracked category that has > 0, create a bar
    Object.keys(categoryTotals).forEach(cat => {
        const amount = categoryTotals[cat];
        const percentOfMax = (amount / maxVal) * 100; // Relative to the biggest bar
        const percentOfTotal = ((amount / totalExpense) * 100).toFixed(1);

        // Build Legend Item
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
            <div class="legend-color" style="background-color: ${CATEGORY_COLORS[cat]}"></div>
            <span>${cat}</span>
        `;
        chartLegend.appendChild(legendItem);

        // Build Bar
        const barWrapper = document.createElement('div');
        barWrapper.className = 'chart-bar-wrapper';

        // DOM Manip: Inline style for dynamic height
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.style.backgroundColor = CATEGORY_COLORS[cat];
        
        // Add tooltip inside the bar
        const tooltip = document.createElement('div');
        tooltip.className = 'chart-bar-tooltip';
        tooltip.innerHTML = `<strong>${cat}</strong>: $${amount.toFixed(2)} (${percentOfTotal}%)`;
        bar.appendChild(tooltip);

        const label = document.createElement('div');
        label.className = 'chart-label';
        label.textContent = cat;

        barWrapper.appendChild(bar);
        barWrapper.appendChild(label);
        chartContainer.appendChild(barWrapper);

        // Trigger animation after slightly deferring
        setTimeout(() => {
            bar.style.height = `${percentOfMax}%`;
        }, 50);
    });
}

// --- Action Handlers ---
function handleAddTransaction(e) {
    e.preventDefault();
    
    const type = document.querySelector('input[name="type"]:checked').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value.trim();
    const category = document.getElementById('category').value;

    if (!amount || amount <= 0 || !description) {
        showToast('Please provide valid inputs', 'error');
        return;
    }

    const newTx = {
        id: Date.now(),
        type,
        amount,
        description,
        category,
        date: new Date().toISOString()
    };

    transactions.push(newTx);
    saveTransactions();
    
    // Update UI
    updateDashboard();
    
    // Clean up
    transactionForm.reset();
    toggleModal(false);
    showToast('Transaction added successfully!', 'success');
}

window.deleteTransaction = function(id) {
    if(confirm('Delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
        updateDashboard();
        showToast('Transaction deleted', 'success');
    }
}

function updateDashboard() {
    updateKPIs();
    renderChart();
    renderTransactionList();
}

function toggleModal(show) {
    if (show) {
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
}

function showToast(message, type) {
    const container = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '<i class="fa-solid fa-check-circle" style="color:var(--accent-secondary)"></i>' : '<i class="fa-solid fa-circle-exclamation" style="color:var(--accent-danger)"></i>';
    
    toast.innerHTML = `
        ${icon}
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Cleanup after animation finishes
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// Boot up
document.addEventListener('DOMContentLoaded', init);
