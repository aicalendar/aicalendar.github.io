import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA7I4hOdQkGlOCoYipZmiIXpbW7r2TwEZA",
  authDomain: "ai-calendar-332ea.firebaseapp.com",
  projectId: "ai-calendar-332ea",
  storageBucket: "ai-calendar-332ea.firebasestorage.app",
  messagingSenderId: "287212034262",
  appId: "1:287212034262:web:6f6ad3d7d351c1939ed177"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Constants
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const daysOfWeekFull = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// --- APP STATE (SPA Routing) ---
let state = {
    view: 'year', // 'year' | 'month' | 'day'
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    day: new Date().getDate(),
    currentUser: null
};

// --- AUTH LOGIC ---
let isRegisterMode = false;

onAuthStateChanged(auth, (user) => {
    state.currentUser = user;
    if (user) {
        // User is signed in — hide modal, show content
        document.getElementById('authModal').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        document.getElementById('mainContent').style.pointerEvents = 'auto';
        document.getElementById('userInfo').innerText = `${user.displayName || user.email}`;
        if (user.photoURL) {
            // Find the profile picture
            document.getElementById('userProfilePic').src = user.photoURL;
            // If there is picture show it.
            document.getElementById('userProfilePic').style.display = 'block'; 
        }
        renderView();
    } else {
        // Not signed in — show modal, hide content
        document.getElementById('authModal').style.display = 'flex';
        document.getElementById('mainContent').style.display = 'block';
        document.getElementById('mainContent').style.pointerEvents = 'none'; // not clickable
        renderView(); // render the calendar as background
    }
});

// Google Sign-In
document.getElementById('googleSignIn').addEventListener('click', () => signInWithPopup(auth, provider).catch(e => showError(e.message)));
// Email Sign-In or Register
document.getElementById('emailSignIn').addEventListener('click', () => {
    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value;
    if (!email || !password) return showError("Please fill in all fields.");
    const action = isRegisterMode ? createUserWithEmailAndPassword : signInWithEmailAndPassword;
    action(auth, email, password).catch(err => showError(err.message));
});

// Switch between Login / Register
document.getElementById('switchToRegister').addEventListener('click', () => {
    isRegisterMode = !isRegisterMode;
    document.getElementById('emailSignIn').innerText = isRegisterMode ? 'Register' : 'Continue';
    document.getElementById('switchToRegister').innerText = isRegisterMode ? 'Login instead' : 'Register';
    showError('');
});
// Sign Out
document.getElementById('signOutBtn')?.addEventListener('click', () => signOut(auth));

function showError(msg) { document.getElementById('authError').innerText = msg; }

// --- SPA ROUTER / RENDERER ---
// Dropdown
const dropBtn = document.getElementById('currentViewBtn');
const dropContent = document.querySelector('.dropdown-content');

dropBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropContent.classList.toggle('show');
});

document.addEventListener('click', () => {
    dropContent.classList.remove('show');
});

document.querySelectorAll('.dropdown-content a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        dropContent.classList.remove('show');
        const view = e.currentTarget.getAttribute('data-view');
        navigateTo(view);
    });
});

function updateDropdownLabel() {
    const btn = document.getElementById('currentViewBtn');
    const viewNames = { year: 'Year', month: 'Month', day: 'Day' };
    btn.innerHTML = `${viewNames[state.view]} <span>&#9662;</span>`;
}

function navigateTo(view, params = {}) {
    state.view = view;
    if (params.year !== undefined) state.year = params.year;
    if (params.month !== undefined) state.month = params.month;
    if (params.day !== undefined) state.day = params.day;
    renderView();
}

function renderView() {
    const container = document.getElementById('app-container');
    container.innerHTML = '';
    
    updateDropdownLabel();

    if (state.view === 'year') renderYearView(container);
    else if (state.view === 'month') renderMonthView(container);
    else if (state.view === 'day') renderDayView(container);
}

// --- CALENDAR GENERATION LOGIC ---
// SHARED: build one month's <table>
function buildMonthTable(year, month, tableClass, onDayClick) {
    const table = document.createElement('table');
    table.className = tableClass;

    const thead = document.createElement('tr');
    daysOfWeek.forEach(day => {
        const th = document.createElement('th'); th.innerText = day; thead.appendChild(th);
    });
    table.appendChild(thead);

    // Calculate the dates
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    let date = 1, nextMonthDate = 1;
    let row = document.createElement('tr');

    // Loop for all the cages (42 cells)
    for (let i = 0; i < 42; i++) {
        const cell = document.createElement('td');
        // CASE 1: Days of the previous month
        if (i < firstDayIndex) {
            cell.innerText = prevMonthDays - (firstDayIndex - 1 - i);
            cell.className = "other-month";
        } 
        // CASE 2: Days of the current month
        else if (date <= daysInMonth) {
            const d = date;
            cell.innerText = date;
            cell.className = 'day-cell';
            cell.style.cursor = 'pointer';
            if (onDayClick) cell.addEventListener('click', (e) => { e.stopPropagation(); onDayClick(d); });
            date++;
        }
        // CASE 3: Days of the next month
        else {
            cell.innerText = nextMonthDate;
            cell.className = "other-month";
            nextMonthDate++;
        }
        row.appendChild(cell);
        // Every 7 days change the line
        if ((i + 1) % 7 === 0) { table.appendChild(row); row = document.createElement('tr'); }
    }
    return table;
}

