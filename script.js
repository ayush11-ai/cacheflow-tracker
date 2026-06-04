// ==========================================
// 1. STATE & DATA INITIALIZATION
// ==========================================
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let subscriptions = JSON.parse(localStorage.getItem('subscriptions')) || [];
let userName = localStorage.getItem('userName') || '';
let userSalary = parseFloat(localStorage.getItem('userSalary')) || 0;
let savingsGoal = parseFloat(localStorage.getItem('savingsGoal')) || 0;

// Data Migration: Ensure every item has a unique ID (Prevents the delete bug)
expenses = expenses.map(exp => exp.id ? exp : { ...exp, id: Date.now() + Math.random() });
localStorage.setItem('expenses', JSON.stringify(expenses));

const formatINR = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);

// Initialize Date Picker & App on load
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('expDate').value = new Date().toISOString().split('T')[0];
    checkOnboarding();
});

// ==========================================
// 2. SMART CATEGORIZATION
// ==========================================
const keywordMap = {
    'netflix': 'Entertainment', 'movie': 'Entertainment', 'spotify': 'Entertainment',
    'zomato': 'Food', 'swiggy': 'Food', 'groceries': 'Food',
    'uber': 'Travel', 'train': 'Travel', 'petrol': 'Travel',
    'amazon': 'Shopping', 'myntra': 'Shopping', 'clothes': 'Shopping',
    'doctor': 'Health care', 'medicine': 'Health care', 'hospital': 'Health care',
    'rent': 'Rent', 'emi': 'EMI', 'sip': 'Investment', 'gym': 'Health care'
};

document.getElementById('expDesc').addEventListener('input', function(e) {
    let text = e.target.value.toLowerCase();
    let catSelect = document.getElementById('expCat');
    for (const [key, category] of Object.entries(keywordMap)) {
        if (text.includes(key)) {
            Array.from(catSelect.options).forEach(opt => {
                if (opt.value === category) catSelect.value = category;
            });
            break;
        }
    }
});

// ==========================================
// 3. CHART.JS CONFIGURATION
// ==========================================
const centerTextPlugin = {
    id: 'centerText',
    beforeDraw: function(chart) {
        let dataTotal = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
        if (dataTotal === 0) return; 
        let ctx = chart.ctx; let chartArea = chart.chartArea;
        let centerX = (chartArea.left + chartArea.right) / 2;
        let centerY = (chartArea.top + chartArea.bottom) / 2;
        ctx.restore();
        let formattedTotal = formatINR(dataTotal);
        ctx.font = "bold " + (chart.height / 120).toFixed(2) + "em 'Inter', sans-serif";
        ctx.textBaseline = "middle"; ctx.fillStyle = "#0f172a"; 
        ctx.fillText(formattedTotal, centerX - (ctx.measureText(formattedTotal).width / 2), centerY + 12);
        ctx.save();
    }
};

const ctx = document.getElementById('expenseChart').getContext('2d');
let expenseChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Food', 'Travel', 'Shopping', 'Entertainment', 'Health care', 'EMI', 'Rent', 'Investment', 'Emergency', 'Other'],
        datasets: [{
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
            backgroundColor: ['#fb7185', '#38bdf8', '#facc15', '#34d399', '#f472b6', '#818cf8', '#fb923c', '#a78bfa', '#f43f5e', '#94a3b8'],
            borderWidth: 0, borderRadius: 8, spacing: 4, hoverOffset: 8   
        }]
    },
    plugins: [centerTextPlugin],
    options: { responsive: true, maintainAspectRatio: false, cutout: '82%', plugins: { legend: { position: 'right', labels: { boxWidth: 12 } } } }
});

// ==========================================
// 4. ONBOARDING MODAL & PROFILE SETTINGS
// ==========================================
function checkOnboarding() {
    if (!userName || !userSalary || userSalary <= 0 || !savingsGoal || savingsGoal <= 0) {
        document.getElementById('onboardingModal').classList.remove('d-none');
        document.getElementById('closeModalBtn').classList.add('d-none'); 
        document.getElementById('cancelSetupBtn').classList.add('d-none');
        document.getElementById('saveSetupBtn').innerText = "Initialize Dashboard";
        document.getElementById('saveSetupBtn').classList.replace('w-50', 'w-100');
    } else {
        document.getElementById('onboardingModal').classList.add('d-none');
        document.getElementById('welcomeMessage').innerText = `${userName}`;
    }
    updateDashboard(expenses); 
}

