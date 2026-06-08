/**
 * CholesTrack - Production-Ready PWA
 * Core Logic & Data Management
 */

// --- FIREBASE V11 STUBS ---
// Replace these with actual Firebase SDK imports in a real production environment
const firebaseConfig = {
    apiKey: "AIzaSyAc-yJS-Bg_9OrPAwxBMCyrWutZlVzinAI",
    authDomain: "cholestrack.firebaseapp.com",
    projectId: "cholestrack",
    storageBucket: "cholestrack.firebasestorage.app",
    messagingSenderId: "756044654695",
    appId: "1:756044654695:web:f8220aea7f14729aa20cc2",
    measurementId: "G-115YVL9SYN"
};

// Mock Firebase SDK Functions
const initializeApp = (config) => console.log("Firebase Initialized", config);
const getAuth = () => ({ currentUser: null });
const signInWithGoogle = () => new Promise(resolve => setTimeout(() => resolve({ user: { displayName: "Dr. Jules Mock" } }), 1000));
const getFirestore = () => ({});
const collection = (db, name) => ({ name });
const addDoc = (col, data) => {
    console.log(`Firestore Mock: Adding to ${col.name}`, data);
    return Promise.resolve({ id: Math.random().toString(36).substr(2, 9) });
};

// --- APP STATE ---
let chart = null;
const state = {
    historicalData: [], // 30 days of seeded data
    projections: [],    // 30 days of linear projections
    user: {
        isLoggedIn: false,
        name: 'Dr. Jules Mock'
    }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initUI();
});

function initAuth() {
    const loginBtn = document.getElementById('google-login');
    const authScreen = document.getElementById('auth-screen');
    const appContent = document.getElementById('app-content');

    loginBtn.addEventListener('click', () => {
        // Mocking Google Auth Transition
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
        setTimeout(() => {
            state.user.isLoggedIn = true;
            authScreen.classList.add('opacity-0');
            setTimeout(() => {
                authScreen.classList.add('hidden');
                appContent.classList.remove('hidden');
                setTimeout(() => {
                    appContent.classList.add('opacity-100');
                    bootstrapApp();
                }, 50);
            }, 500);
        }, 1500);
    });
}

function initUI() {
    // Accordion Logic
    document.querySelectorAll('.accordion-trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const targetId = trigger.getAttribute('data-target');
            const content = document.getElementById(targetId);
            const icon = trigger.querySelector('.fa-chevron-down');

            const isOpen = content.classList.contains('open');

            // Close all other accordions in the same group (optional, let's keep it open for now as requested)
            // But let's toggle the current one
            if (isOpen) {
                content.classList.remove('open');
                icon.style.transform = 'rotate(0deg)';
            } else {
                content.classList.add('open');
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });

    // Hardware Stream Sliders
    const calRange = document.getElementById('range-calories');
    const hrRange = document.getElementById('range-hr');

    if(calRange) {
        calRange.addEventListener('input', (e) => {
            document.getElementById('val-calories').textContent = `${e.target.value} kcal`;
        });
    }

    if(hrRange) {
        hrRange.addEventListener('input', (e) => {
            document.getElementById('val-hr').textContent = `${e.target.value} bpm`;
        });
    }
}

function bootstrapApp() {
    console.log('Bootstrapping application data...');
    loadData();
    seedIfEmpty();
    calculateProjections();
    updateUI();
    initChart();
    attachFormHandlers();
}

function loadData() {
    const savedData = localStorage.getItem('cholestrack_data');
    if (savedData) {
        state.historicalData = JSON.parse(savedData);
    }
}

function saveData() {
    localStorage.setItem('cholestrack_data', JSON.stringify(state.historicalData));
}

function seedIfEmpty() {
    if (state.historicalData.length > 0) return;

    const now = new Date();
    // Starting values (Day -30)
    let ldl = 145.0;
    let hdl = 38.0;

    for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Simulate progress: LDL drops slightly each day, HDL rises slightly
        // Add some random noise for realism
        ldl -= (0.4 + (Math.random() * 0.2));
        hdl += (0.1 + (Math.random() * 0.1));

        const total = ldl + hdl + 25; // 25 is a mock for VLDL

        state.historicalData.push({
            date: date.toISOString().split('T')[0],
            ldl: parseFloat(ldl.toFixed(1)),
            hdl: parseFloat(hdl.toFixed(1)),
            total: parseFloat(total.toFixed(1)),
            isMock: true
        });
    }
    saveData();
}

