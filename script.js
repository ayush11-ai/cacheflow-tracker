// ==========================================
// 1. STATE, DATA, & SPLASH INITIALIZATION
// ==========================================
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let userName = localStorage.getItem('userName') || '';
let userSalary = parseFloat(localStorage.getItem('userSalary')) || 0;
let savingsGoal = parseFloat(localStorage.getItem('savingsGoal')) || 0;

expenses = expenses.map(exp => exp.id ? exp : { ...exp, id: Date.now() + Math.random() });
localStorage.setItem('expenses', JSON.stringify(expenses));

const formatINR = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);

// Micro-interaction: Smooth Count-Up Animation Engine
function animateCurrency(elementId, newValue) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const currentValue = parseFloat(el.getAttribute('data-val')) || 0;
    if (currentValue === newValue) return;
    
    el.setAttribute('data-val', newValue);
    const duration = 500; 
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = progress * (2 - progress); 
        const current = currentValue + (newValue - currentValue) * easeOut;

        el.innerText = formatINR(current);

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.innerText = formatINR(newValue);
        }
    }
    requestAnimationFrame(update);
}

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    document.getElementById('expDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('exportSpecificDate').value = new Date().toISOString().split('T')[0];
    
    const featureText = document.getElementById('featureText');
    setTimeout(() => {
        featureText.style.opacity = '0'; featureText.style.transform = 'translateY(4px)';
        setTimeout(() => {
            featureText.innerHTML = "Download Freely."; featureText.style.opacity = '1'; featureText.style.transform = 'translateY(0)';
        }, 200); 
    }, 600);

    setTimeout(() => {
        featureText.style.opacity = '0'; featureText.style.transform = 'translateY(4px)';
        setTimeout(() => {
            featureText.innerHTML = "Be Smart."; featureText.style.opacity = '1'; featureText.style.transform = 'translateY(0)';
        }, 200);
    }, 1300);

    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        splash.style.transform = "translateY(-100%)";
        splash.style.opacity = "0";
        setTimeout(() => { splash.style.display = "none"; }, 500);
        routeUserFlow();
    }, 2000); 
});

// ==========================================
// 2. ROUTING LOGIC (TOUR VS DASHBOARD)
// ==========================================
function routeUserFlow() {
    const hasFinishedTour = localStorage.getItem('tourCompleted');
    const mainContent = document.getElementById('appContainer');
    
    if (!hasFinishedTour) {
        document.getElementById('firstTimeTourOverlay').classList.remove('d-none');
    } else if (!userName || !userSalary || !savingsGoal) {
        mainContent.style.display = "block";
        setTimeout(() => { mainContent.style.opacity = "1"; }, 50);
        
        document.getElementById('onboardingModal').classList.remove('d-none');
        document.getElementById('closeModalBtn').classList.add('d-none'); 
        document.getElementById('cancelSetupBtn').classList.add('d-none');
    } else {
        mainContent.style.display = "block";
        setTimeout(() => { mainContent.style.opacity = "1"; }, 50);
        document.getElementById('welcomeMessage').innerText = `${userName}`;
        updateDashboard(expenses);
    }
}

// ==========================================
// 3. FIRST-TIME TOUR ENGINE
// ==========================================
let tourSlide = 0;
document.getElementById('nextTourBtn').addEventListener('click', () => {
    document.getElementById(`tour${tourSlide}`).classList.replace('d-block', 'd-none');
    document.getElementById(`dot${tourSlide}`).classList.remove('active-dot');
    
    tourSlide++;
    
    if (tourSlide < 3) {
        document.getElementById(`tour${tourSlide}`).classList.replace('d-none', 'd-block');
        document.getElementById(`dot${tourSlide}`).classList.add('active-dot');
        if (tourSlide === 2) {
            document.getElementById('nextTourBtn').innerText = "Let's Get Started";
        }
    } else {
        localStorage.setItem('tourCompleted', 'true');
        document.getElementById('firstTimeTourOverlay').classList.add('d-none');
        
        const mainContent = document.getElementById('appContainer');
        mainContent.style.display = "block";
        setTimeout(() => { mainContent.style.opacity = "1"; }, 50);
        
        document.getElementById('onboardingModal').classList.remove('d-none');
        document.getElementById('closeModalBtn').classList.add('d-none'); 
        document.getElementById('cancelSetupBtn').classList.add('d-none');
    }
});

