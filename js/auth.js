/* ============================================================
   auth.js  —  Login & Signup Logic
   FoodZone | js/auth.js

   NO Firebase needed. Uses localStorage as a mini-database.
   This works 100% in the browser right now.

   In auth.html your script tag must be:
   <script src="js/auth.js"></script>
   NOT type="module" — that was the bug causing everything to break.
============================================================ */


/* ── MINI DATABASE (localStorage) ────────────────────────────
   We store ALL user accounts under one key: 'fz_accounts'
   Structure looks like this:
   {
     "rahul@gmail.com": { name: "Rahul", password: "mypass123" },
     "priya@gmail.com": { name: "Priya", password: "abc12345"  }
   }

   Current logged-in user stored under: 'fz_user'
   { name: "Rahul", email: "rahul@gmail.com" }

   WHY: We need to actually CHECK if an email exists and if the
   password matches. The old code just validated format —
   any email/password passed. Now it checks for real.
─────────────────────────────────────────────────────────── */

function getAccounts() {
  try {
    return JSON.parse(localStorage.getItem('fz_accounts') || '{}');
  } catch (e) {
    return {};
  }
}

function findAccount(email) {
  // Always compare emails in lowercase so Gmail and GMAIL match
  return getAccounts()[email.toLowerCase()] || null;
}

function saveAccount(name, email, password) {
  const accounts   = getAccounts();
  accounts[email.toLowerCase()] = { name: name, password: password };
  localStorage.setItem('fz_accounts', JSON.stringify(accounts));
}

function setCurrentUser(name, email) {
  localStorage.setItem('fz_user', JSON.stringify({ name: name, email: email.toLowerCase() }));
}


/* ── TAB SWITCH (Login ↔ Sign Up) ── */
function switchTab(tab) {
  document.getElementById('panel-login').classList.toggle('active',  tab === 'login');
  document.getElementById('panel-signup').classList.toggle('active', tab === 'signup');
  document.getElementById('tab-login').classList.toggle('active',    tab === 'login');
  document.getElementById('tab-signup').classList.toggle('active',   tab === 'signup');
  clearErrors();
}


/* ── HELPERS ── */
function setError(inputId, errId, message) {
  var input = document.getElementById(inputId);
  var err   = document.getElementById(errId);
  if (input) input.classList.add('error-input');
  if (err)   { err.textContent = message; err.classList.add('show'); }
}

function clearErrors() {
  document.querySelectorAll('.error-input').forEach(function(el) { el.classList.remove('error-input'); });
  document.querySelectorAll('.error-msg').forEach(function(el)   { el.classList.remove('show'); });
  document.querySelectorAll('.success-banner').forEach(function(el) { el.classList.remove('show'); });
}

function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

function togglePw(inputId, btn) {
  var input   = document.getElementById(inputId);
  var isHide  = input.type === 'password';
  input.type  = isHide ? 'text' : 'password';
  btn.textContent = isHide ? '🙈' : '👁️';
}


/* ── LOGIN ──────────────────────────────────────────────────
   3 checks in order:
   1. Is the format valid? (quick, no DB lookup)
   2. Does this email exist in our accounts?
   3. Does the password match?
   Only if ALL 3 pass → log them in.
─────────────────────────────────────────────────────────── */
function handleLogin() {
  clearErrors();

  var email    = document.getElementById('login-email').value.trim();
  var password = document.getElementById('login-pw').value;
  var valid    = true;

  /* Check 1 — format */
  if (!isValidEmail(email)) {
    setError('login-email', 'login-email-err', 'Please enter a valid email address.');
    valid = false;
  }
  if (password.length < 1) {
    setError('login-pw', 'login-pw-err', 'Please enter your password.');
    valid = false;
  }
  if (!valid) return;

  /* Check 2 — account exists? */
  var account = findAccount(email);
  if (!account) {
    setError('login-email', 'login-email-err', 'No account found with this email. Please sign up first.');
    return;
  }

  /* Check 3 — password matches? */
  if (account.password !== password) {
    setError('login-pw', 'login-pw-err', 'Incorrect password. Please try again.');
    return;
  }

  /* All checks passed — log in */
  setCurrentUser(account.name, email);

  var banner = document.getElementById('login-success');
  banner.textContent = '✅ Welcome back, ' + account.name + '! Redirecting…';
  banner.classList.add('show');

  setTimeout(function() {
    window.location.href = 'index.html';
  }, 1500);
}


/* ── SIGNUP ─────────────────────────────────────────────────
   4 checks in order:
   1. Name valid?
   2. Email format valid?
   3. Password long enough?
   4. Passwords match?
   Then check: is this email already registered?
   If all good → save account → show success → switch to login tab.
─────────────────────────────────────────────────────────── */
function handleSignup() {
  clearErrors();

  var name     = document.getElementById('signup-name').value.trim();
  var email    = document.getElementById('signup-email').value.trim();
  var password = document.getElementById('signup-pw').value;
  var confirm  = document.getElementById('signup-confirm').value;
  var valid    = true;

  if (name.length < 2) {
    setError('signup-name', 'signup-name-err', 'Name must be at least 2 characters.');
    valid = false;
  }
  if (!isValidEmail(email)) {
    setError('signup-email', 'signup-email-err', 'Please enter a valid email address.');
    valid = false;
  }
  if (password.length < 6) {
    setError('signup-pw', 'signup-pw-err', 'Password must be at least 6 characters.');
    valid = false;
  }
  if (password !== confirm) {
    setError('signup-confirm', 'signup-confirm-err', 'Passwords do not match.');
    valid = false;
  }
  if (!valid) return;

  /* Check if email already taken */
  if (findAccount(email)) {
    setError('signup-email', 'signup-email-err', 'This email is already registered. Please login instead.');
    return;
  }

  /* Save to our localStorage database */
  saveAccount(name, email, password);

  /* Show success banner — FIX: set text BEFORE adding show class */
  var banner = document.getElementById('signup-success');
  banner.textContent = '✅ Account created, ' + name + '! Please login with your details below.';
  banner.classList.add('show');

  /* Switch to login tab after 2 seconds and pre-fill the email */
  setTimeout(function() {
    switchTab('login');
    /* Pre-fill email so user doesn't have to type it again */
    var loginEmail = document.getElementById('login-email');
    if (loginEmail) loginEmail.value = email;
  }, 2000);
}


/* ── ENTER KEY submits the active form ── */
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Enter') return;
  var loginActive = document.getElementById('panel-login').classList.contains('active');
  if (loginActive) {
    handleLogin();
  } else {
    handleSignup();
  }
});