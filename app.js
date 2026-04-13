// Constants and Data
const DEFAULT_BASES = {
    auto: 15.4,
    bike: 22.8,
    scooter: 39.3,
    ev: 7.4
};

const CURRENT_RATES = {
    auto: 11.0,
    bike: 7.4,
    scooter: 4.3,
    ev: 4.1,
    phev: 7.5
};

let priceChart;
let currentPeriod = '6m';

// Historical Data: Aichi Regular Gasoline (Monthly Average)
const HISTORICAL_DATA = [
    { m: '23/04', p: 164.9 }, { m: '23/05', p: 164.5 }, { m: '23/06', p: 166.4 },
    { m: '23/07', p: 171.6 }, { m: '23/08', p: 180.4 }, { m: '23/09', p: 179.8 },
    { m: '23/10', p: 171.1 }, { m: '23/11', p: 168.4 }, { m: '23/12', p: 170.7 },
    { m: '24/01', p: 171.1 }, { m: '24/02', p: 170.6 }, { m: '24/03', p: 171.1 },
    { m: '24/04', p: 170.9 }, { m: '24/05', p: 170.6 }, { m: '24/06', p: 169.6 },
    { m: '24/07', p: 170.0 }, { m: '24/08', p: 168.4 }, { m: '24/09', p: 168.9 },
    { m: '24/10', p: 169.6 }, { m: '24/11', p: 168.9 }, { m: '24/12', p: 172.0 },
    { m: '25/01', p: 176.1 }, { m: '25/02', p: 177.2 }, { m: '25/03', p: 178.6 },
    { m: '25/04', p: 180.5 }, { m: '25/05', p: 174.5 }, { m: '25/06', p: 166.2 },
    { m: '25/07', p: 166.9 }, { m: '25/08', p: 168.4 }, { m: '25/09', p: 169.3 },
    { m: '25/10', p: 168.9 }, { m: '25/11', p: 165.2 }, { m: '25/12', p: 155.1 },
    { m: '26/01', p: 147.6 }, { m: '26/02', p: 149.5 }, { m: '26/03', p: 165.9 }
];

// Special Detailed Data for 6M View (Weekly in March/April)
const DETAILED_DATA_6M = [
    { m: '25/10', p: 168.9 }, { m: '25/11', p: 165.2 }, { m: '25/12', p: 155.1 },
    { m: '26/01', p: 147.6 }, { m: '26/02', p: 149.5 }, { m: '3/2', p: 152.5 },
    { m: '3/9', p: 155.6 }, { m: '3/16', p: 186.7 }, { m: '3/23', p: 171.0 },
    { m: '3/30', p: 163.5 }, { m: '4/6', p: 159.5 }, { m: '現在', p: 159.5 }
];

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSettings();
    initChart();
    calculate(true); // Initial calculation with no animation delay
    
    // Page Reveal Animation
    gsap.from(".lg\\:col-span-4", { opacity: 0, x: -30, duration: 0.8, ease: "power2.out" });
    gsap.from(".lg\\:col-span-8 > div", { 
        opacity: 0, 
        y: 30, 
        duration: 0.8, 
        stagger: 0.2, 
        ease: "power2.out",
        delay: 0.2
    });
});

// Theme Management
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        localStorage.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        updateChartTheme();
    });
}

// Settings Panel
function initSettings() {
    const toggle = document.getElementById('toggleSettings');
    const panel = document.getElementById('settingsPanel');
    
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        if (panel.classList.contains('hidden')) {
            panel.classList.remove('hidden');
            setTimeout(() => panel.classList.replace('opacity-0', 'opacity-100'), 10);
        } else {
            panel.classList.replace('opacity-100', 'opacity-0');
            setTimeout(() => panel.classList.add('hidden'), 300);
        }
    });
}