document.getElementById('setupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    userName = document.getElementById('initName').value.trim();
    userSalary = parseFloat(document.getElementById('initSalary').value);
    savingsGoal = parseFloat(document.getElementById('initGoal').value);
    
    localStorage.setItem('userName', userName); 
    localStorage.setItem('userSalary', userSalary); 
    localStorage.setItem('savingsGoal', savingsGoal);
    checkOnboarding();
});

document.getElementById('editProfileBtn').addEventListener('click', () => {
    document.getElementById('initName').value = userName;
    document.getElementById('initSalary').value = userSalary;
    document.getElementById('initGoal').value = savingsGoal;
    document.getElementById('closeModalBtn').classList.remove('d-none');
    document.getElementById('onboardingModal').classList.remove('d-none');
    document.getElementById('cancelSetupBtn').classList.remove('d-none');
    document.getElementById('saveSetupBtn').innerText = "Save Changes";
    document.getElementById('saveSetupBtn').classList.replace('w-100', 'w-50');
});

// Modal close bindings
document.getElementById('closeModalBtn').addEventListener('click', () => document.getElementById('onboardingModal').classList.add('d-none'));
document.getElementById('cancelSetupBtn').addEventListener('click', () => document.getElementById('onboardingModal').classList.add('d-none'));

// ==========================================
// 5. TOAST NOTIFICATIONS
// ==========================================
function showBanner(msg, type = "success") {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `custom-toast ${type === 'info' ? 'toast-info' : ''}`;
    toast.innerHTML = msg;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// ==========================================
// 6. CORE LOGIC: ADD & DELETE TRANSACTIONS
// ==========================================
document.getElementById('expenseForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const desc = document.getElementById('expDesc').value;
    const amount = parseFloat(document.getElementById('expAmount').value);
    const rawCat = document.getElementById('expCat').value;
    const rawDate = document.getElementById('expDate').value;
    const isRecurring = document.getElementById('expRecurring').checked;

    const dateObj = new Date(rawDate);
    const displayDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    if (isRecurring) {
        subscriptions.push({ id: Date.now() + Math.random(), desc, cat: rawCat, amount });
        localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
        showBanner(`🔄 Subscription added: ${desc}`, 'info');
    }

    expenses.unshift({ id: Date.now() + Math.random(), isoDate: rawDate, date: displayDate, desc, cat: rawCat, amount }); 
    localStorage.setItem('expenses', JSON.stringify(expenses));
    
    showBanner(`💸 <strong>${formatINR(amount)}</strong> logged for ${rawCat}.`);
    
    document.getElementById('expDesc').value = '';
    document.getElementById('expAmount').value = '';
    document.getElementById('expCat').selectedIndex = 0;
    document.getElementById('expRecurring').checked = false;
    
    document.getElementById('calendarFilter').value = ''; // Reset filter on new entry
    updateDashboard(expenses);
});

// Event Delegation for Delete Buttons (replaces inline onclick)
document.getElementById('tableBody').addEventListener('click', (e) => {
    if (e.target.closest('.delete-tx-btn')) {
        const id = parseFloat(e.target.closest('.delete-tx-btn').dataset.id);
        expenses = expenses.filter(exp => exp.id !== id);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        
        const selectedDate = document.getElementById('calendarFilter').value;
        updateDashboard(selectedDate ? expenses.filter(exp => exp.isoDate === selectedDate) : expenses, !!selectedDate);
    }
});

document.getElementById('subscriptionList').addEventListener('click', (e) => {
    if (e.target.closest('.delete-sub-btn')) {
        const id = parseFloat(e.target.closest('.delete-sub-btn').dataset.id);
        subscriptions = subscriptions.filter(sub => sub.id !== id);
        localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
        
        const selectedDate = document.getElementById('calendarFilter').value;
        updateDashboard(selectedDate ? expenses.filter(exp => exp.isoDate === selectedDate) : expenses, !!selectedDate);
    }
});

// ==========================================
// 7. DATA IMPORT & EXPORT
// ==========================================
document.getElementById('exportDataBtn').addEventListener('click', () => {
    const data = { userName, userSalary, savingsGoal, expenses, subscriptions };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CacheFlow_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showBanner("💾 Backup downloaded successfully!", "info");
});

document.getElementById('triggerImportBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
});

