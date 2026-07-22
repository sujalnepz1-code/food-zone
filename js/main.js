/* ============================================================
   main.js  —  Homepage Logic
   FoodZone | js/main.js

   In index.html your script tag must be:
   <script src="js/main.js"></script>
   NOT type="module"
============================================================ */


/* ── GET CURRENT USER ──────────────────────────────────────
   Reads the logged-in user from localStorage.
   Returns { name, email } if logged in, or null if not.
   The try/catch handles corrupted data gracefully.
─────────────────────────────────────────────────────────── */
function getCurrentUser() {
  try {
    var stored = localStorage.getItem('fz_user');
    if (!stored) return null;

    var user = JSON.parse(stored);

    /* Handle old format — some older code stored just a plain string */
    if (typeof user === 'string') {
      return { name: user, email: '' };
    }

    return user;
  } catch (e) {
    /* If data is corrupted, clear it and treat as logged out */
    localStorage.removeItem('fz_user');
    return null;
  }
}


/* ── CART ── */
var cartCount = 0;


/* ── CHECK AUTH STATE ──────────────────────────────────────
   Runs on every page load.
   Reads localStorage, then shows the correct navbar state.
   3 states possible:
   1. nav-logged-out → show Login + Order Now buttons
   2. nav-logged-in  → show avatar + name + Logout button
─────────────────────────────────────────────────────────── */
function checkAuthState() {
  var user        = getCurrentUser();
  var loggedOut   = document.getElementById('nav-logged-out');
  var loggedIn    = document.getElementById('nav-logged-in');
  var avatar      = document.getElementById('nav-avatar');
  var userName    = document.getElementById('nav-user-name');

  if (!loggedOut || !loggedIn) return; /* safety check */

  if (user) {
    /* User is logged in */
    loggedOut.style.display = 'none';
    loggedIn.style.display  = 'flex';
    avatar.textContent      = user.name.charAt(0).toUpperCase();
    userName.textContent    = 'Hey, ' + user.name + '!';
  } else {
    /* User is logged out */
    loggedOut.style.display = 'flex';
    loggedIn.style.display  = 'none';
  }
}


/* ── LOGOUT ─────────────────────────────────────────────────
   Removes fz_user from localStorage.
   Resets cart.
   Calls checkAuthState() to update navbar instantly.
─────────────────────────────────────────────────────────── */
function logout() {
  localStorage.removeItem('fz_user');
  cartCount = 0;
  var countEl = document.querySelector('.cart-count');
  if (countEl) countEl.textContent = '0';
  checkAuthState();
  showToast('👋 Logged out. See you soon!');
}


/* ── ADD TO CART ────────────────────────────────────────────
   If not logged in → redirect to auth page.
   If logged in → add to cart + show toast.
─────────────────────────────────────────────────────────── */
function handleAddToCart(btn) {
  if (!getCurrentUser()) {
    window.location.href = 'auth.html';
    return;
  }

  cartCount++;
  var countEl = document.querySelector('.cart-count');
  if (countEl) countEl.textContent = cartCount;

  var itemName = btn.closest('.card').querySelector('h3').textContent;
  showToast('🛒 ' + itemName + ' added to cart!');
}


/* ── ORDER NOW (hero button) ────────────────────────────────
   If not logged in → redirect to login.
   If logged in → scroll to menu section.
─────────────────────────────────────────────────────────── */
function handleOrderNow() {
  if (!getCurrentUser()) {
    window.location.href = 'auth.html';
    return;
  }
  scrollToMenu();
}


/* ── SCROLL TO MENU ── */
function scrollToMenu() {
  var menuSection = document.getElementById('menu-section');
  if (menuSection) {
    menuSection.scrollIntoView({ behavior: 'smooth' });
  }
}


/* ── TOAST NOTIFICATION ── */
var toastTimer;
function showToast(message) {
  var toast = document.getElementById('fz-toast');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'fz-toast';
    toast.style.cssText = [
      'position:fixed',
      'bottom:28px',
      'right:28px',
      'background:#1a1a1a',
      'color:#fff',
      'padding:12px 20px',
      'border-radius:10px',
      'font-size:14px',
      'font-weight:500',
      'font-family:Poppins,sans-serif',
      'box-shadow:0 6px 20px rgba(0,0,0,0.25)',
      'opacity:0',
      'transform:translateY(12px)',
      'transition:opacity 0.3s ease,transform 0.3s ease',
      'pointer-events:none',
      'z-index:9999'
    ].join(';');
    document.body.appendChild(toast);
  }

  toast.textContent = message;

  /* Force reflow so transition plays */
  toast.getBoundingClientRect();
  toast.style.opacity   = '1';
  toast.style.transform = 'translateY(0)';

  clearTimeout(toastTimer);
  toastTimer = setTimeout(function() {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateY(12px)';
  }, 2500);
}


/* ── RUN ON PAGE LOAD ── */
checkAuthState();