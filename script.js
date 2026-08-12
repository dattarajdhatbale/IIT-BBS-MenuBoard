const SHEET_URL = "https://opensheet.elk.sh/1hjmikrz6rW5QtAJCfE88hxGlqA8N6Nq5SG4Is8qHOGs/Sheet1";
let sheetData = [];

async function fetchSheetData() {
    try{
        const res= await fetch(SHEET_URL);
        sheetData= await res.json();
        console.log("Sheet loaded:", sheetData);
    } catch(e){
        console.log("Sheet load error");
    }
}

/* ---------- PWA: Service Worker Registration ---------- */
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js")
            .then(reg => console.log("Service worker registered:", reg.scope))
            .catch(err => console.log("Service worker registration failed:", err));
    });
}

/* ---------- PWA: Install Prompt Handling ---------- */
let deferredInstallPrompt = null;

function isRunningStandalone() {
    // Covers Chrome/Edge/Android ("display-mode: standalone") and iOS Safari ("navigator.standalone").
    return window.matchMedia("(display-mode: standalone)").matches
        || window.navigator.standalone === true;
}

function isIos() {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function showInstallButton() {
    const btn = document.getElementById("installBtn");
    const note = document.getElementById("installNote");
    btn.classList.remove("hidden");
    note.classList.add("hidden");
}

function showInstallNote(message) {
    const btn = document.getElementById("installBtn");
    const note = document.getElementById("installNote");
    btn.classList.add("hidden");
    note.textContent = message;
    note.classList.remove("hidden");
}

function hideInstallUi() {
    document.getElementById("installBtn").classList.add("hidden");
    document.getElementById("installNote").classList.add("hidden");
}

(function initInstallUi() {
    // Already installed and running as an app: nothing to show.
    if (isRunningStandalone()) {
        hideInstallUi();
        return;
    }

    // iOS Safari never fires beforeinstallprompt, so show manual instructions instead.
    if (isIos()) {
        showInstallNote("To install: tap Share → Add to Home Screen");
        return;
    }

    // Everywhere else: wait for Chrome/Edge to tell us installation is available.
    // Until that event fires (or if it never does), keep the install UI hidden
    // rather than showing a button that won't work.
})();

window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault(); // stop the default mini-infobar
    deferredInstallPrompt = event;
    if (!isRunningStandalone()) {
        showInstallButton();
    }
});

async function installApp() {
    if (!deferredInstallPrompt) {
        return;
    }
    const btn = document.getElementById("installBtn");
    btn.disabled = true;

    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    console.log("Install prompt outcome:", outcome);

    // Whether accepted or dismissed, this prompt instance is spent.
    // Chrome won't refire beforeinstallprompt again for a while after a dismissal,
    // which naturally prevents repeatedly annoying the user.
    deferredInstallPrompt = null;
    hideInstallUi();
    btn.disabled = false;
}

window.addEventListener("appinstalled", () => {
    console.log("App installed");
    deferredInstallPrompt = null;
    hideInstallUi();
});

/* ---------- Theme (Default = Light) ---------- */
(function () {
    const saved = localStorage.getItem("theme");
    const theme = saved ? saved : "light";
    document.documentElement.setAttribute("data-theme", theme);
})();

function toggleTheme(){
    const html=document.documentElement;
    const newTheme= html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
}

/* Auto Today */
(function(){
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = days[new Date().getDay()];
        document.getElementById("daySelect").value = today;
})();

function showMenu(){
    const btn = document.querySelector(".primary-btn");
    btn.disabled = true ;
     if (sheetData.length === 0) {
        document.getElementById("menuContent").innerHTML =
            "<div class='loader'>Loading menu...</div>";
        btn.disabled = false;
        return;
    }
    const selection= document.getElementById("selectionCard");
    const menuCard= document.getElementById("menuCard");
    const menuContent= document.getElementById("menuContent");
    const menuHeader= document.getElementById("menuHeader");

    selection.classList.add("fade-out");

    setTimeout(()=> {
        selection.classList.add("hidden");
        menuCard.classList.remove("hidden");

        const hall= document.getElementById("hallSelect").value;
        const day= document.getElementById("daySelect").value;

        menuHeader.innerText = hall + " • " + day;
        const data = sheetData.find(
            row => row.Hall.trim() === hall && row.Day.trim() === day
        );
        if(!data){
            menuContent.innerHTML="<div class='loader'>Menu not uploaded yet</div>";
            btn.disabled=false;
            return;
        }
        
        menuContent.innerHTML = `
            <div class="meal">
                <div class="meal-title">Breakfast</div>
                <div class="meal-value">${data.Breakfast}</div>
            </div>
            <div class="meal">
                <div class="meal-title">Lunch</div>
                <div class="meal-value">${data.Lunch}</div>
            </div>
            <div class="meal">
                <div class="meal-title">Snacks</div>
                <div class="meal-value">${data.Snacks}</div>
            </div>

            <div class="meal">
                <div class="meal-title">Dinner</div>
                <div class="meal-value">${data.Dinner}</div>
            </div>
        `;
        btn.disabled=false;
    },300);
}
function goBack() {
    const selection= document.getElementById("selectionCard");
    const menuCard= document.getElementById("menuCard");

    menuCard.classList.add("hidden");
    selection.classList.remove("hidden");
    selection.style.opacity=1;

    setTimeout(()=>{
        selection.classList.remove("fade-out");
    },50);
}
/* ═══════════════════════════════════════════
   MESS CARD — IndexedDB storage + fullscreen
   ═══════════════════════════════════════════ */