// ==========================================
// 4. PROFILE SETUP SETTINGS
// ==========================================
document.getElementById('setupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    userName = document.getElementById('initName').value.trim();
    userSalary = parseFloat(document.getElementById('initSalary').value);
    savingsGoal = parseFloat(document.getElementById('initGoal').value);
    
    localStorage.setItem('userName', userName); 
    localStorage.setItem('userSalary', userSalary); 
    localStorage.setItem('savingsGoal', savingsGoal);
    
    document.getElementById('onboardingModal').classList.add('d-none');
    document.getElementById('welcomeMessage').innerText = `${userName}`;
    updateDashboard(expenses);
});

document.getElementById('editProfileBtn').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('initName').value = userName;
    document.getElementById('initSalary').value = userSalary;
    document.getElementById('initGoal').value = savingsGoal;
    
    document.getElementById('onboardingModal').classList.remove('d-none');
    document.getElementById('closeModalBtn').classList.remove('d-none');
    document.getElementById('cancelSetupBtn').classList.remove('d-none');
    document.getElementById('saveSetupBtn').innerText = "Save Changes";
    document.getElementById('saveSetupBtn').classList.replace('w-100', 'w-50');
});

document.getElementById('closeModalBtn').addEventListener('click', () => document.getElementById('onboardingModal').classList.add('d-none'));
document.getElementById('cancelSetupBtn').addEventListener('click', () => document.getElementById('onboardingModal').classList.add('d-none'));

// ==========================================
// 5. SMART CATEGORIZATION & TOASTS
// ==========================================
const keywordMap = {
    'netflix': 'Entertainment', 'movie': 'Entertainment', 'spotify': 'Entertainment',
    'zomato': 'Food', 'swiggy': 'Food', 'groceries': 'Food', 'blinkit': 'Food', 'zepto': 'Food',
    'uber': 'Travel', 'train': 'Travel', 'petrol': 'Travel', 'ola': 'Travel',
    'amazon': 'Shopping', 'myntra': 'Shopping', 'clothes': 'Shopping', 'flipkart': 'Shopping',
    'doctor': 'Health care', 'medicine': 'Health care', 'hospital': 'Health care',
    'rent': 'Rent', 'emi': 'EMI', 'gym': 'Health care'
};

document.getElementById('expDesc').addEventListener('input', function(e) {
    let text = e.target.value.toLowerCase();
    let catSelect = document.getElementById('expCat');
    for (const [key, category] of Object.entries(keywordMap)) {
        if (text.includes(key)) {
            Array.from(catSelect.options).forEach(opt => { if (opt.value === category) catSelect.value = category; });
            break;
        }
    }
});

function showBanner(msg, type="success") {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `custom-toast ${type === 'error' ? 'border-danger' : ''}`;
    
    let iconHTML = type === 'error' 
        ? `<i data-lucide="alert-circle" class="text-danger flex-shrink-0" style="width:16px;height:16px;"></i>` 
        : `<i data-lucide="check-circle-2" class="text-success flex-shrink-0" style="width:16px;height:16px;"></i>`;
        
    toast.innerHTML = `<div class="d-flex align-items-center gap-2">${iconHTML} <span>${msg}</span></div>`;
    container.appendChild(toast);
    lucide.createIcons();
    
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// ==========================================
// 6. CHART.JS CONFIGURATION (RICH PALETTE)
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
        ctx.font = "600 1.25em 'Inter', sans-serif";
        ctx.textBaseline = "middle"; 
        ctx.fillStyle = "#1e293b"; 
        ctx.fillText(formattedTotal, centerX - (ctx.measureText(formattedTotal).width / 2), centerY);
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
            backgroundColor: ['#10b981', '#3b82f6', '#f97316', '#8b5cf6', '#ef4444', '#64748b', '#f59e0b', '#0ea5e9', '#e11d48', '#94a3b8'],
            borderWidth: 0, borderRadius: 4, spacing: 3, hoverOffset: 4   
        }]
    },
    plugins: [centerTextPlugin],
    options: { 
        responsive: true, 
        maintainAspectRatio: false, 
        cutout: '75%', 
        plugins: { 
            legend: { display: false },
            tooltip: {
                backgroundColor: '#0f172a',
                titleFont: { family: 'Inter', size: 12, weight: '600' },
                bodyFont: { family: 'Inter', size: 12 },
                padding: 10,
                cornerRadius: 6,
                displayColors: false
            }
        },
        animation: { animateScale: true, animateRotate: true, duration: 600, easing: 'easeOutQuart' }
    }
});