document.getElementById('importFile').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if(data.userName) localStorage.setItem('userName', data.userName);
            if(data.userSalary) localStorage.setItem('userSalary', data.userSalary);
            if(data.savingsGoal) localStorage.setItem('savingsGoal', data.savingsGoal);
            if(data.expenses) localStorage.setItem('expenses', JSON.stringify(data.expenses));
            if(data.subscriptions) localStorage.setItem('subscriptions', JSON.stringify(data.subscriptions));
            
            showBanner("📂 Data restored successfully! Reloading...", "info");
            setTimeout(() => location.reload(), 1500); 
        } catch (error) {
            alert("Invalid backup file. Please upload a valid JSON generated by CacheFlow.");
        }
    };
    reader.readAsText(file);
});

// ==========================================
// 8. CALENDAR FILTER
// ==========================================
const calendarFilter = document.getElementById('calendarFilter');
calendarFilter.addEventListener('change', (e) => {
    const selectedDate = e.target.value;
    if (!selectedDate) {
        updateDashboard(expenses);
        return;
    }
    const filtered = expenses.filter(exp => exp.isoDate === selectedDate);
    updateDashboard(filtered, true);
});

document.getElementById('clearFilterBtn').addEventListener('click', () => {
    calendarFilter.value = ''; 
    updateDashboard(expenses); 
});

// ==========================================
// 9. NO-SPEND STREAK CALCULATION
// ==========================================
function calculateStreak() {
    if (expenses.length === 0) {
        document.getElementById('streakBadge').innerText = "🔥 0 Day Streak";
        return;
    }
    const WANTS = ['Food', 'Shopping', 'Entertainment'];
    const wantDates = expenses.filter(e => WANTS.includes(e.cat)).map(e => e.isoDate);
    
    let streak = 0;
    let checkDate = new Date(); 
    const earliestDate = new Date(Math.min(...expenses.map(e => new Date(e.isoDate))));
    
    while(checkDate >= earliestDate) {
        const dateString = checkDate.toISOString().split('T')[0];
        if (wantDates.includes(dateString)) break;
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
    }
    document.getElementById('streakBadge').innerText = `🔥 ${streak} Day Streak`;
}

// ==========================================
// 10. DASHBOARD RENDERER
// ==========================================
function updateDashboard(dataArray, isFiltered = false) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    let totals = { Food: 0, Travel: 0, Shopping: 0, Entertainment: 0, 'Health care': 0, EMI: 0, Rent: 0, Investment: 0, Emergency: 0, Other: 0 };
    let grandTotal = 0;

    if (dataArray.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted"><em>No expenses found.</em></td></tr>`;
    } else {
        dataArray.forEach((exp) => {
            tbody.innerHTML += `
                <tr>
                    <td class="text-muted small ps-4">${exp.date}</td>
                    <td class="fw-medium text-navy">${exp.desc}</td>
                    <td><span class="badge bg-light text-secondary border">${exp.cat}</span></td>
                    <td class="text-danger fw-bold">${formatINR(exp.amount)}</td>
                    <td class="text-end pe-4">
                        <button class="btn btn-sm text-danger border-0 delete-tx-btn" data-id="${exp.id}">🗑️</button>
                    </td>
                </tr>
            `;
            if(totals[exp.cat] !== undefined) totals[exp.cat] += parseFloat(exp.amount);
            grandTotal += parseFloat(exp.amount);
        });
    }

    const subList = document.getElementById('subscriptionList');
    subList.innerHTML = '';
    let subTotal = 0;
    
    if (subscriptions.length === 0) {
        subList.innerHTML = `<li class="list-group-item text-muted small py-3 border-0">No active subscriptions.</li>`;
    } else {
        subscriptions.forEach(sub => {
            subTotal += sub.amount;
            subList.innerHTML += `
                <li class="list-group-item d-flex justify-content-between align-items-center border-0 px-3 py-2 text-muted small">
                    <span>${sub.desc} <span class="badge bg-light text-secondary ms-1">${sub.cat}</span></span>
                    <div>
                        <span class="fw-bold text-navy me-2">${formatINR(sub.amount)}</span>
                        <button class="btn btn-sm text-danger p-0 delete-sub-btn" data-id="${sub.id}" title="Remove Subscription">✖</button>
                    </div>
                </li>
            `;
        });
    }
    document.getElementById('subTotalBadge').innerText = `${formatINR(subTotal)}/mo`;

    expenseChart.data.datasets[0].data = [totals.Food, totals.Travel, totals.Shopping, totals.Entertainment, totals['Health care'], totals.EMI, totals.Rent, totals.Investment, totals.Emergency, totals.Other];
    expenseChart.update();

    if (!isFiltered) {
        let remainingBalance = userSalary - grandTotal;
        let spendPercentage = userSalary > 0 ? (grandTotal / userSalary) * 100 : 0;
        let progressBar = document.getElementById('goalProgressBar');
        
        progressBar.classList.remove('bg-success', 'bg-warning', 'bg-danger');
        if (spendPercentage >= 90) progressBar.classList.add('bg-danger');
        else if (spendPercentage >= 75) progressBar.classList.add('bg-warning');
        else progressBar.classList.add('bg-success');
        
        progressBar.style.width = `${Math.min((remainingBalance / savingsGoal) * 100, 100)}%`;

        document.getElementById('totalSpending').innerText = formatINR(grandTotal);
        document.getElementById('remainingBalance').innerText = formatINR(remainingBalance);
        document.getElementById('goalTitle').innerText = `📈 Target: ${formatINR(savingsGoal)}`;
        document.getElementById('savedAmountLabel').innerText = `${remainingBalance > 0 ? formatINR(remainingBalance) : formatINR(0)} Saved`;
        
        calculateStreak();
    }
}

