// dp-topbar.js
// Usage: ensure firebase is initialized globally (firebase, firebase.auth(), firebase.firestore())
// Then include: <script type="module" src="/path/to/dp-topbar.js"></script>
// Use <dp-topbar></dp-topbar> anywhere in your pages.

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host { display:block; width:100%; font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial; }
    .bar {
      box-sizing: border-box;
      width:100%;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:16px;
      padding:10px 20px;
      border-bottom:1px solid rgba(0,0,0,0.06);
      position:relative;
      z-index:30;
      background:var(--topbar-bg, #1f1f1f);
      color:var(--topbar-text, #e9e9e9);
    }

    /* left (logo + nav) */
    .left { display:flex; align-items:center; gap:18px; }
    .brand { display:flex; align-items:center; gap:12px; cursor:pointer; color:inherit; text-decoration:none; }
    .brand img { width:36px; height:36px; border-radius:6px; object-fit:cover; border:1px solid rgba(0,0,0,0.06); }

    nav.nav { display:flex; gap:12px; align-items:center; }
    nav.nav a {
      color:inherit; text-decoration:none; font-weight:600; font-size:14px;
      padding:6px 8px; border-radius:6px;
    }
    nav.nav a:hover { background:var(--nav-hover, rgba(255,255,255,0.03)); }

    .hamburger {
  display: none;          /* desktop: hidden */
  color: white;

  width: 20px;
  height: 20px;

  background: transparent;
  border: none;
  border-radius: 0;

  padding: 0;
  margin: 0;

  box-shadow: none;
  outline: none;
  appearance: none;
  -webkit-appearance: none;

  align-items: center;
  justify-content: center;
  cursor: pointer;
}




    .mobile-menu {
      display:none;
      position:absolute;
      left:12px;
      top:calc(100% + 8px);
      background:var(--dropdown-bg,#262626);
      color:var(--dropdown-text,#e9e9e9);
      border-radius:10px;
      border:1px solid rgba(0,0,0,0.08);
      box-shadow:0 12px 30px rgba(2,6,23,0.5);
      padding:8px;
      flex-direction:column;
      gap:8px;
      z-index:45;
      min-width:160px;
    }
    .mobile-menu.show { display:flex; }

    .mobile-menu a { color:inherit; text-decoration:none; padding:8px; border-radius:8px; display:block; }

    /* right: balance + profile */
    .right { display:flex; align-items:center; gap:14px; }
    .balance {
      display:flex; align-items:center; justify-content:center; padding:6px 10px;
      border-radius:10px; font-weight:600; font-size:13px;
      background:var(--chip-bg, rgba(255,255,255,0.03));
      border:1px solid rgba(255,255,255,0.04);
      min-width:96px;
    }

    .profile { display:flex; align-items:center; gap:10px; cursor:pointer; position:relative; padding:6px; border-radius:8px; }
    .pfp { width:38px; background-repeat: no-repeat; /* <-- add this */
height:38px; border-radius:8px; background-size:cover; background-position:center; border:1px solid rgba(255,255,255,0.06); flex-shrink:0; }
    .pinfo { display:flex; flex-direction:column; line-height:1; min-width:120px; }
    .pinfo .name { font-weight:700; font-size:13px; display:flex; align-items:center; gap:6px; }
    .pinfo .small { font-size:12px; opacity:0.65; margin-top:2px; }
    .verified-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
  flex-shrink: 0;
}


    .dropdown {
      position:absolute; top:calc(100% + 8px); right:0; min-width:180px;
      border-radius:10px; background:var(--dropdown-bg,#262626); color:var(--dropdown-text,#e9e9e9);
      box-shadow:0 10px 30px rgba(0,0,0,0.12); border:1px solid rgba(0,0,0,0.06);
      padding:8px; display:none; flex-direction:column; gap:6px; z-index:40;
    }
    .dropdown.show { display:flex; }
    .dropdown a, .dropdown button { color:inherit; text-decoration:none; background:transparent; border:none; padding:8px; text-align:left; border-radius:8px; cursor:pointer; }
    .dropdown a:hover, .dropdown button:hover { background:var(--nav-hover, rgba(255,255,255,0.03)); }

    /* small screens */
    @media (max-width:800px) {
      nav.nav { display:none; } /* hide full nav on mobile */
      .hamburger { display:flex; }
      .pinfo { display:none; } /* keep profile compact */
      .balance { display:none; } /* hide balance on topbar, you can show in mobile menu if needed */
    }
  </style>

  <div class="bar" role="navigation" aria-label="Topbar">
    <div class="left">
      <a class="brand" id="brand"><img id="brand-logo" src="/org-owner.jpg" alt="Platform logo"></a>

      <nav class="nav" id="nav">
        <a href="/home" data-target="/home">Home</a>
        <a href="/profile" data-target="/profile">Profile</a>
        <a href="/search" data-target="/search">Search</a>
        <a href="/ugc/posts" data-target="/ugc/posts">Posts</a>
        <a href="/creator/dashboard" data-target="/creator/dashboard">Create</a>
      </nav>

      <button class="hamburger" id="hamburger" aria-label="Open menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      </button>

      <div class="mobile-menu" id="mobile-menu" role="menu" aria-hidden="true">
        <a href="/home" data-target="/home">Home</a>
        <a href="/profile" data-target="/profile">Profile</a>
        <a href="/search" data-target="/search">Search</a>
        <a href="/ugc/posts" data-target="/ugc/posts">Posts</a>
        <a href="/creator/dashboard" data-target="/creator/dashboard">Create</a>
      </div>
    </div>

    <div class="right">
      <div class="balance" id="coin-display">DF$ - 0</div>

      <div class="profile" id="profile-area" tabindex="0" aria-haspopup="true" aria-expanded="false">
        <div class="pfp" id="top-pfp" style="background-image: url('/org-owner.jpg')"></div>
        <div class="pinfo">
          <div class="name" id="top-name">Not signed in</div>
          <div class="small" id="top-email"></div>
        </div>

        <div class="dropdown" id="profile-dropdown" role="menu" aria-hidden="true">
          <a id="login-link" href="/login" style="display:none;">Login</a>
          <a id="edit-profile" href="/profile" style="display:none;">Edit Profile</a>
          <button id="logout-btn" style="display:none;">Logout</button>
        </div>
      </div>
    </div>
  </div>
`;

class DPTopbar extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._shadow.appendChild(template.content.cloneNode(true));
    this._authUnsub = null;
    this._currentUser = null;
    this._mobileMenuOpen = false;
  }

  connectedCallback() {
    this._setupElements();
    this._setupTheme();
    this._wireUI();
    this._waitForFirebaseAndInit();
  }

  disconnectedCallback() {
    if (this._authUnsub) this._authUnsub();
  }

  _setupElements() {
    const s = this._shadow;
    this.$coin = s.getElementById('coin-display');
    this.$pfp = s.getElementById('top-pfp');
    this.$name = s.getElementById('top-name');
    this.$email = s.getElementById('top-email');
    this.$dropdown = s.getElementById('profile-dropdown');
    this.$profileArea = s.getElementById('profile-area');
    this.$logout = s.getElementById('logout-btn');
    this.$edit = s.getElementById('edit-profile');
    this.$login = s.getElementById('login-link');
    this.$brand = s.getElementById('brand');
    this.$nav = s.getElementById('nav');
    this.$hamburger = s.getElementById('hamburger');
    this.$mobileMenu = s.getElementById('mobile-menu');
  }

  _wireUI() {
    // outside clicks inside shadow: handle profile dropdown and mobile menu
    this._shadow.addEventListener('click', e => {
      if (this.$profileArea.contains(e.target)) {
        this._toggleDropdown();
        this._closeMobileMenu();
        return;
      }
      if (this.$hamburger.contains(e.target)) {
        this._toggleMobileMenu();
        return;
      }
      // nav link clicks handled below
      // if click outside both dropdown and mobile menu -> hide both
      if (!this.$dropdown.contains(e.target)) this._hideDropdown();
      if (!this.$mobileMenu.contains(e.target) && !this.$hamburger.contains(e.target)) this._closeMobileMenu();
    });

    // keyboard accessible profileArea
    this.$profileArea.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._toggleDropdown(); }
      if (e.key === 'Escape') this._hideDropdown();
    });

    // nav links: internal navigation
    this._shadow.querySelectorAll('.nav a, .mobile-menu a').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const target = a.getAttribute('data-target') || a.getAttribute('href');
        if (target) window.location.href = target;
      });
    });

    // brand click
    this.$brand.addEventListener('click', e => { e.preventDefault(); window.location.href = '/home'; });

    // login/edit/logout wiring
    this.$login.addEventListener('click', e => { e.preventDefault(); window.location.href = '/login'; });
    this.$edit.addEventListener('click', e => { e.preventDefault(); window.location.href = '/profile'; });
    this.$logout.addEventListener('click', async () => {
      try {
        if (!window.firebase || !firebase.auth) { console.warn('Firebase not available'); return; }
        await firebase.auth().signOut();
        window.location.reload();
      } catch (err) { console.error(err); window.location.reload(); }
    });

    // close menus when window resized (to keep state sane)
    window.addEventListener('resize', () => { this._hideDropdown(); this._closeMobileMenu(); });
  }

  _toggleMobileMenu() {
    this._mobileMenuOpen = !this._mobileMenuOpen;
    if (this._mobileMenuOpen) {
      this.$mobileMenu.classList.add('show');
      this.$mobileMenu.setAttribute('aria-hidden','false');
    } else {
      this._closeMobileMenu();
    }
  }
  _closeMobileMenu() {
    this._mobileMenuOpen = false;
    this.$mobileMenu.classList.remove('show');
    this.$mobileMenu.setAttribute('aria-hidden','true');
  }

  _toggleDropdown() {
    const show = !this.$dropdown.classList.contains('show');
    if (show) {
      this.$dropdown.classList.add('show');
      this.$profileArea.setAttribute('aria-expanded','true');
      this.$dropdown.setAttribute('aria-hidden','false');
    } else this._hideDropdown();
  }
  _hideDropdown() {
    this.$dropdown.classList.remove('show');
    this.$profileArea.setAttribute('aria-expanded','false');
    this.$dropdown.setAttribute('aria-hidden','true');
  }

  _setupTheme() {
    const saved = localStorage.getItem('dp-theme') || (document.body.classList.contains('light') ? 'light' : 'dark');
    this._applyTheme(saved);
  }
  _cycleTheme() {
    const now = localStorage.getItem('dp-theme') === 'light' ? 'dark' : 'light';
    localStorage.setItem('dp-theme', now);
    this._applyTheme(now);
  }
  _applyTheme(name) {
    if (name === 'light') {
      document.body.classList.remove('dark'); document.body.classList.add('light');
      document.documentElement.style.setProperty('--topbar-bg', '#fff');
      document.documentElement.style.setProperty('--topbar-text', '#111');
      document.documentElement.style.setProperty('--chip-bg', 'rgba(0,0,0,0.04)');
      document.documentElement.style.setProperty('--dropdown-bg', '#fff');
      document.documentElement.style.setProperty('--dropdown-text', '#111');
      document.documentElement.style.setProperty('--nav-hover', 'rgba(0,0,0,0.04)');
    } else {
      document.body.classList.remove('light'); document.body.classList.add('dark');
      document.documentElement.style.setProperty('--topbar-bg', '#1f1f1f');
      document.documentElement.style.setProperty('--topbar-text', '#e9e9e9');
      document.documentElement.style.setProperty('--chip-bg', 'rgba(255,255,255,0.03)');
      document.documentElement.style.setProperty('--dropdown-bg', '#262626');
      document.documentElement.style.setProperty('--dropdown-text', '#e9e9e9');
      document.documentElement.style.setProperty('--nav-hover', 'rgba(255,255,255,0.03)');
    }
  }

  _waitForFirebaseAndInit() {
    const triesMax = 30; let tries = 0;
    const step = async () => {
      tries++;
      if (window.firebase && firebase.auth && firebase.firestore) this._initFirebase();
      else if (tries < triesMax) setTimeout(step, 150);
      else { console.warn('Firebase not detected. Topbar will show limited functionality.'); this._renderSignedOut(); }
    };
    step();
  }

  _initFirebase() {
  const auth = firebase.auth(); 
  const db = firebase.firestore();
  if (this._authUnsub) this._authUnsub();

  this._authUnsub = auth.onAuthStateChanged(async user => {
    this._currentUser = user;
    if (!user) { this._renderSignedOut(); return; }

    let isBanned = false;

    // banned check
    try {
      const banned = await db.collection('banned_users').doc(user.email).get();
      if (banned.exists) {
        isBanned = true;
        // show ? for banned users
        this.$coin.textContent = 'DF$ - ?';

        // only redirect if not already on /not-approved
        if (!window.location.pathname.startsWith('/not-approved')) {
          window.location.href = '/not-approved';
          return; // stop further execution since redirecting
        }
        // if already on /not-approved, just keep showing profile info
      }
    } catch (err) { console.warn('Failed checking banned_users', err); }

    // load user data regardless of banned status
    try {
      const snap = await db.collection('user_data').doc(user.email).get();
      const data = snap.exists ? snap.data() : {};
      const coins = Number(data.coins || 0);

      // only set coins if not banned
      if (!isBanned) this.$coin.textContent = `DF$ - ${this._compact(coins)}`;

      // profile info (always show)
      this.$pfp.style.backgroundImage = `url(${data.profile_picture || '/org-owner.jpg'})`;
      const display = data['display name'] || user.email;
      this.$name.textContent = display;
      this.$email.textContent = data.tagline || user.email.replace(/@.*/, '');

      // verified badge
      if (data.is_verified) {
        if (!this._verifiedIcon) {
          const img = document.createElement('img');
          img.src = '/assets/verified.png';
          img.alt = 'Verified';
          img.className = 'verified-icon';
          this.$name.appendChild(img);
          this._verifiedIcon = img;
        }
      } else if (this._verifiedIcon) {
        this._verifiedIcon.remove();
        this._verifiedIcon = null;
      }

      this._showSignedInDropdownOptions();
    } catch (err) {
      console.warn('Failed loading user_data', err);
      this._renderSignedInBasic(user);
    }
  });
}


  _showSignedInDropdownOptions() {
    if (this.$login) this.$login.style.display = 'none';
    if (this.$edit) this.$edit.style.display = '';
    if (this.$logout) this.$logout.style.display = '';
  }
  _showSignedOutDropdownOptions() {
    if (this.$login) this.$login.style.display = '';
    if (this.$edit) this.$edit.style.display = 'none';
    if (this.$logout) this.$logout.style.display = 'none';
  }

  _renderSignedOut() {
    this.$coin.textContent = `DF$ - 0`;
    this.$pfp.style.backgroundImage = `url('/org-owner.jpg')`;
    this.$name.textContent = 'Not signed in';
    this.$email.textContent = '';
    this._showSignedOutDropdownOptions();
  }

  _renderSignedInBasic(user) {
    this.$coin.textContent = `DF$ - 0`;
    this.$pfp.style.backgroundImage = `url('/org-owner.jpg')`;
    this.$name.textContent = user.email;
    this.$email.textContent = '';
    if (this.$logout) this.$logout.style.display = '';
    if (this.$edit) this.$edit.style.display = '';
    if (this.$login) this.$login.style.display = 'none';
  }

  _compact(n) {
    try { return Intl.NumberFormat('en', { notation: 'compact' }).format(n); }
    catch (e) { return String(n); }
  }
}

customElements.define('dp-topbar', DPTopbar);
