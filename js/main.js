/*======================================================
    main.js -Homepage Logic for index.html
    FoodZone project | js/main.js
========================================================  */

/* -- 1 AUTH STATE - show the correct navbar on page load -- */
  function checkAuthState() {
    const user =localStorage.getItem('fz_user');
    
    if (user) {
        // User is logged IN - show the user navbar and hide login/order buttons
        document.getElementById('nav-logged-out').style.display = 'none';
        document.getElementById('nav-logged-in').style.display = 'flex';

        //First letter as avatar e.g. "Kushal" -> "K"
        document.getElementById('nav-avatar').textContent = user.charAt(0).toUpperCase();
        document.getElementById('nav-username').textContent = 'Hey,  ' + user + '!';
    } else {
        // User is Logged OUT -show login/order buttons and hide user navbar
        document.getElementById('nav-Logged-out').style.display = 'flex';
        document.getElementById('nav-Logged-in').style.display = 'none';
    }
  }

/* -- 2. LOGOUT FUNCTIONALITY -- */
function logout() {
    localStorage.removeItem('fz_user');
    checkAuthState(); // instantly update navbar, no page reload needed
}

/* --3. CART STATE --*/
let cartCount = 0;

function updateCartCount() {
    document.querySelector('.cart-count').textContent = cartCount;
}

/*-- 4. ADD TO CART - requires login --*/
function handleAddToCart() {
    const user = localStorage.getItem('fz_user');

    if (!user) {
        // Not Logged IN -> redirect to login page
        window.location.href = 'auth.html';
        return;
    }
    
    // User is logged IN -> add item to cart
    cartCount++;
    updateCartCount();

    const itemName = btn.closet('.card').querySelector('h3').textContent;
    showToast('🛒' + itemName + ' added to cart!');
}

/* -- 5. ORDER NOW (hero button) - requires login -- */
function handleOrderNow() {
    const user = localStorage.getItem('fz_user');

    if (!user) {
        // Not Logged IN -> redirect to login page
        window.location.href = 'auth.html';
        return;
    }
    
    // User is logged IN -> scroll to menu section
    scrollToMenu();
}

/* -- 6. SCROLL TO MENU SECTION -- */
function scrollToMenu() {
    document.getElementById('menu-section').scrollIntoView({ behavior: 'smooth' });
}

/* -- 7. TOAST NOTIFICATION -- */
let toastTimer;

function showToast(message) {
    const toast = document.getElementById('fz-toast');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'fz-toast';
        toast.style.cssText = `
        position: fixed;
        bottom: 28px;
        right: 28px;
        background: #1a1a1a;
        color: #fff;
        padding: 12px 20px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 500;
        font-family: 'Poppins', sans-serif;
        box-shadow: 0 6px 20px rgba(0,0,0,0.25);
        opacity: 0;
        transform: translateY(12px);
        transition: opacity 0.3s ease, transform 0.3s ease;
        pointer-events: none;
        z-index: 9999;
        `;
        document.body.appendChild(toast);
    }

    toast.textContent = message;

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(12px)';
    }, 2500);
}

/* --RUN ON PAGE LOAD -- */
checkAuthState();