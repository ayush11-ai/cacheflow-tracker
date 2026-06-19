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

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('expDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('exportSpecificDate').value = new Date().toISOString().split('T')[0];
    
    // Feature Carousel Text Animation for 2-Second Splash
    const featureText = document.getElementById('featureText');
    setTimeout(() => {
        featureText.style.opacity = '0'; featureText.style.transform = 'translateY(5px)';
        setTimeout(() => {
            featureText.innerHTML = "Download Freely."; featureText.style.opacity = '1'; featureText.style.transform = 'translateY(0)';
        }, 200); 
    }, 600);

    setTimeout(() => {
        featureText.style.opacity = '0'; featureText.style.transform = 'translateY(5px)';
        setTimeout(() => {
            featureText.innerHTML = "Be Smart."; featureText.style.opacity = '1'; featureText.style.transform = 'translateY(0)';
        }, 200);
    }, 1300);

    // Two Second Auto-Running Controller
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        splash.style.transform = "translateY(-100%)";
        splash.style.opacity = "0";
        setTimeout(() => { splash.style.display = "none"; }, 600);
        
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
    toast.className = `custom-toast ${type === 'error' ? 'bg-danger border-danger' : ''}`;
    toast.innerHTML = msg;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 3000);
}

// ==========================================
// 6. CHART.JS CONFIGURATION
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
        ctx.font = "bold 1.25em 'Inter', sans-serif";
        ctx.textBaseline = "middle"; ctx.fillStyle = "#0f172a"; 
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
            backgroundColor: ['#fb7185', '#38bdf8', '#facc15', '#34d399', '#f472b6', '#818cf8', '#fb923c', '#a78bfa', '#f43f5e', '#94a3b8'],
            borderWidth: 0, borderRadius: 8, spacing: 4, hoverOffset: 6   
        }]
    },
    plugins: [centerTextPlugin],
    options: { responsive: true, maintainAspectRatio: false, cutout: '80%', plugins: { legend: { display: false } } }
});

// ==========================================
// 7. TRANSACTIONS MANAGEMENT
// ==========================================
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
// 11. DASHBOARD RENDERER
// ==========================================
function updateDashboard(dataArray = expenses, isFiltered = false) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    let totals = { Food: 0, Travel: 0, Shopping: 0, Entertainment: 0, 'Health care': 0, EMI: 0, Rent: 0, Investment: 0, Emergency: 0, Other: 0 };
    let grandTotal = 0;

    if (dataArray.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted"><em>No expenses logged for this view.</em></td></tr>`;
    } else {
        dataArray.forEach((exp, index) => {
            let delay = Math.min(index * 0.05, 0.5); 
            tbody.innerHTML += `
                <tr class="row-enter" style="animation-delay: ${delay}s;">
                    <td class="text-muted small ps-4">${exp.date}</td>
                    <td class="fw-medium text-navy">${exp.desc}</td>
                    <td><span class="badge bg-light text-secondary border">${exp.cat}</span></td>
                    <td class="text-danger fw-bold">${formatINR(exp.amount)}</td>
                    <td class="text-end pe-4 no-print">
                        <button class="btn btn-sm text-danger border-0 fw-bold delete-tx-btn btn-scale" data-id="${exp.id}">Delete</button>
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
    } else {
        expenseChart.data.datasets[0].data = [totals.Food, totals.Travel, totals.Shopping, totals.Entertainment, totals['Health care'], totals.EMI, totals.Rent, totals.Investment, totals.Emergency, totals.Other];
        expenseChart.update();
    }
}

// ==========================================
// 12. ADVANCED HEURISTIC RULES ENGINE 
// ==========================================
document.getElementById('aiBtn').addEventListener('click', () => {
    const insightBox = document.getElementById('aiInsights');
    const skeleton = document.getElementById('aiSkeleton');
    const btn = document.getElementById('aiBtn');
    
    if (window.umami) umami.track('Diagnostic Run');

    btn.innerHTML = "Compiling Analytics..."; btn.disabled = true;
    insightBox.classList.add('d-none'); skeleton.classList.remove('d-none'); 

    setTimeout(() => {
        btn.innerHTML = "Run Deep Diagnostic"; btn.disabled = false;
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
            insights.push(`<strong>Overspending Warning:</strong> You are spending about ${formatINR(grandTotal/currentDay)} a day. If you keep this up, you'll be short by <strong>${formatINR(deficit)}</strong> at the end of the month. Try to freeze spending for a couple of days.`);
        } else if (projectedSpend < userSalary && grandTotal > 0 && currentDay > 5) {
            let surplus = userSalary - projectedSpend;
            insights.push(`<strong>On Track:</strong> Great job! You are spending wisely. If you keep this up, you'll end the month with an extra <strong>${formatINR(surplus)}</strong> saved.`);
        }

        let wants = totals['Food'] + totals['Shopping'] + totals['Entertainment'] + totals['Other'];
        let wantsPercent = userSalary > 0 ? (wants / userSalary) * 100 : 0;
        
        if (wantsPercent > 30) {
            let biggestDrain = totals['Food'] > totals['Shopping'] ? 'Food' : 'Shopping';
            insights.push(`<strong>Want vs. Need:</strong> You are spending a bit too much on fun and lifestyle stuff (mostly on <strong>${biggestDrain}</strong>). Try to dial this back to save more of your hard-earned money.`);
        }

        let foodCount = expenses.filter(e => e.cat === 'Food').length;
        if (foodCount >= 4) {
            let avgFood = totals['Food'] / foodCount;
            insights.push(`<strong>Food Habit:</strong> You've ordered food ${foodCount} times, spending about ${formatINR(avgFood)} each time. Skipping just 2 of these orders next time will easily save you <strong>${formatINR(avgFood * 2)}</strong>.`);
        }

        let largeTx = expenses.filter(e => e.amount > (userSalary * 0.15));
        if (largeTx.length > 0) {
            insights.push(`<strong>Big Expense:</strong> Your payment for '${largeTx[0].desc}' took up a massive chunk of your budget all at once. Be extra careful with big purchases early in the month.`);
        }

        let daysWithSpends = new Set(expenses.map(e => e.isoDate)).size;
        let zeroDays = currentDay - daysWithSpends;
        if (zeroDays >= 4 && grandTotal > 0) {
            insights.push(`<strong>Great Habit:</strong> You didn't spend any money at all for ${zeroDays} days this month. Building 'Zero-Spend Days' is a super fast way to hit your savings goal.`);
        }

        if (insights.length === 0 && grandTotal > 0) {
            insights.push(`<strong>Looking Good:</strong> Your spending is perfectly balanced right now. Keep tracking your expenses to stay on target.`);
        } else if (grandTotal === 0) {
            insights.push(`Log some expenses so the app can start giving you smart tips on how to save money.`);
        }

        insightBox.innerHTML = `<ul class="mb-0 ps-3" style="animation: slideInLeft 0.5s ease-out forwards;">
            ${insights.map(i => `<li class="mb-3 text-dark" style="line-height: 1.55;">${i}</li>`).join('')}
        </ul>`;
        insightBox.classList.remove('d-none');
    }, 1500); 
});