// Calculation Engine
function calculate(instant = false) {
    const gasPrice = parseFloat(document.getElementById('gasPrice').value) || 0;
    const elecPrice = parseFloat(document.getElementById('elecPrice').value) || 0;
    
    const baseAuto = parseFloat(document.getElementById('baseAuto').value) || DEFAULT_BASES.auto;
    const baseEv = parseFloat(document.getElementById('baseEv').value) || DEFAULT_BASES.ev;

    // Logic
    const rawAuto = gasPrice / baseAuto;
    const roundedAuto = Math.round(rawAuto);
    
    const rawBike = gasPrice / DEFAULT_BASES.bike;
    const roundedBike = Math.round(rawBike);
    
    const rawEv = elecPrice / baseEv;
    const roundedEv = Math.round(rawEv);
    
    const rawPhev = (roundedAuto + roundedEv) / 2;
    const roundedPhev = Math.round(rawPhev);

    // Update Formula Displays
    document.getElementById('calcAuto').textContent = `${gasPrice} ÷ ${baseAuto.toFixed(1)}`;
    document.getElementById('calcBike').textContent = `${gasPrice} ÷ ${DEFAULT_BASES.bike.toFixed(1)}`;
    document.getElementById('calcEv').textContent = `${elecPrice} ÷ ${baseEv.toFixed(1)}`;
    document.getElementById('calcPhev').textContent = `Avg(${roundedAuto}, ${roundedEv})`;

    // Update Results with Animation
    animateNumber('resultAuto', roundedAuto, instant);
    animateNumber('resultBike', roundedBike, instant);
    animateNumber('resultEv', roundedEv, instant);
    animateNumber('resultPhev', roundedPhev, instant);

    // Update Badges
    updateBadge('badgeAuto', CURRENT_RATES.auto, roundedAuto);
    updateBadge('badgeBike', CURRENT_RATES.bike, roundedBike);
    updateBadge('badgeEv', CURRENT_RATES.ev, roundedEv);
    updateBadge('badgePhev', CURRENT_RATES.phev, roundedPhev);

    // Sync Chart Highlight
    if (priceChart) updateChartHighlight(gasPrice);
}

function animateNumber(id, newValue, instant) {
    const el = document.getElementById(id);
    const startValue = parseInt(el.textContent) || 0;
    
    if (instant) {
        el.textContent = newValue;
        return;
    }

    gsap.to(el, {
        innerText: newValue,
        duration: 0.5,
        snap: { innerText: 1 },
        ease: "power1.out"
    });
}

function updateBadge(id, current, updated) {
    const el = document.getElementById(id);
    const diff = Math.round((updated - current) * 10) / 10;
    
    if (diff > 0) {
        el.textContent = `+${diff.toFixed(1)}円`;
        el.className = "badge-up text-[10px] font-bold px-2 py-1 rounded-full";
    } else if (diff < 0) {
        el.textContent = `${diff.toFixed(1)}円`;
        el.className = "badge-down text-[10px] font-bold px-2 py-1 rounded-full";
    } else {
        el.textContent = `±0円`;
        el.className = "badge-neutral text-[10px] font-bold px-2 py-1 rounded-full";
    }
}

// Chart.js implementation
function initChart() {
    const ctx = document.getElementById('priceChart').getContext('2d');
    
    // Default to 6M initial view
    const dataSet = DETAILED_DATA_6M;
    const labels = dataSet.map(d => d.m);
    const prices = dataSet.map(d => d.p);

    // Calculate Oct-Mar average (Revision Basis)
    const revisionPrices = [168.9, 165.2, 155.1, 147.6, 149.5, 165.9]; // 165.9 is Mar avg
    const revisionAvg = revisionPrices.reduce((a, b) => a + b, 0) / revisionPrices.length;
    animateNumber('avgPrice', revisionAvg.toFixed(1), true);

    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(74, 105, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(74, 105, 255, 0)');

    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'レギュラー価格',
                data: prices,
                borderColor: '#4a69ff',
                backgroundColor: gradient,
                borderWidth: 3,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#4a69ff',
                pointHoverRadius: 8,
                fill: true,
                tension: 0 // Straight lines
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    titleColor: isDark ? '#ffffff' : '#1e293b',
                    bodyColor: isDark ? '#94a3b8' : '#64748b',
                    padding: 12,
                    cornerRadius: 12,
                    displayColors: false
                }
            },
            scales: {
                y: {
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { family: 'Outfit' } },
                    min: 140,
                    max: 200
                },
                x: {
                    grid: { display: false },
                    ticks: { color: textColor, font: { size: 10 } }
                }
            }
        }
    });
}

function updateChartHighlight(val) {
    if (!priceChart) return;
    const data = priceChart.data.datasets[0].data;
    data[data.length - 1] = val;
    
    // Update the average display based on current period
    let avg;
    if (currentPeriod === '6m') {
        const revisionPrices = [168.9, 165.2, 155.1, 147.6, 149.5, 165.9];
        avg = revisionPrices.reduce((a, b) => a + b, 0) / revisionPrices.length;
    } else {
        avg = data.reduce((a, b) => a + b, 0) / data.length;
    }
    document.getElementById('avgPrice').textContent = avg.toFixed(1);
    
    priceChart.update('none');
}