// ==========================================
// 11. HEURISTIC AI ENGINE & SNOWBALL
// ==========================================
document.getElementById('aiBtn').addEventListener('click', () => {
    const insightBox = document.getElementById('aiInsights');
    const skeleton = document.getElementById('aiSkeleton');
    const btn = document.getElementById('aiBtn');
    
    btn.innerHTML = "🧠 Running Deep Analysis..."; btn.disabled = true;
    insightBox.classList.add('d-none'); skeleton.classList.remove('d-none'); 

    setTimeout(() => {
        btn.innerHTML = "Generate Insights"; btn.disabled = false;
        skeleton.classList.add('d-none'); 

        let foodTotal = 0; let shoppingTotal = 0; let emiTotal = 0; let grandTotal = 0;
        expenses.forEach(exp => {
            let amt = parseFloat(exp.amount); grandTotal += amt;
            if (exp.cat === 'Food') foodTotal += amt;
            if (exp.cat === 'Shopping') shoppingTotal += amt;
            if (exp.cat === 'EMI') emiTotal += amt;
        });

        let subTotal = subscriptions.reduce((acc, sub) => acc + sub.amount, 0);
        let remainingBalance = userSalary - grandTotal;
        let insights = [];
        let spendPercent = ((grandTotal / userSalary) * 100).toFixed(1);

        if (subTotal > (userSalary * 0.10)) insights.push(`🔄 <strong>Subscription Alert:</strong> Over 10% of your income goes to recurring bills (${formatINR(subTotal)}). Review your subscriptions to see if you can cancel unused services.`);
        if (emiTotal > 0 && remainingBalance > 0) {
            let suggestPct = remainingBalance > (userSalary * 0.3) ? 0.5 : 0.25;
            let snowballAmt = remainingBalance * suggestPct;
            insights.push(`📉 <strong>Debt Snowball Strategy:</strong> You have ${formatINR(remainingBalance)} saved. Consider allocating ${formatINR(snowballAmt)} (${suggestPct * 100}%) towards your EMI principal to crush your debt months faster!`);
        }
        if (foodTotal > (userSalary * 0.15)) insights.push(`🍔 <strong>Dining Out Limit:</strong> You've spent ${formatINR(foodTotal)} on food. Dropping just 1 restaurant outing this month will keep you on track.`);
        if (shoppingTotal > (userSalary * 0.10)) insights.push(`🛍️ <strong>Wants Warning:</strong> Shopping expenses are consuming a large portion of your allowance. Consider a 7-day spending freeze.`);
        if (spendPercent > 80) insights.push(`⚠️ <strong>Burn Rate High:</strong> You have spent ${spendPercent}% of your salary. Pace yourself for the rest of the month.`);
        if (insights.length === 0 && grandTotal > 0) insights.push(`🌟 <strong>Optimized:</strong> Your spending is perfectly aligned with the 50/30/20 rule. Keep up the great discipline!`);
        if (grandTotal === 0) insights.push(`💡 Log your first expense to generate AI insights.`);

        insightBox.innerHTML = `<ul class="mb-0 ps-3">${insights.map(i => `<li class="mb-2 text-dark">${i}</li>`).join('')}</ul>`;
        insightBox.classList.remove('d-none');
    }, 1200); 
});