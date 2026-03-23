// dp-topbar.js (updated)
// Usage: ensure firebase is initialized globally (firebase, firebase.auth(), firebase.firestore())
// Then include in your HTML: <script src="/path/to/dp-topbar.js"></script>
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
      display: none;
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
      position:relative;
      cursor:pointer;
    }

    .profile { display:flex; align-items:center; gap:10px; cursor:pointer; position:relative; padding:6px; border-radius:8px; }
    .pfp { width:38px; background-repeat: no-repeat; height:38px; border-radius:8px; background-size:cover; background-position:center; border:1px solid rgba(255,255,255,0.06); flex-shrink:0; }
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
      position:absolute; top:calc(100% + 8px); right:0; min-width:220px;
      border-radius:10px; background:var(--dropdown-bg,#262626); color:var(--dropdown-text,#e9e9e9);
      box-shadow:0 10px 30px rgba(0,0,0,0.12); border:1px solid rgba(0,0,0,0.06);
      padding:8px; display:none; flex-direction:column; gap:6px; z-index:40;
    }
    .dropdown.show { display:flex; }
    .dropdown a, .dropdown button { color:inherit; text-decoration:none; background:transparent; border:none; padding:8px; text-align:left; border-radius:8px; cursor:pointer; }
    .dropdown a:hover, .dropdown button:hover { background:var(--nav-hover, rgba(255,255,255,0.03)); }

    .dropdown a.disabled, .dropdown button.disabled { opacity:0.6; cursor:not-allowed; pointer-events:none; }

    /* small screens */
    @media (max-width:800px) {
      nav.nav { display:none; }
      .hamburger { display:flex; }
      .pinfo { display:none; }
      .balance { display:none; }
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
        <a href="/chats" data-target="/chat">Chats</a>
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
        <a href="/chats" data-target="/chat">Chats</a>
      </div>
    </div>

    <div class="right">
      <div class="balance" id="coin-display" tabindex="0" aria-haspopup="true" aria-expanded="false">DF$ - 0
        <div class="dropdown" id="coin-dropdown" role="menu" aria-hidden="true" style="right:auto; left:0; min-width:220px;">
          <a id="redeem-link" href="/redeem">Redeem DarkPurpleOF's Website codes</a>
          <a id="trans-link" href="/transactions" class="disabled">My transactions (Coming Soon)</a>
        </div>
      </div>

      <div class="profile" id="profile-area" tabindex="0" aria-haspopup="true" aria-expanded="false">
        <div class="pfp" id="top-pfp" style="background-image: url('/org-owner.jpg')"></div>
        <div class="pinfo">
          <div class="name" id="top-name">Not signed in</div>
          <div class="small" id="top-email"></div>
        </div>

        <div class="dropdown" id="profile-dropdown" role="menu" aria-hidden="true">
          <a id="login-link" href="/login" style="display:none;">Login</a>

          <a id="settings-link" href="/my/account" class="disabled">Settings (Coming Soon)</a>
          <a id="support-link" href="/support-feedback" class="disabled">Support (Coming Soon)</a>
          <a id="manage-blocked" href="/manageblockedusers">Manage Blocked Users</a>
          <a id="beta-link" href="/creator/beta-features">Beta Program</a>

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
    this._verifiedIcon = null;
    this._pageLocked = false;
    this._globalGatePromise = null;
    this._globalGatesChecked = false;
    this._bodyOriginalOverflow = '';
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
    this.$coinDropdown = s.getElementById('coin-dropdown');
    this.$redeem = s.getElementById('redeem-link');
    this.$trans = s.getElementById('trans-link');
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

    this.$settings = s.getElementById('settings-link');
    this.$support = s.getElementById('support-link');
    this.$manageBlocked = s.getElementById('manage-blocked');
    this.$beta = s.getElementById('beta-link');
  }

  _wireUI() {
    this._shadow.addEventListener('click', e => {
      if (this._pageLocked) return;

      if (this.$coin.contains(e.target)) {
        if (!this._currentUser) { window.location.href = '/login'; return; }
        this._toggleCoinDropdown();
        this._hideDropdown();
        return;
      }

      if (this.$profileArea.contains(e.target)) {
        this._toggleDropdown();
        this._closeMobileMenu();
        this._hideCoinDropdown();
        return;
      }

      if (this.$hamburger.contains(e.target)) {
        this._toggleMobileMenu();
        return;
      }

      if (!this.$dropdown.contains(e.target)) this._hideDropdown();
      if (!this.$mobileMenu.contains(e.target) && !this.$hamburger.contains(e.target)) this._closeMobileMenu();
      if (!this.$coinDropdown.contains(e.target)) this._hideCoinDropdown();
    });

    this.$profileArea.addEventListener('keydown', e => {
      if (this._pageLocked) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._toggleDropdown(); }
      if (e.key === 'Escape') this._hideDropdown();
    });

    this.$coin.addEventListener('keydown', e => {
      if (this._pageLocked) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!this._currentUser) { window.location.href = '/login'; return; }
        this._toggleCoinDropdown();
      }
      if (e.key === 'Escape') this._hideCoinDropdown();
    });

    this._shadow.querySelectorAll('.nav a, .mobile-menu a').forEach(a => {
      a.addEventListener('click', e => {
        if (this._pageLocked) return;
        e.preventDefault();
        const target = a.getAttribute('data-target') || a.getAttribute('href');
        if (target) window.location.href = target;
      });
    });

    this.$brand.addEventListener('click', e => {
      if (this._pageLocked) return;
      e.preventDefault();
      window.location.href = '/home';
    });

    this.$login.addEventListener('click', e => {
      if (this._pageLocked) return;
      e.preventDefault();
      window.location.href = '/login';
    });

    this.$edit.addEventListener('click', e => {
      if (this._pageLocked) return;
      e.preventDefault();
      window.location.href = '/profile';
    });

    this.$logout.addEventListener('click', async () => {
      if (this._pageLocked) return;
      try {
        if (!window.firebase || !firebase.auth) { console.warn('Firebase not available'); return; }
        await firebase.auth().signOut();
        window.location.reload();
      } catch (err) {
        console.error(err);
        window.location.reload();
      }
    });

    if (this.$redeem) this.$redeem.addEventListener('click', e => { if (this._pageLocked) e.preventDefault(); });
    if (this.$trans) this.$trans.addEventListener('click', e => { e.preventDefault(); });

    if (this.$settings) this.$settings.addEventListener('click', e => { e.preventDefault(); });
    if (this.$support) this.$support.addEventListener('click', e => { e.preventDefault(); });

    if (this.$manageBlocked) this.$manageBlocked.addEventListener('click', e => {
      if (this._pageLocked) return;
      e.preventDefault();
      window.location.href = '/manageblockedusers';
    });

    if (this.$beta) this.$beta.addEventListener('click', e => {
      if (this._pageLocked) return;
      e.preventDefault();
      window.location.href = '/creator/beta-features';
    });

    window.addEventListener('resize', () => {
      this._hideDropdown();
      this._closeMobileMenu();
      this._hideCoinDropdown();
    });

    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this._hideDropdown();
        this._hideCoinDropdown();
      }
    });
  }

  _toggleMobileMenu() {
    if (this._pageLocked) return;
    this._mobileMenuOpen = !this._mobileMenuOpen;
    if (this._mobileMenuOpen) {
      this.$mobileMenu.classList.add('show');
      this.$mobileMenu.setAttribute('aria-hidden', 'false');
    } else {
      this._closeMobileMenu();
    }
  }

  _closeMobileMenu() {
    this._mobileMenuOpen = false;
    this.$mobileMenu.classList.remove('show');
    this.$mobileMenu.setAttribute('aria-hidden', 'true');
  }

  _toggleDropdown() {
    if (this._pageLocked) return;
    const show = !this.$dropdown.classList.contains('show');
    if (show) {
      this.$dropdown.classList.add('show');
      this.$profileArea.setAttribute('aria-expanded', 'true');
      this.$dropdown.setAttribute('aria-hidden', 'false');
      this._hideCoinDropdown();
    } else {
      this._hideDropdown();
    }
  }

  _hideDropdown() {
    this.$dropdown.classList.remove('show');
    this.$profileArea.setAttribute('aria-expanded', 'false');
    this.$dropdown.setAttribute('aria-hidden', 'true');
  }

  _toggleCoinDropdown() {
    if (this._pageLocked) return;
    const show = !this.$coinDropdown.classList.contains('show');
    if (show) {
      this.$coinDropdown.classList.add('show');
      this.$coin.setAttribute('aria-expanded', 'true');
      this.$coinDropdown.setAttribute('aria-hidden', 'false');
      this._hideDropdown();
    } else {
      this._hideCoinDropdown();
    }
  }

  _hideCoinDropdown() {
    if (!this.$coinDropdown) return;
    this.$coinDropdown.classList.remove('show');
    this.$coin.setAttribute('aria-expanded', 'false');
    this.$coinDropdown.setAttribute('aria-hidden', 'true');
  }

  _setupTheme() {
    const saved = localStorage.getItem('dp-theme') || (document.body.classList.contains('light') ? 'light' : 'dark');
    this._applyTheme(saved);
  }

  _applyTheme(name) {
    if (name === 'light') {
      document.body.classList.remove('dark');
      document.body.classList.add('light');
      document.documentElement.style.setProperty('--topbar-bg', '#fff');
      document.documentElement.style.setProperty('--topbar-text', '#111');
      document.documentElement.style.setProperty('--chip-bg', 'rgba(0,0,0,0.04)');
      document.documentElement.style.setProperty('--dropdown-bg', '#fff');
      document.documentElement.style.setProperty('--dropdown-text', '#111');
      document.documentElement.style.setProperty('--nav-hover', 'rgba(0,0,0,0.04)');
    } else {
      document.body.classList.remove('light');
      document.body.classList.add('dark');
      document.documentElement.style.setProperty('--topbar-bg', '#1f1f1f');
      document.documentElement.style.setProperty('--topbar-text', '#e9e9e9');
      document.documentElement.style.setProperty('--chip-bg', 'rgba(255,255,255,0.03)');
      document.documentElement.style.setProperty('--dropdown-bg', '#262626');
      document.documentElement.style.setProperty('--dropdown-text', '#e9e9e9');
      document.documentElement.style.setProperty('--nav-hover', 'rgba(255,255,255,0.03)');
    }
  }

  _waitForFirebaseAndInit() {
    const triesMax = 30;
    let tries = 0;

    const step = async () => {
      if (this._pageLocked) return;
      tries++;

      if (window.firebase && firebase.auth && firebase.firestore) {
        try {
          await this._initFirebase();
        } catch (err) {
          console.error('Firebase init failed:', err);
          this._renderSignedOut();
        }
      } else if (tries < triesMax) {
        setTimeout(step, 150);
      } else {
        console.warn('Firebase not detected. Topbar will show limited functionality.');
        this._renderSignedOut();
      }
    };

    step();
  }

  async _initFirebase() {
    const auth = firebase.auth();
    const db = firebase.firestore();

    if (this._authUnsub) this._authUnsub();

    const blocked = await this._runGlobalAccessChecks(db);
    if (blocked) return;

    this._authUnsub = auth.onAuthStateChanged(async user => {
      if (this._pageLocked) return;

      this._currentUser = user;

      if (!user) {
        this._renderSignedOut();
        return;
      }

      try {
        const termsAccepted = await this._ensureTermsAccepted(user, db);
        if (!termsAccepted) return;

        let isBanned = false;

        try {
          const banned = await db.collection('banned_users').doc(user.email).get();
          if (banned.exists) {
            isBanned = true;
            this.$coin.textContent = 'DF$ - ?';

            if (!window.location.pathname.startsWith('/not-approved')) {
              await this._takeoverWithHTML('/not-approved');
              return;
            }
          }
        } catch (err) {
          console.warn('Failed checking banned_users', err);
        }

        try {
          const snap = await db.collection('user_data').doc(user.email).get();
          const data = snap.exists ? snap.data() : {};
          const coins = Number(data.coins || 0);

          if (!isBanned) this.$coin.textContent = `DF$ - ${this._compact(coins)}`;

          this.$pfp.style.backgroundImage = `url(${data.profile_picture || '/org-owner.jpg'})`;
          const display = data['display name'] || user.email;
          this.$name.textContent = display;
          this.$email.textContent = data.tagline || user.email.replace(/@.*/, '');

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
      } catch (err) {
        console.warn('Auth handling failed:', err);
        this._renderSignedOut();
      }
    });
  }

  async _runGlobalAccessChecks(db) {
    if (this._globalGatesChecked && this._globalGatePromise) {
      const result = await this._globalGatePromise;
      if (result.locked) {
        await this._takeoverWithHTML(result.path);
        return true;
      }
      return false;
    }

    this._globalGatesChecked = true;
    this._globalGatePromise = this._evaluateGlobalGates(db);
    const result = await this._globalGatePromise;

    if (result.locked) {
      await this._takeoverWithHTML(result.path);
      return true;
    }

    return false;
  }

  async _evaluateGlobalGates(db) {
  try {
    const [ipInfo, generalSnap] = await Promise.all([
      this._fetchIpInfo(),
      db.doc('server_global_data/general').get()
    ]);

    const generalData = generalSnap.exists ? generalSnap.data() || {} : {};

    if (this._isTrue(generalData.maintenance)) {
      return { locked: true, path: '/extras/503.html' };
    }

    // Support both field names:
    // - banned_countries
    // - bannedCountries
    const rawBannedCountries =
      Array.isArray(generalData.banned_countries) ? generalData.banned_countries :
      Array.isArray(generalData.bannedCountries) ? generalData.bannedCountries :
      [];

    const bannedCountries = rawBannedCountries
      .map(v => String(v || '').trim().toUpperCase())
      .filter(Boolean);

    const country = String(ipInfo?.country || '').trim().toUpperCase();
    if (country && bannedCountries.includes(country)) {
      return { locked: true, path: '/extras/451.html' };
    }

    const ip = String(ipInfo?.ip || '').trim();
    if (ip) {
      const ipDoc = await db.collection('banned_ips').doc(ip).get();
      if (ipDoc.exists) {
        return { locked: true, path: '/extras/403.html' };
      }

      const altQuery = await db.collection('banned_ips').where('ip', '==', ip).limit(1).get();
      if (!altQuery.empty) {
        return { locked: true, path: '/extras/403.html' };
      }
    }
  } catch (err) {
    console.warn('Global gate evaluation failed, allowing page to continue:', err);
  }

  return { locked: false, path: null };
}

  async _fetchIpInfo() {
    try {
      const res = await fetch('https://ipinfo.io/json', {
        method: 'GET',
        cache: 'no-store',
        credentials: 'omit',
        mode: 'cors'
      });

      if (!res.ok) throw new Error(`ipinfo status ${res.status}`);

      const data = await res.json();
      return {
        ip: data?.ip || '',
        country: data?.country || ''
      };
    } catch (err) {
      console.warn('IP info fetch failed:', err);
      return { ip: '', country: '' };
    }
  }

  async _ensureTermsAccepted(user, db) {
    if (!user || !user.email) return true;

    try {
      const generalSnap = await db.doc('server_global_data/general').get();
      const generalData = generalSnap.exists ? generalSnap.data() || {} : {};
      const serverTerms = generalData.TermsUpdated;

      if (!this._isFirestoreTimestamp(serverTerms)) {
        return true;
      }

      const userSnap = await db.collection('user_data').doc(user.email).get();
      const userData = userSnap.exists ? userSnap.data() || {} : {};
      const lastAgreed = userData.terms_service_lastagreed;

      const needsDialog =
        !this._isFirestoreTimestamp(lastAgreed) ||
        this._timestampToMillis(serverTerms) > this._timestampToMillis(lastAgreed);

      if (!needsDialog) return true;

      const accepted = await this._showTermsDialog();
      if (!accepted) {
        await this._takeoverWithHTML('/extras/403.html');
        return false;
      }

      await db.collection('user_data').doc(user.email).set({
        terms_service_lastagreed: firebase.firestore.Timestamp.now()
      }, { merge: true });

      return true;
    } catch (err) {
      console.warn('Terms check failed:', err);
      return true;
    }
  }

  _showTermsDialog() {
    return new Promise(resolve => {
      if (this._pageLocked) {
        resolve(false);
        return;
      }

      const existing = document.getElementById('dp-terms-overlay');
      if (existing) existing.remove();

      const overlay = document.createElement('div');
      overlay.id = 'dp-terms-overlay';
      overlay.innerHTML = `
        <style>
          #dp-terms-overlay {
            position: fixed;
            inset: 0;
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.72);
            backdrop-filter: blur(8px);
            padding: 20px;
            box-sizing: border-box;
            font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial;
          }
          #dp-terms-overlay .card {
            width: min(720px, 100%);
            max-height: min(80vh, 720px);
            overflow: auto;
            background: var(--terms-bg, #141414);
            color: var(--terms-text, #f2f2f2);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 20px;
            box-shadow: 0 20px 80px rgba(0,0,0,0.45);
            padding: 24px;
            box-sizing: border-box;
          }
          #dp-terms-overlay h2 {
            margin: 0 0 12px 0;
            font-size: 22px;
            line-height: 1.2;
          }
          #dp-terms-overlay p {
            margin: 0 0 12px 0;
            line-height: 1.6;
            opacity: 0.95;
          }
          #dp-terms-overlay .actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 20px;
            flex-wrap: wrap;
          }
          #dp-terms-overlay button {
            border: none;
            border-radius: 12px;
            padding: 12px 16px;
            font: inherit;
            font-weight: 700;
            cursor: pointer;
          }
          #dp-terms-overlay .accept {
            background: #4f7cff;
            color: white;
          }
          #dp-terms-overlay .decline {
            background: rgba(255,255,255,0.08);
            color: inherit;
          }
        </style>
        <div class="card" role="dialog" aria-modal="true" aria-labelledby="dp-terms-title">
          <h2 id="dp-terms-title">Updated Terms of Service</h2>
          <p>The Terms of Service have changed. You need to accept the latest version to keep using the site.</p>
          <p>By accepting, you confirm that you agree to the current terms and can continue.</p>
          <div class="actions">
            <button class="decline" id="dp-terms-decline">Decline</button>
            <button class="accept" id="dp-terms-accept">Accept</button>
          </div>
        </div>
      `;

      const cleanup = () => {
        const node = document.getElementById('dp-terms-overlay');
        if (node) node.remove();
      };

      const declineBtn = overlay.querySelector('#dp-terms-decline');
      const acceptBtn = overlay.querySelector('#dp-terms-accept');

      declineBtn.addEventListener('click', async () => {
        cleanup();
        resolve(false);
      });

      acceptBtn.addEventListener('click', async () => {
        cleanup();
        resolve(true);
      });

      overlay.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          cleanup();
          resolve(false);
        }
      });

      document.body.appendChild(overlay);
      acceptBtn.focus();
    });
  }

  async _takeoverWithHTML(path) {
    if (this._pageLocked) return;
    this._pageLocked = true;

    try {
      if (this._authUnsub) {
        try { this._authUnsub(); } catch (_) {}
        this._authUnsub = null;
      }

      const res = await fetch(path, {
        cache: 'no-store',
        credentials: 'same-origin'
      });

      const html = await res.text();
      const parsed = new DOMParser().parseFromString(html, 'text/html');

      if (parsed && parsed.documentElement && parsed.documentElement.innerHTML) {
        document.documentElement.innerHTML = parsed.documentElement.innerHTML;
        if (parsed.title) document.title = parsed.title;
      } else {
        document.body.innerHTML = html;
      }
    } catch (err) {
      console.error('Failed loading takeover page:', err);
      document.documentElement.innerHTML = `
        <head>
          <title>Access blocked</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            html,body{margin:0;min-height:100%;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial;background:#111;color:#eee}
            .wrap{min-height:100vh;display:grid;place-items:center;padding:24px;box-sizing:border-box;text-align:center}
            .card{max-width:560px;padding:28px;border:1px solid rgba(255,255,255,.08);border-radius:20px;background:rgba(255,255,255,.04)}
            h1{margin:0 0 10px;font-size:32px}
            p{margin:0;opacity:.85;line-height:1.6}
          </style>
        </head>
        <body>
          <div class="wrap">
            <div class="card">
              <h1>Access blocked</h1>
              <p>The requested page could not be loaded.</p>
            </div>
          </div>
        </body>
      `;
    }
  }

  _showSignedInDropdownOptions() {
    if (this.$login) this.$login.style.display = 'none';
    if (this.$edit) this.$edit.style.display = '';
    if (this.$logout) this.$logout.style.display = '';

    if (this.$redeem) this.$redeem.style.display = '';
    if (this.$trans) this.$trans.classList.add('disabled');

    if (this.$settings) this.$settings.classList.add('disabled');
    if (this.$support) this.$support.classList.add('disabled');
  }

  _showSignedOutDropdownOptions() {
    if (this.$login) this.$login.style.display = '';
    if (this.$edit) this.$edit.style.display = 'none';
    if (this.$logout) this.$logout.style.display = 'none';

    if (this.$redeem) this.$redeem.style.display = 'none';
  }

  _renderSignedOut() {
    if (this._pageLocked) return;
    this.$coin.textContent = `DF$ - 0`;
    this.$pfp.style.backgroundImage = `url('/org-owner.jpg')`;
    this.$name.textContent = 'Not signed in';
    this.$email.textContent = '';
    this._showSignedOutDropdownOptions();
  }

  _renderSignedInBasic(user) {
    if (this._pageLocked) return;
    this.$coin.textContent = `DF$ - 0`;
    this.$pfp.style.backgroundImage = `url('/org-owner.jpg')`;
    this.$name.textContent = user.email;
    this.$email.textContent = '';
    if (this.$logout) this.$logout.style.display = '';
    if (this.$edit) this.$edit.style.display = '';
    if (this.$login) this.$login.style.display = 'none';
  }

  _compact(n) {
    try {
      return Intl.NumberFormat('en', { notation: 'compact' }).format(n);
    } catch (e) {
      return String(n);
    }
  }

  _isFirestoreTimestamp(value) {
    return !!value && typeof value.toMillis === 'function';
  }

  _timestampToMillis(value) {
    if (!value) return 0;
    if (typeof value.toMillis === 'function') return value.toMillis();
    if (typeof value.seconds === 'number') return value.seconds * 1000;
    return 0;
  }

  _isTrue(value) {
    return value === true;
  }
}

customElements.define('dp-topbar', DPTopbar);