function calculateProjections() {
    if (state.historicalData.length < 2) return;

    // Use last 7 days for linear trend
    const recent = state.historicalData.slice(-7);
    const ldlStart = recent[0].ldl;
    const ldlEnd = recent[recent.length - 1].ldl;
    const hdlStart = recent[0].hdl;
    const hdlEnd = recent[recent.length - 1].hdl;

    const ldlSlope = (ldlEnd - ldlStart) / recent.length;
    const hdlSlope = (hdlEnd - hdlStart) / recent.length;

    state.projections = [];
    const lastDate = new Date(state.historicalData[state.historicalData.length - 1].date);

    for (let i = 1; i <= 30; i++) {
        const nextDate = new Date(lastDate);
        nextDate.setDate(nextDate.getDate() + i);

        const pLdl = ldlEnd + (ldlSlope * i);
        const pHdl = hdlEnd + (hdlSlope * i);

        state.projections.push({
            date: nextDate.toISOString().split('T')[0],
            ldl: parseFloat(pLdl.toFixed(1)),
            hdl: parseFloat(pHdl.toFixed(1)),
            total: parseFloat((pLdl + pHdl + 25).toFixed(1)),
            isProjection: true
        });
    }
}

function updateUI() {
    const latest = state.historicalData[state.historicalData.length - 1];
    const previous = state.historicalData[state.historicalData.length - 2] || latest;

    // Update Current KPI
    document.getElementById('curr-total').textContent = latest.total;
    document.getElementById('curr-ldl').textContent = latest.ldl;
    document.getElementById('curr-hdl').textContent = latest.hdl;
    document.getElementById('last-updated').textContent = `Updated: ${new Date().toLocaleTimeString()}`;

    // Update Delta Variance
    const ldlDelta = ((latest.ldl - previous.ldl) / previous.ldl * 100).toFixed(1);
    const hdlDelta = ((latest.hdl - previous.hdl) / previous.hdl * 100).toFixed(1);

    document.getElementById('ldl-delta-pct').textContent = `${ldlDelta > 0 ? '+' : ''}${ldlDelta}%`;
    document.getElementById('hdl-delta-pct').textContent = `${hdlDelta > 0 ? '+' : ''}${hdlDelta}%`;

    // Simple bar visual: negative LDL change is "good" (green)
    const ldlBar = document.getElementById('ldl-delta-bar');
    ldlBar.style.width = '100%';
    ldlBar.className = `h-full transition-all duration-1000 ${ldlDelta <= 0 ? 'bg-emerald-500' : 'bg-red-500'}`;

    const hdlBar = document.getElementById('hdl-delta-bar');
    hdlBar.style.width = '100%';
    hdlBar.className = `h-full transition-all duration-1000 ${hdlDelta >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`;

    // Velocity Indicator
    const recent = state.historicalData.slice(-7);
    const weeklyChange = (recent[recent.length - 1].ldl - recent[0].ldl).toFixed(1);
    const trendText = weeklyChange <= 0 ? 'Decreasing' : 'Increasing';
    const trendColor = weeklyChange <= 0 ? 'text-emerald-400' : 'text-red-400';

    document.getElementById('trend-indicator').textContent = `LDL ${trendText}`;
    document.getElementById('trend-indicator').className = `text-lg font-bold ${trendColor}`;
    document.getElementById('trend-subtext').textContent = `${weeklyChange} mg/dL / week`;
}