// --- VIEWS ---
function renderYearView(container) {
    const header = document.createElement('div');
    header.innerHTML = `
        <h1 class="view-title">My Calendar</h1>
        <h2 class="view-title">Year : 
            <button id="prevYear" class="nav-btn">&lt;</button>
            <input type="number" id="yearInput" value="${state.year}" min="1900" max="2100">
            <button id="nextYear" class="nav-btn">&gt;</button>
        </h2>
    `;
    container.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'grid-container';

    for (let month = 0; month < 12; month++) {
        // Creation of the wrapper
        const monthDiv = document.createElement('div');
        monthDiv.className = 'month-wrapper';
        monthDiv.innerHTML = `<h3 class="month-title">${months[month]}</h3>`;
        
        // Table creation
        const table = buildMonthTable(state.year, month, 'year-table', null);
        table.addEventListener('click', () => navigateTo('month', { month }));
        
        monthDiv.appendChild(table);
        grid.appendChild(monthDiv);
    }
    container.appendChild(grid);

    // Events
    document.getElementById('prevYear').onclick = () => navigateTo('year', { year: state.year - 1 });
    document.getElementById('nextYear').onclick = () => navigateTo('year', { year: state.year + 1 });
    document.getElementById('yearInput').onchange = (e) => {
        const y = parseInt(e.target.value);
        if (y > 0) navigateTo('year', { year: y });
    };
}

// SINGLE MONTH VIEW
function renderMonthView(container) {
    const header = document.createElement('div');
    header.style.textAlign = 'center';
    header.innerHTML = `<h1 class="view-title" id="monthTitle">${months[state.month]} ${state.year}</h1>`;
    container.appendChild(header);

    const wrap = document.createElement('div');
    wrap.className = 'single-month-container';
    
    const table = buildMonthTable(state.year, state.month, 'month-table', (d) => navigateTo('day', { day: d }));
    wrap.appendChild(table);
    container.appendChild(wrap);
}

// SINGLE DAY VIEW
async function renderDayView(container) {
    const fullDate = new Date(state.year, state.month, state.day);
    const dayName = daysOfWeekFull[fullDate.getDay()]; 

    const header = document.createElement('div');
    header.style.textAlign = 'center';
    header.innerHTML = `<h2 class="view-title" id="dayTitle">${dayName} ${months[state.month]} ${state.day}, ${state.year}</h2>`;
    container.appendChild(header);

    const grid = document.createElement('div');
    const table = document.createElement('table');
    table.className = 'hour-table';

    container.appendChild(grid);
    grid.appendChild(table);

    // --- FIRESTORE LOGIC FOR THIS DAY ---
    if (!state.currentUser) return;
    const dateKey = `${state.year}-${String(state.month+1).padStart(2,'0')}-${String(state.day).padStart(2,'0')}`;
    const docRef = doc(db, 'users', state.currentUser.uid, 'plans', dateKey);
    
    const docSnap = await getDoc(docRef);
    const savedNotes = docSnap.exists() ? docSnap.data() : {};

    for (let h = 0; h < 24; h++) {
        const row = document.createElement('tr');
        const timeCell = document.createElement('td');
        timeCell.className = 'hour-label';
        timeCell.innerText = String(h).padStart(2,'0') + ':00';

        const noteCell = document.createElement('td');
        noteCell.className = 'hour-note';
        noteCell.contentEditable = true;
        noteCell.innerText = savedNotes[`h${h}`] || '';
        noteCell.setAttribute('data-hour', h);

        noteCell.addEventListener('blur', async () => {
            const allNotes = {};
            document.querySelectorAll('.hour-note').forEach(cell => {
                const hr = cell.getAttribute('data-hour');
                if (cell.innerText.trim()) allNotes[`h${hr}`] = cell.innerText.trim();
            });
            await setDoc(docRef, allNotes);
        });

        row.appendChild(timeCell);
        row.appendChild(noteCell);
        table.appendChild(row);
    }
}