const MessCardDB = (() => {
    const DB_NAME = 'menuboard-db';
    const STORE   = 'mess-card';

    function open() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, 1);
            req.onupgradeneeded = e => e.target.result.createObjectStore(STORE);
            req.onsuccess = e => resolve(e.target.result);
            req.onerror   = e => reject(e.target.error);
        });
    }

    return {
        async save(blob) {
            const db = await open();
            return new Promise((res, rej) => {
                const tx = db.transaction(STORE, 'readwrite');
                tx.objectStore(STORE).put(blob, 'card');
                tx.oncomplete = res;
                tx.onerror    = e => rej(e.target.error);
            });
        },
        async get() {
            const db = await open();
            return new Promise((res, rej) => {
                const req = db.transaction(STORE, 'readonly')
                              .objectStore(STORE).get('card');
                req.onsuccess = e => res(e.target.result ?? null);
                req.onerror   = e => rej(e.target.error);
            });
        },
        async remove() {
            const db = await open();
            return new Promise((res, rej) => {
                const tx = db.transaction(STORE, 'readwrite');
                tx.objectStore(STORE).delete('card');
                tx.oncomplete = res;
                tx.onerror    = e => rej(e.target.error);
            });
        }
    };
})();

/* ---- State ---- */
let messCardObjectURL = null;

function showMessCardEmpty() {
    document.getElementById('messCardEmpty').classList.remove('hidden');
    document.getElementById('messCardStored').classList.add('hidden');
}

function showMessCardStored(blob) {
    if (messCardObjectURL) URL.revokeObjectURL(messCardObjectURL);
    messCardObjectURL = URL.createObjectURL(blob);
    document.getElementById('messCardThumb').src = messCardObjectURL;
    document.getElementById('messCardEmpty').classList.add('hidden');
    document.getElementById('messCardStored').classList.remove('hidden');
}

async function initMessCard() {
    try {
        const blob = await MessCardDB.get();
        blob ? showMessCardStored(blob) : showMessCardEmpty();
    } catch (e) {
        console.error('MessCard init error:', e);
        showMessCardEmpty();
    }
}

async function handleMessCardFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    try {
        await MessCardDB.save(file);
        showMessCardStored(file);
    } catch (e) {
        console.error('MessCard save error:', e);
    }
}

/* ---- Fullscreen ---- */
function openMessCardFullscreen() {
    const overlay = document.getElementById('messCardOverlay');
    document.getElementById('messCardFull').src = messCardObjectURL;
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Use native fullscreen API where available for best visibility
    try {
        if (overlay.requestFullscreen)              overlay.requestFullscreen();
        else if (overlay.webkitRequestFullscreen)   overlay.webkitRequestFullscreen();
    } catch (_) { /* unsupported — overlay still shows */ }
}

function closeMessCardFullscreen() {
    document.getElementById('messCardOverlay').classList.add('hidden');
    document.body.style.overflow = '';

    try {
        if (document.fullscreenElement && document.exitFullscreen)
            document.exitFullscreen();
        else if (document.webkitFullscreenElement && document.webkitExitFullscreen)
            document.webkitExitFullscreen();
    } catch (_) {}
}

/* ---- Attach event listeners (no onclick in HTML) ---- */

document.getElementById('messCardThumb').addEventListener('click', () => {
    document.getElementById('showCardBtn').click();
});
// File upload — new card
document.getElementById('messCardInput').addEventListener('change', e => {
    if (e.target.files[0]) handleMessCardFile(e.target.files[0]);
    e.target.value = ''; // reset so same file can be re-selected
});

// File upload — replace card
document.getElementById('messCardReplace').addEventListener('change', e => {
    if (e.target.files[0]) handleMessCardFile(e.target.files[0]);
    e.target.value = '';
});

// Show fullscreen
document.getElementById('showCardBtn').addEventListener('click', openMessCardFullscreen);

// Close — button
document.getElementById('overlayCloseBtn').addEventListener('click', e => {
    e.stopPropagation();
    closeMessCardFullscreen();
});

// Close — tap anywhere on overlay (image has pointer-events:none so taps pass through)
document.getElementById('messCardOverlay').addEventListener('click', closeMessCardFullscreen);

// Close — Escape key
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMessCardFullscreen();
});

// Delete card
document.getElementById('deleteCardBtn').addEventListener('click', async () => {
    await MessCardDB.remove();
    if (messCardObjectURL) {
        URL.revokeObjectURL(messCardObjectURL);
        messCardObjectURL = null;
    }
    showMessCardEmpty();
});

/* ---- Init ---- */
initMessCard();
fetchSheetData();