// ==========================================
// 7. TRANSACTIONS MANAGEMENT
// ==========================================
function getCategoryBadgeClass(cat) {
    switch(cat) {
        case 'Food': return 'badge-category badge-food';
        case 'Travel': return 'badge-category badge-travel';
        case 'Shopping': return 'badge-category badge-shopping';
        case 'Entertainment': return 'badge-category badge-entertainment';
        case 'Health care': return 'badge-category badge-healthcare';
        case 'EMI': return 'badge-category badge-emi';
        default: return 'badge-category badge-generic';
    }
}

document.getElementById('expenseForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const desc = document.getElementById('expDesc').value;
    const amount = parseFloat(document.getElementById('expAmount').value);
    const rawCat = document.getElementById('expCat').value;
    const rawDate = document.getElementById('expDate').value;

    const dateObj = new Date(rawDate);
    const displayDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    expenses.unshift({ id: Date.now() + Math.random(), isoDate: rawDate, date: displayDate, desc, cat: rawCat, amount }); 
    localStorage.setItem('expenses', JSON.stringify(expenses));
    
    if (window.umami) umami.track('Expense Logged');
    
    showBanner(`<strong>${formatINR(amount)}</strong> logged for ${rawCat}.`);
    
    document.getElementById('expDesc').value = '';
    document.getElementById('expAmount').value = '';
    document.getElementById('expCat').selectedIndex = 0;
    document.getElementById('calendarFilter').value = '';
    
    updateDashboard(expenses);
});

document.getElementById('tableBody').addEventListener('click', (e) => {
    if (e.target.closest('.delete-tx-btn')) {
        const id = parseFloat(e.target.closest('.delete-tx-btn').dataset.id);
        expenses = expenses.filter(exp => exp.id !== id);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        
        const selectedDate = document.getElementById('calendarFilter').value;
        updateDashboard(selectedDate ? expenses.filter(exp => exp.isoDate === selectedDate) : expenses, !!selectedDate);
    }
});

// ==========================================
// 8. SMART EXPORT PDF ENGINE
// ==========================================
const exportModal = document.getElementById('exportModal');
const exportRange = document.getElementById('exportRange');
const exportDateContainer = document.getElementById('exportDateContainer');

function openExportModal() { exportModal.classList.remove('d-none'); }

document.getElementById('exportPdfBtnMain').addEventListener('click', (e) => {
    e.preventDefault();
    openExportModal();
});

document.getElementById('closeExportModalBtn').addEventListener('click', () => exportModal.classList.add('d-none'));

exportRange.addEventListener('change', (e) => {
    if (e.target.value === 'date') exportDateContainer.classList.remove('d-none');
    else exportDateContainer.classList.add('d-none');
});

document.getElementById('confirmExportBtn').addEventListener('click', () => {
    const rangeType = exportRange.value;
    let filteredToPrint = expenses;
    let metaText = "Comprehensive Historical Account Summary";

    if (rangeType === 'month') {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        filteredToPrint = expenses.filter(exp => {
            const expDate = new Date(exp.isoDate);
            return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
        });
        metaText = `Statement History for Current Month (${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})`;
    } 
    else if (rangeType === 'date') {
        const specificDate = document.getElementById('exportSpecificDate').value;
        if (!specificDate) { showBanner('Please select a date first.', 'error'); return; }
        filteredToPrint = expenses.filter(exp => exp.isoDate === specificDate);
        metaText = `Statement History Logs for Selected Date: ${specificDate}`;
    }

    document.getElementById('printUserHolder').innerText = `User: ${userName || 'Client Account'}`;
    const now = new Date();
    document.getElementById('printTimestamp').innerText = `Executed: ${now.toLocaleDateString()} | ${now.toLocaleTimeString()}`;
    document.getElementById('printGenerationMeta').innerText = metaText;

    if (window.umami) umami.track('PDF Exported');

    updateDashboard(filteredToPrint, true);
    exportModal.classList.add('d-none');
    window.print(); 
});