function initChart() {
    const ctx = document.getElementById('mainChart').getContext('2d');

    const labels = [...state.historicalData, ...state.projections].map(d => d.date);
    const ldlData = [...state.historicalData.map(d => d.ldl), ...state.projections.map(d => d.ldl)];
    const hdlData = [...state.historicalData.map(d => d.hdl), ...state.projections.map(d => d.hdl)];
    const totalData = [...state.historicalData.map(d => d.total), ...state.projections.map(d => d.total)];

    const splitIndex = state.historicalData.length;

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total',
                    data: totalData,
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4,
                    segment: {
                        borderDash: ctx => ctx.p0DataIndex >= splitIndex - 1 ? [5, 5] : undefined,
                        borderColor: ctx => ctx.p0DataIndex >= splitIndex - 1 ? 'rgba(255,255,255,0.3)' : '#ffffff'
                    }
                },
                {
                    label: 'LDL',
                    data: ldlData,
                    borderColor: '#10b981',
                    borderWidth: 3,
                    pointRadius: (ctx) => ctx.dataIndex === splitIndex - 1 ? 6 : 0,
                    pointBackgroundColor: '#10b981',
                    tension: 0.4,
                    segment: {
                        borderDash: ctx => ctx.p0DataIndex >= splitIndex - 1 ? [5, 5] : undefined,
                        borderColor: ctx => ctx.p0DataIndex >= splitIndex - 1 ? 'rgba(16,185,129,0.3)' : '#10b981'
                    }
                },
                {
                    label: 'HDL',
                    data: hdlData,
                    borderColor: '#3b82f6',
                    borderWidth: 3,
                    pointRadius: (ctx) => ctx.dataIndex === splitIndex - 1 ? 6 : 0,
                    pointBackgroundColor: '#3b82f6',
                    tension: 0.4,
                    segment: {
                        borderDash: ctx => ctx.p0DataIndex >= splitIndex - 1 ? [5, 5] : undefined,
                        borderColor: ctx => ctx.p0DataIndex >= splitIndex - 1 ? 'rgba(59,130,246,0.3)' : '#3b82f6'
                    }
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            scales: {
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono' } }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#94a3b8',
                        font: { family: 'JetBrains Mono', size: 10 },
                        maxRotation: 45,
                        autoSkip: true,
                        maxTicksLimit: 10
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#121214',
                    titleFont: { family: 'Inter', weight: 'bold' },
                    bodyFont: { family: 'JetBrains Mono' },
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1
                }
            }
        }
    });
}

function attachFormHandlers() {
    // Food Form
    document.getElementById('frm-food').addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        console.log('Food logged:', Object.fromEntries(fd));
        e.target.reset();
        showToast('Meal logged successfully');
    });

    // Activity Form
    document.getElementById('frm-activity').addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        console.log('Activity logged:', Object.fromEntries(fd));
        e.target.reset();
        showToast('Activity logged successfully');
    });

    // Manual Home Test
    document.getElementById('frm-test').addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const newData = {
            date: new Date().toISOString().split('T')[0],
            total: parseFloat(fd.get('total')),
            ldl: parseFloat(fd.get('ldl')),
            hdl: parseFloat(fd.get('hdl')),
            isMock: false
        };

        state.historicalData.push(newData);
        saveData();
        calculateProjections();
        updateUI();
        initChart();
        e.target.reset();
        showToast('Lipid values committed to history');
    });

    // Supplement Form
    document.getElementById('frm-supps').addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const selectedSupps = fd.getAll('supps');
        console.log('Supplements updated:', selectedSupps);
        showToast('Supplement regimen updated');
    });

    // Smartwatch Emulator
    document.getElementById('range-calories').addEventListener('change', (e) => {
        console.log('Emulator: Daily calorie burn adjusted', e.target.value);
    });

    document.getElementById('range-hr').addEventListener('change', (e) => {
        console.log('Emulator: Resting heart rate adjusted', e.target.value);
    });

    // Smart Scale Emulator
    document.getElementById('input-weight').addEventListener('input', (e) => {
        console.log('Emulator: Weight updated', e.target.value);
    });

    document.getElementById('input-water').addEventListener('input', (e) => {
        console.log('Emulator: Body water updated', e.target.value);
    });
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-6 right-6 glass border-emerald-500/50 border text-emerald-400 px-6 py-3 rounded-xl shadow-2xl z-[100] animate-bounce';
    toast.innerHTML = `<i class="fas fa-check-circle mr-2"></i> ${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