function changePeriod(period) {
    currentPeriod = period;
    if (!priceChart) return;

    let dataSet;
    let avg;

    if (period === '6m') {
        dataSet = DETAILED_DATA_6M;
        labelText = '算定期間平均(10-3月):';
        const revisionPrices = [168.9, 165.2, 155.1, 147.6, 149.5, 165.9];
        avg = revisionPrices.reduce((a, b) => a + b, 0) / revisionPrices.length;
    } else if (period === '1y') {
        const hist1y = HISTORICAL_DATA.slice(-12);
        avg = hist1y.reduce((a, b) => a + b.p, 0) / hist1y.length;
        dataSet = [...hist1y, { m: '現在', p: avg }];
        labelText = '1年平均:';
    } else if (period === '3y') {
        avg = HISTORICAL_DATA.reduce((a, b) => a + b.p, 0) / HISTORICAL_DATA.length;
        dataSet = [...HISTORICAL_DATA, { m: '現在', p: avg }];
        labelText = '3年平均:';
    }
    
    document.getElementById('avgLabel').textContent = labelText;
    document.getElementById('avgPrice').textContent = avg.toFixed(1);

    // Sync input field with the average of the selected period
    const gasInput = document.getElementById('gasPrice');
    gasInput.value = avg.toFixed(1);
    
    // Animate the input update
    gsap.fromTo(gasInput, { backgroundColor: 'rgba(74, 105, 255, 0.1)' }, { backgroundColor: 'transparent', duration: 0.8 });
    
    // Recalculate results
    priceChart.data.labels = dataSet.map(d => d.m);
    priceChart.data.datasets[0].data = dataSet.map(d => d.p);
    
    // Recalculate results (moved after chart data update)
    calculate();
    
    // Update Button UI
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-primary-600', 'text-white');
        btn.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-500');
    });
    const activeBtn = document.querySelector(`.period-btn[onclick*="${period}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active', 'bg-primary-600', 'text-white');
        activeBtn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-500');
    }

    priceChart.update();
}

function updateChartTheme() {
    if (!priceChart) return;
    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    priceChart.options.scales.y.grid.color = gridColor;
    priceChart.options.scales.y.ticks.color = textColor;
    priceChart.options.scales.x.ticks.color = textColor;
    priceChart.options.plugins.tooltip.backgroundColor = isDark ? '#1e293b' : '#ffffff';
    priceChart.options.plugins.tooltip.titleColor = isDark ? '#ffffff' : '#1e293b';
    priceChart.update();
}

// Data Fetching Mock
function fetchLatestData() {
    const btn = document.getElementById('fetchBtn');
    const icon = document.getElementById('syncIcon');
    const gasInput = document.getElementById('gasPrice');
    
    btn.disabled = true;
    icon.classList.add('fa-spin');
    btn.querySelector('span').textContent = 'データを取得中...';

    setTimeout(() => {
        const val = 159.5;
        gasInput.value = val;
        
        // Success animation for input
        gsap.to(gasInput, { backgroundColor: 'rgba(34, 197, 94, 0.1)', duration: 0.3 });
        gsap.to(gasInput, { backgroundColor: 'transparent', duration: 1, delay: 0.3 });

        calculate();
        showToast("最新価格（愛知県: 159.5円/L）を取得しました。");

        btn.disabled = false;
        icon.classList.remove('fa-spin');
        btn.querySelector('span').textContent = '官公庁データから最新取得';
        
        showToast("最新価格（愛知県: 159.5円/L）を取得しました。算定には半期平均を使用します。");
    }, 1200);
}

// Utils
function showToast(msg) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = "bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl shadow-2xl scale-0 transition-transform duration-300 pointer-events-auto text-sm font-bold border border-white/10 dark:border-slate-200 mt-2";
    toast.textContent = msg;
    
    container.appendChild(toast);
    setTimeout(() => toast.classList.replace('scale-0', 'scale-100'), 10);
    
    setTimeout(() => {
        toast.classList.replace('scale-100', 'scale-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function copyResults() {
    const auto = document.getElementById('resultAuto').textContent;
    const bike = document.getElementById('resultBike').textContent;
    const ev = document.getElementById('resultEv').textContent;
    const phev = document.getElementById('resultPhev').textContent;

    const results = `■ 交通費支給単価 見直し案 (2026/04)\n` +
                 `・自動車: ${auto} 円/km\n` +
                 `・バイク: ${bike} 円/km\n` +
                 `・E V : ${ev} 円/km\n` +
                 `・PHEV: ${phev} 円/km\n` +
                 `※ 経済産業省 最新価格に基づき算出`;

    navigator.clipboard.writeText(results).then(() => {
        showToast("結果をクリップボードにコピーしました！");
    });
}