window.addEventListener('afterprint', () => {
    document.getElementById('calendarFilter').value = '';
    updateDashboard(expenses);
});

// ==========================================
// 9. CALENDAR FILTER ENGINE
// ==========================================
const calendarFilter = document.getElementById('calendarFilter');
calendarFilter.addEventListener('change', (e) => {
    const selectedDateStr = e.target.value;
    if (!selectedDateStr) { updateDashboard(expenses); return; }
    const filtered = expenses.filter(exp => exp.isoDate === selectedDateStr);
    updateDashboard(filtered, true);
});

document.getElementById('clearFilterBtn').addEventListener('click', () => {
    calendarFilter.value = ''; 
    updateDashboard(expenses); 
});

// ==========================================
// 10. GAMIFICATION STREAK ENGINE
// ==========================================
function calculateStreak() {
    if (expenses.length === 0) {
        document.getElementById('streakBadge').innerHTML = `<i data-lucide="flame" style="width:14px;height:14px;"></i> <span>0 Day Streak</span>`;
        lucide.createIcons();
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
    document.getElementById('streakBadge').innerHTML = `<i data-lucide="flame" style="width:14px;height:14px;"></i> <span>${streak} Day Streak</span>`;
    lucide.createIcons();
}

// ==========================================
// 11. DASHBOARD RENDERER & LOGIC
// ==========================================
function updateDashboard(dataArray = expenses, isFiltered = false) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    let totals = { Food: 0, Travel: 0, Shopping: 0, Entertainment: 0, 'Health care': 0, EMI: 0, Rent: 0, Investment: 0, Emergency: 0, Other: 0 };
    let grandTotal = 0;

    if (dataArray.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-5 text-slate-500 small"><i data-lucide="inbox" style="width:24px;height:24px;" class="mb-2 opacity-40 d-block mx-auto"></i><strong class="fw-medium text-slate-700" style="font-size:0.9rem;">No expenses recorded yet.</strong><br><span class="text-slate-400 mt-1 d-block">Start by adding your first transaction.</span></td></tr>`;
    } else {
        dataArray.forEach((exp, index) => {
            let delay = Math.min(index * 0.02, 0.2); 
            let badgeClass = getCategoryBadgeClass(exp.cat);
            tbody.innerHTML += `
                <tr class="row-enter" style="animation-delay: ${delay}s;">
                    <td class="text-slate-500 small ps-4">${exp.date}</td>
                    <td class="fw-medium text-slate-700">${exp.desc}</td>
                    <td><span class="${badgeClass}">${exp.cat}</span></td>
                    <td class="text-slate-700 fw-semibold">${formatINR(exp.amount)}</td>
                    <td class="text-end pe-4 no-print">
                        <button class="btn btn-sm text-slate-400 hover:text-danger border-0 delete-tx-btn transition-base p-1 bg-transparent" data-id="${exp.id}" title="Delete">
                            <i data-lucide="trash-2" style="width:15px;height:15px;"></i>
                        </button>
                    </td>
                </tr>
            `;
            if(totals[exp.cat] !== undefined) totals[exp.cat] += parseFloat(exp.amount);
            grandTotal += parseFloat(exp.amount);
        });
    }

    if (!isFiltered) {
        expenseChart.data.datasets[0].data = [totals.Food, totals.Travel, totals.Shopping, totals.Entertainment, totals['Health care'], totals.EMI, totals.Rent, totals.Investment, totals.Emergency, totals.Other];
        expenseChart.update();

        let remainingBalance = userSalary - grandTotal;
        let spendPercentage = userSalary > 0 ? (grandTotal / userSalary) * 100 : 0;
        let savePercentage = savingsGoal > 0 ? (remainingBalance / savingsGoal) * 100 : 0;
        let pctComplete = Math.max(0, Math.min(savePercentage, 100)).toFixed(0);
        
        let progressBar = document.getElementById('goalProgressBar');
        
        progressBar.classList.remove('bg-success', 'bg-warning', 'bg-danger');
        if (spendPercentage >= 90) progressBar.classList.add('bg-danger');
        else if (spendPercentage >= 75) progressBar.classList.add('bg-warning');
        else progressBar.classList.add('bg-success');
        
        progressBar.style.width = `${pctComplete}%`;

        animateCurrency('totalSpending', grandTotal);
        animateCurrency('remainingBalance', remainingBalance);
        
        document.getElementById('goalTitle').innerHTML = `<i data-lucide="target" style="width:14px;height:14px;"></i> Target: ${formatINR(savingsGoal)}`;
        document.getElementById('savedAmountLabel').innerText = `${remainingBalance > 0 ? formatINR(remainingBalance) : formatINR(0)} Saved`;
        document.getElementById('goalPercentage').innerText = `${pctComplete}% Complete`;
        
        // Smart Goal Estimate Calculation
        let estContainer = document.getElementById('estimatedCompletion');
        let daysActive = new Set(expenses.map(e => e.isoDate)).size;
        
        if (remainingBalance >= savingsGoal && savingsGoal > 0) {
            estContainer.innerHTML = `Target Achieved! <i data-lucide="check-circle-2" style="width:12px;height:12px;" class="ms-1"></i>`;
        } else if (daysActive > 0 && remainingBalance > 0 && remainingBalance < savingsGoal) {
            let avgSavedPerDay = remainingBalance / daysActive;
            let daysLeft = Math.ceil((savingsGoal - remainingBalance) / avgSavedPerDay);
            estContainer.innerText = `Estimated goal completion in ~${daysLeft} days`;
        } else {
            estContainer.innerText = `Track more days to unlock estimate.`;
        }
        
        calculateStreak();
    } else {
        expenseChart.data.datasets[0].data = [totals.Food, totals.Travel, totals.Shopping, totals.Entertainment, totals['Health care'], totals.EMI, totals.Rent, totals.Investment, totals.Emergency, totals.Other];
        expenseChart.update();
    }
    
    lucide.createIcons();
}

// ==========================================
// 12. ADVANCED HEURISTIC RULES ENGINE (LIGHT THEME ALERTS)
// ==========================================
document.getElementById('aiBtn').addEventListener('click', () => {
    const insightBox = document.getElementById('aiInsights');
    const skeleton = document.getElementById('aiSkeleton');
    const btn = document.getElementById('aiBtn');
    
    if (window.umami) umami.track('Diagnostic Run');

    btn.innerHTML = `<i data-lucide="loader-2" class="spin-icon" style="width:15px;height:15px; animation: spin 1s linear infinite;"></i> Compiling Analytics...`; 
    btn.disabled = true;
    
    insightBox.classList.add('d-none'); skeleton.classList.remove('d-none'); 
    lucide.createIcons();

    setTimeout(() => {
        btn.innerHTML = `<i data-lucide="cpu" style="width:15px;height:15px;"></i> Run Deep Diagnostic`; 
        btn.disabled = false;
        skeleton.classList.add('d-none'); 

        let grandTotal = 0;
        let totals = { Food: 0, Travel: 0, Shopping: 0, Entertainment: 0, 'Health care': 0, EMI: 0, Rent: 0, Investment: 0, Emergency: 0, Other: 0 };
        
        expenses.forEach(exp => {
            let amt = parseFloat(exp.amount); 
            grandTotal += amt;
            if(totals[exp.cat] !== undefined) totals[exp.cat] += amt;
        });

        let insights = [];
        const today = new Date();
        const currentDay = today.getDate();
        const totalDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        
        let projectedSpend = (grandTotal / currentDay) * totalDays;
        
        if (projectedSpend > userSalary && currentDay > 3) {
            let deficit = projectedSpend - userSalary;
            insights.push(`<div class="ai-alert-danger rounded-3 d-flex gap-3 align-items-start p-3 w-100 shadow-sm"><i data-lucide="alert-triangle" class="flex-shrink-0 mt-0.5" style="width:16px;height:16px;"></i> <div><strong class="fw-semibold">Overspending Warning:</strong> You are spending about ${formatINR(grandTotal/currentDay)} a day. If you keep this up, you'll be short by <strong>${formatINR(deficit)}</strong> at the end of the month. Try to freeze spending for a couple of days.</div></div>`);
        } else if (projectedSpend < userSalary && grandTotal > 0 && currentDay > 5) {
            let surplus = userSalary - projectedSpend;
            insights.push(`<div class="ai-alert-success rounded-3 d-flex gap-3 align-items-start p-3 w-100 shadow-sm"><i data-lucide="trending-up" class="flex-shrink-0 mt-0.5" style="width:16px;height:16px;"></i> <div><strong class="fw-semibold">On Track:</strong> Great job. You are spending wisely. If you keep this up, you'll end the month with an extra <strong>${formatINR(surplus)}</strong> saved.</div></div>`);
        }

        let wants = totals['Food'] + totals['Shopping'] + totals['Entertainment'] + totals['Other'];
        let wantsPercent = userSalary > 0 ? (wants / userSalary) * 100 : 0;
        
        if (wantsPercent > 30) {
            let biggestDrain = totals['Food'] > totals['Shopping'] ? 'Food' : 'Shopping';
            insights.push(`<div class="ai-alert-warning rounded-3 d-flex gap-3 align-items-start p-3 w-100 shadow-sm"><i data-lucide="scale" class="flex-shrink-0 mt-0.5" style="width:16px;height:16px;"></i> <div><strong class="fw-semibold">Want vs. Need:</strong> You are spending a bit too much on fun and lifestyle stuff (mostly on <strong>${biggestDrain}</strong>). Try to dial this back to save more of your hard-earned money.</div></div>`);
        }

        let foodCount = expenses.filter(e => e.cat === 'Food').length;
        if (foodCount >= 4) {
            let avgFood = totals['Food'] / foodCount;
            insights.push(`<div class="ai-alert-neutral rounded-3 d-flex gap-3 align-items-start p-3 w-100 shadow-sm"><i data-lucide="coffee" class="flex-shrink-0 mt-0.5" style="width:16px;height:16px;"></i> <div><strong class="fw-semibold">Food Habit:</strong> You've ordered food ${foodCount} times, spending about ${formatINR(avgFood)} each time. Skipping just 2 of these orders next time will easily save you <strong>${formatINR(avgFood * 2)}</strong>.</div></div>`);
        }

        if (insights.length === 0 && grandTotal > 0) {
            insights.push(`<div class="ai-alert-success rounded-3 d-flex gap-3 align-items-start p-3 w-100 shadow-sm"><i data-lucide="check-circle" class="flex-shrink-0 mt-0.5" style="width:16px;height:16px;"></i> <div><strong class="fw-semibold">Looking Good:</strong> Your spending is perfectly balanced right now. Keep tracking your expenses to stay on target.</div></div>`);
        } else if (grandTotal === 0) {
            insights.push(`<div class="ai-alert-info rounded-3 d-flex gap-3 align-items-start p-3 w-100 shadow-sm"><i data-lucide="info" class="flex-shrink-0 mt-0.5" style="width:16px;height:16px;"></i> <div>Log some expenses so the app can start giving you smart tips on how to save money.</div></div>`);
        }

        insightBox.innerHTML = `<div class="d-flex flex-column gap-3" style="animation: fadeIn 0.2s ease-in-out forwards;">
            ${insights.join('')}
        </div>`;
        
        insightBox.classList.remove('d-none');
        lucide.createIcons();
    }, 1000); 
});

const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes spin { 100% { transform: rotate(360deg); } }
`;
document.head.appendChild(styleSheet);