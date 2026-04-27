// dp-topbar.js
// Usage: ensure firebase is initialized globally (firebase, firebase.auth(), firebase.firestore())
// Then include in your HTML: <script src="/path/to/dp-topbar.js"></script>
// Use <dp-topbar></dp-topbar> anywhere in your pages.

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      width: 100%;
      font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial;
    }

    .bar {
      box-sizing: border-box;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 10px 20px;
      position: relative;
      z-index: 30;
      background: var(--topbar-bg, #1f1f1f);
      color: var(--topbar-text, #e9e9e9);
      border-bottom: 1px solid var(--topbar-border, rgba(255, 255, 255, 0.06));
      box-shadow: 0 1px 0 rgba(0, 0, 0, 0.03);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }

    .left {
      display: flex;
      align-items: center;
      gap: 16px;
      min-width: 0;
      flex: 0 0 auto;
    }

    .center {
      flex: 1 1 auto;
      display: flex;
      justify-content: center;
      min-width: 0;
      max-width: 520px;
      margin-inline: 12px;
    }

    .search-shell {
      position: relative;
      width: min(100%, 520px);
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: 999px;
      background: var(--chip-bg, rgba(255, 255, 255, 0.03));
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.05));
      transition: background-color 140ms ease, border-color 140ms ease;
      min-height: 40px;
    }

    .search-box:hover {
      background: var(--chip-hover, rgba(255, 255, 255, 0.05));
      border-color: var(--surface-border-strong, rgba(255, 255, 255, 0.09));
    }

    .search-box svg {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      opacity: 0.72;
    }

    .search-box input {
      width: 100%;
      border: none;
      outline: none;
      background: transparent;
      color: inherit;
      font: inherit;
      font-size: 14px;
      min-width: 0;
    }

    .search-box input::placeholder {
      color: inherit;
      opacity: 0.6;
    }

    .search-dropdown {
      display: none;
      position: absolute;
      left: 0;
      right: 0;
      top: calc(100% + 8px);
      background: var(--dropdown-bg, #262626);
      color: var(--dropdown-text, #e9e9e9);
      border-radius: 16px;
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
      padding: 8px;
      z-index: 60;
      overflow: hidden;
    }

    .search-dropdown.show {
      display: block;
    }

    .search-meta {
      padding: 8px 12px 10px 12px;
      font-size: 12px;
      opacity: 0.68;
      user-select: none;
    }

    .search-results {
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-height: 320px;
      overflow: auto;
      padding-right: 2px;
    }

    .search-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 10px 12px;
      border: none;
      border-radius: 12px;
      background: transparent;
      color: inherit;
      text-align: left;
      cursor: pointer;
      font: inherit;
      transition: background-color 140ms ease;
    }

    .search-item:hover {
      background: var(--nav-hover, rgba(255, 255, 255, 0.03));
    }

    .search-avatar-wrap {
      position: relative;
      width: 34px;
      height: 34px;
      flex-shrink: 0;
    }

    .search-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      object-fit: contain;
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.06));
      display: block;
    }

    .search-avatar-frame {
      position: absolute;
      inset: 0;
      border-radius: 10px;
      background-size: cover;
      background-position: center;
      pointer-events: none;
      display: none;
    }

    .search-text {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1 1 auto;
    }

    .search-name {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
      font-size: 14px;
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .search-email {
      font-size: 12px;
      opacity: 0.68;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .search-empty {
      padding: 14px 12px;
      font-size: 13px;
      opacity: 0.7;
      user-select: none;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      color: inherit;
      text-decoration: none;
      border-radius: 12px;
      padding: 4px 6px;
      flex-shrink: 0;
      transition: background-color 140ms ease, opacity 140ms ease;
    }

    .brand:hover {
      background: var(--nav-hover, rgba(255, 255, 255, 0.03));
    }

    .brand:focus-visible,
    .hamburger:focus-visible,
    .balance:focus-visible,
    .profile:focus-visible,
    .dropdown a:focus-visible,
    .dropdown button:focus-visible,
    .search-box:focus-within,
    .search-item:focus-visible {
      outline: 2px solid var(--focus-ring, rgba(168, 85, 247, 0.35));
      outline-offset: 2px;
    }

    .brand img {
      width: 36px;
      height: 36px;
      border-radius: 9px;
      object-fit: cover;
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      flex-shrink: 0;
    }

    nav.nav {
      display: flex;
      gap: 6px;
      align-items: center;
      min-width: 0;
      overflow: hidden;
    }

    nav.nav a {
      color: inherit;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      line-height: 1;
      padding: 9px 12px;
      border-radius: 999px;
      transition: background-color 140ms ease, opacity 140ms ease, transform 140ms ease;
      white-space: nowrap;
    }

    nav.nav a:hover {
      background: var(--nav-hover, rgba(255, 255, 255, 0.03));
    }

    nav.nav a:active,
    .dropdown a:active,
    .dropdown button:active,
    .balance:active,
    .profile:active,
    .search-item:active {
      transform: translateY(1px);
    }

    .icon-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 12px;
      color: inherit;
      cursor: pointer;
      padding: 0;
      transition: background-color 140ms ease, border-color 140ms ease;
      flex-shrink: 0;
    }

    .mobile-only {
      display: none;
    }

    .icon-button img {
      width: 20px;
      height: 20px;
      display: block;
    }

    .icon-button:hover {
      background: var(--nav-hover, rgba(255, 255, 255, 0.03));
      border-color: var(--surface-border, rgba(255, 255, 255, 0.06));
    }

    .icon-button:focus-visible {
      outline: 2px solid var(--focus-ring, rgba(168, 85, 247, 0.35));
      outline-offset: 2px;
    }

    .center.mobile-visible {
      display: flex;
      position: absolute;
      left: 12px;
      right: 12px;
      top: calc(100% + 8px);
      background: var(--dropdown-bg, #262626);
      border-radius: 16px;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
      padding: 12px;
      z-index: 35;
      max-width: none;
    }

    .center.mobile-visible .search-shell {
      width: 100%;
    }

    .hamburger {
      display: none;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 10px;
      color: inherit;
      padding: 0;
      margin: 0;
      box-shadow: none;
      appearance: none;
      -webkit-appearance: none;
      cursor: pointer;
      transition: background-color 140ms ease, border-color 140ms ease;
      flex-shrink: 0;
    }

    .hamburger:hover {
      background: var(--nav-hover, rgba(255, 255, 255, 0.03));
      border-color: var(--surface-border, rgba(255, 255, 255, 0.06));
    }

    .hamburger svg {
      width: 18px;
      height: 18px;
      display: block;
    }

    .mobile-menu {
      display: none;
      position: absolute;
      left: 12px;
      top: calc(100% + 8px);
      background: var(--dropdown-bg, #262626);
      color: var(--dropdown-text, #e9e9e9);
      border-radius: 14px;
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      box-shadow: 0 12px 30px rgba(2, 6, 23, 0.28);
      padding: 8px;
      flex-direction: column;
      gap: 4px;
      z-index: 45;
      min-width: 180px;
    }

    .mobile-menu.show {
      display: flex;
    }

    .mobile-menu a {
      color: inherit;
      text-decoration: none;
      padding: 10px 12px;
      border-radius: 10px;
      display: block;
      font-weight: 600;
      font-size: 14px;
      transition: background-color 140ms ease;
    }

    .mobile-menu a:hover {
      background: var(--nav-hover, rgba(255, 255, 255, 0.03));
    }

    .right {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
      flex: 0 0 auto;
    }

    .balance-wrap {
      position: relative;
      flex-shrink: 0;
    }

    .balance {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 12px;
      border-radius: 999px;
      font-weight: 600;
      font-size: 13px;
      background: var(--chip-bg, rgba(255, 255, 255, 0.03));
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.05));
      min-width: 104px;
      position: relative;
      cursor: pointer;
      user-select: none;
      transition: background-color 140ms ease, border-color 140ms ease;
    }

    .balance:hover {
      background: var(--chip-hover, rgba(255, 255, 255, 0.05));
      border-color: var(--surface-border-strong, rgba(255, 255, 255, 0.09));
    }

    .balance::after {
      content: "";
      width: 7px;
      height: 7px;
      border-right: 1.5px solid currentColor;
      border-bottom: 1.5px solid currentColor;
      transform: rotate(45deg) translateY(-1px);
      opacity: 0.6;
      margin-left: 2px;
      flex-shrink: 0;
    }

    .profile {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      position: relative;
      padding: 6px 8px 6px 6px;
      border-radius: 14px;
      user-select: none;
      transition: background-color 140ms ease;
      flex-shrink: 0;
    }

    .profile:hover {
      background: var(--nav-hover, rgba(255, 255, 255, 0.03));
    }

    .pfp {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background-repeat: no-repeat;
      background-size: 105%;
      background-position: center;
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.06));
      flex-shrink: 0;
    }

    .pinfo {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
      min-width: 120px;
      max-width: 220px;
    }

    .pinfo .name {
      font-weight: 700;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .pinfo .small {
      display: none;
      font-size: 12px;
      opacity: 0.68;
      margin-top: 3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .verified-icon {
      width: 14px;
      height: 14px;
      object-fit: contain;
      flex-shrink: 0;
    }

    .dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      min-width: 220px;
      border-radius: 14px;
      background: var(--dropdown-bg, #262626);
      color: var(--dropdown-text, #e9e9e9);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
      border: 1px solid var(--surface-border, rgba(0, 0, 0, 0.06));
      padding: 8px;
      display: none;
      flex-direction: column;
      gap: 4px;
      z-index: 40;
    }

    .dropdown.show {
      display: flex;
    }

    .dropdown a,
    .dropdown button {
      color: inherit;
      text-decoration: none;
      background: transparent;
      border: none;
      padding: 10px 12px;
      text-align: left;
      border-radius: 10px;
      cursor: pointer;
      font: inherit;
      font-size: 14px;
      line-height: 1.2;
      transition: background-color 140ms ease, opacity 140ms ease;
    }

    .dropdown a:hover,
    .dropdown button:hover {
      background: var(--nav-hover, rgba(255, 255, 255, 0.03));
    }

    .dropdown a.disabled,
    .dropdown button.disabled {
      opacity: 0.6;
      cursor: not-allowed;
      pointer-events: none;
    }

    .dropdown .separator {
      height: 1px;
      margin: 4px 4px;
      background: var(--surface-border, rgba(255, 255, 255, 0.06));
      border-radius: 999px;
    }

    .dropdown.left-align {
      right: auto;
      left: 0;
    }

    .coin-dropdown-header {
      display: none;
      padding: 10px 12px 8px;
      border-bottom: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      margin-bottom: 8px;
    }

    .coin-dropdown-label {
      font-size: 12px;
      opacity: 0.72;
    }

    .coin-dropdown-value {
      margin-top: 4px;
      font-weight: 700;
      font-size: 14px;
    }

    @media (max-width: 800px) {
      .coin-dropdown-header {
        display: block;
      }

      #coin-dropdown {
        left: auto;
        right: 0;
      }
    }

    @media (max-width: 900px) {
      .center {
        display: none;
      }
    }

    @media (max-width: 800px) {
      .mobile-only {
        display: inline-flex;
      }

      nav.nav {
        display: none;
      }

      .hamburger {
        display: inline-flex;
      }

      .pinfo {
        display: none;
      }

      .balance {
        display: none;
      }

      .bar {
        padding: 10px 14px;
        gap: 12px;
      }

      .left {
        gap: 12px;
      }
    }
  </style>

  <div class="bar" role="navigation" aria-label="Topbar">
    <div class="left">
      <a class="brand" id="brand" href="/home" aria-label="Go to home">
        <img id="brand-logo" src="/org-owner.jpg" alt="Platform logo">
      </a>

      <nav class="nav" id="nav" aria-label="Main navigation">
        <a href="/home" data-target="/home">Home</a>
        <a href="/ugc/posts" data-target="/ugc/posts">Posts</a>
        <a href="/creator/dashboard" data-target="/creator/dashboard">Create</a>
        <a href="/chats" data-target="/chats">Chats</a>
      </nav>

      <button class="hamburger" id="hamburger" aria-label="Open menu" aria-haspopup="true" aria-expanded="false">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      <div class="mobile-menu" id="mobile-menu" role="menu" aria-hidden="true">
        <a href="/home" data-target="/home">Home</a>
        <a href="/ugc/posts" data-target="/ugc/posts">Posts</a>
        <a href="/creator/dashboard" data-target="/creator/dashboard">Create</a>
        <a href="/chats" data-target="/chats">Chats</a>
      </div>
    </div>

    <div class="center">
      <div class="search-shell" id="search-shell">
        <div class="search-box" id="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"></path>
          </svg>
          <input id="top-search-input" type="text" placeholder="Search users by name or email..." autocomplete="off" spellcheck="false" aria-label="Search users">
        </div>
        <div class="search-dropdown" id="search-dropdown" aria-hidden="true">
          <div class="search-meta" id="search-meta">Search users</div>
          <div class="search-results" id="search-results"></div>
        </div>
      </div>
    </div>

    <div class="right">
      <button class="icon-button mobile-only" id="mobile-search-btn" type="button" aria-label="Open search">
        <img src="/assets/search.png" alt="Search icon">
      </button>
      <div class="balance-wrap">
        <button class="icon-button mobile-only" id="mobile-coin-btn" type="button" aria-label="Open DF options">
          <img src="/assets/df.png" alt="DF icon">
        </button>
        <div class="balance" id="coin-display" tabindex="0" aria-haspopup="true" aria-expanded="false">DF$ - 0</div>
        <div class="dropdown left-align" id="coin-dropdown" role="menu" aria-hidden="true">
          <div class="coin-dropdown-header">
            <div class="coin-dropdown-label">Balance</div>
            <div class="coin-dropdown-value" id="coin-balance-summary">DF$ - 0</div>
          </div>
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
          <a id="settings-link" href="/my/account">Settings</a>
          <a id="support-link" href="/support-feedback" class="disabled">Support (Coming Soon)</a>
          <a id="manage-blocked" href="/manageblockedusers">Manage Blocked Users</a>
          <a id="beta-link" href="/creator/beta-features">Beta Program</a>
          <div class="separator"></div>
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
    this._currentUserEmail = null;
    this._mobileMenuOpen = false;
    this._mobileSearchOpen = false;
    this._verifiedIcon = null;
    this._pageLocked = false;
    this._globalGatePromise = null;
    this._globalGatesChecked = false;
    this._searchCache = { ts: 0, users: [] };
    this._searchRequestId = 0;
    this._searchTimer = null;
    this._boundOnDocumentClick = this._onDocumentClick.bind(this);
    this._boundOnWindowKeydown = this._onWindowKeydown.bind(this);
    this._boundOnResize = this._onResize.bind(this);
  }

  connectedCallback() {
    this._setupElements();
    this._setupTheme();
    this._wireUI();
    this._waitForFirebaseAndInit();
  }

  disconnectedCallback() {
    if (this._authUnsub) this._authUnsub();
    document.removeEventListener('click', this._boundOnDocumentClick, true);
    window.removeEventListener('keydown', this._boundOnWindowKeydown);
    window.removeEventListener('resize', this._boundOnResize);
    if (this._searchTimer) clearTimeout(this._searchTimer);
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
    this.$center = s.querySelector('.center');
    this.$mobileSearchBtn = s.getElementById('mobile-search-btn');
    this.$mobileCoinBtn = s.getElementById('mobile-coin-btn');
    this.$coinBalanceSummary = s.getElementById('coin-balance-summary');

    this.$settings = s.getElementById('settings-link');
    this.$support = s.getElementById('support-link');
    this.$manageBlocked = s.getElementById('manage-blocked');
    this.$beta = s.getElementById('beta-link');

    this.$searchShell = s.getElementById('search-shell');
    this.$searchBox = s.getElementById('search-box');
    this.$searchInput = s.getElementById('top-search-input');
    this.$searchDropdown = s.getElementById('search-dropdown');
    this.$searchMeta = s.getElementById('search-meta');
    this.$searchResults = s.getElementById('search-results');
  }

  _wireUI() {
    this.$coin.addEventListener('click', e => {
      if (this._pageLocked) return;
      e.stopPropagation();
      if (this.$coinDropdown.contains(e.target)) return;
      if (!this._currentUser) {
        window.location.href = '/login';
        return;
      }
      this._toggleCoinDropdown();
      this._hideDropdown();
      this._closeMobileMenu();
      this._hideSearchDropdown();
    });

    this.$coin.addEventListener('keydown', e => {
      if (this._pageLocked) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!this._currentUser) {
          window.location.href = '/login';
          return;
        }
        this._toggleCoinDropdown();
        this._hideDropdown();
        this._closeMobileMenu();
        this._hideSearchDropdown();
      }
      if (e.key === 'Escape') this._hideCoinDropdown();
    });

    this.$profileArea.addEventListener('click', e => {
      if (this._pageLocked) return;
      e.stopPropagation();
      this._toggleDropdown();
      this._hideCoinDropdown();
      this._closeMobileMenu();
      this._hideSearchDropdown();
    });

    this.$profileArea.addEventListener('keydown', e => {
      if (this._pageLocked) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this._toggleDropdown();
        this._hideCoinDropdown();
        this._closeMobileMenu();
        this._hideSearchDropdown();
      }
      if (e.key === 'Escape') this._hideDropdown();
    });

    this.$hamburger.addEventListener('click', e => {
      if (this._pageLocked) return;
      e.stopPropagation();
      this._toggleMobileMenu();
      this._hideDropdown();
      this._hideCoinDropdown();
      this._hideSearchDropdown();
    });

    if (this.$mobileSearchBtn) {
      this.$mobileSearchBtn.addEventListener('click', e => {
        if (this._pageLocked) return;
        e.stopPropagation();
        this._toggleMobileSearch();
        this._hideDropdown();
        this._hideCoinDropdown();
        this._closeMobileMenu();
      });
    }

    if (this.$mobileCoinBtn) {
      this.$mobileCoinBtn.addEventListener('click', e => {
        if (this._pageLocked) return;
        e.stopPropagation();
        if (!this._currentUser) {
          window.location.href = '/login';
          return;
        }
        this._toggleCoinDropdown();
        this._hideDropdown();
        this._hideSearchDropdown();
        this._closeMobileMenu();
      });
    }

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
        if (!window.firebase || !firebase.auth) {
          console.warn('Firebase not available');
          return;
        }
        await firebase.auth().signOut();
        window.location.reload();
      } catch (err) {
        console.error(err);
        window.location.reload();
      }
    });

    if (this.$redeem) this.$redeem.addEventListener('click', e => { if (this._pageLocked) e.preventDefault(); });
    // Removed preventDefault for transactions link to enable navigation
    if (this.$settings) this.$settings.addEventListener('click', e => e.preventDefault());
    if (this.$support) this.$support.addEventListener('click', e => e.preventDefault());

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

    this._setupSearch();

    document.addEventListener('click', this._boundOnDocumentClick, true);
    window.addEventListener('resize', this._boundOnResize);
    window.addEventListener('keydown', this._boundOnWindowKeydown);
  }

  _setupSearch() {
    if (!this.$searchInput) return;

    this.$searchInput.addEventListener('focus', () => {
      if (this._pageLocked) return;
      if (!this._currentUserEmail) return;
      if (this.$searchInput.value.trim()) {
        this._showSearchDropdown();
        this._scheduleSearch(this.$searchInput.value);
      }
    });

    this.$searchInput.addEventListener('click', e => {
      if (this._pageLocked) return;
      e.stopPropagation();
      if (!this._currentUserEmail) {
        window.location.href = '/login';
        return;
      }
      if (this.$searchInput.value.trim()) {
        this._showSearchDropdown();
      }
    });

    this.$searchInput.addEventListener('input', e => {
      if (this._pageLocked) return;
      if (!this._currentUserEmail) {
        window.location.href = '/login';
        return;
      }
      this._scheduleSearch(e.target.value);
    });

    this.$searchInput.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this._hideSearchDropdown();
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const first = this.$searchResults?.querySelector('.search-item');
        if (first) first.click();
      }
    });

    this.$searchBox.addEventListener('click', e => {
      if (this._pageLocked) return;
      e.stopPropagation();
      if (!this._currentUserEmail) {
        window.location.href = '/login';
        return;
      }
      if (this.$searchInput.value.trim()) {
        this._showSearchDropdown();
      }
    });
  }

  _scheduleSearch(rawQuery) {
    if (this._searchTimer) clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => {
      this._searchUsers(rawQuery);
    }, 180);
  }

  async _searchUsers(rawQuery) {
    const query = String(rawQuery || '').trim();
    const token = ++this._searchRequestId;

    if (!query) {
      this._clearSearchResults('Search users');
      this._hideSearchDropdown();
      return;
    }

    if (!this._currentUserEmail) {
      window.location.href = '/login';
      return;
    }

    this._showSearchDropdown();
    this._setSearchState('Searching...');

    try {
      const users = await this._fetchUsersForSearch();
      if (token !== this._searchRequestId) return;

      const filtered = users.filter(user => this._matchesSearchUser(user, query));
      const limited = filtered.slice(0, 7);
      this._renderSearchResults(limited, query);
    } catch (err) {
      if (token !== this._searchRequestId) return;
      console.warn('Search failed:', err);
      this._setSearchState('Search unavailable');
      this._clearSearchResults('Search unavailable');
      this._showSearchDropdown();
    }
  }

  async _fetchUsersForSearch() {
    const now = Date.now();
    if (this._searchCache.users.length && (now - this._searchCache.ts) < 30000) {
      return this._searchCache.users;
    }

    if (!window.firebase || !firebase.firestore) return [];

    const db = firebase.firestore();
    const snapshot = await db.collection('user_data').get();
    const users = snapshot.docs.map(doc => ({ email: doc.id, ...doc.data() }));
    this._searchCache = { ts: now, users };
    return users;
  }

  _matchesSearchUser(user, query) {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return false;

    const email = String(user?.email || '').toLowerCase();
    const displayNameRaw = String(user?.['display name'] || user?.display_name || '');
    const displayName = displayNameRaw.toLowerCase().trim();
    const isEmailQuery = q.includes('@') && q.includes('.');
    const publicFlag = user?.isProfilePublic;
    const publicFlagAlt = user?.is_profile_public;
    const isPrivate = publicFlag === false || publicFlagAlt === false;

    if (isPrivate) return false;
    if (email === this._currentUserEmail?.toLowerCase()) return false;

    const blockedByUser = Array.isArray(user?.blockedUsers) && user.blockedUsers.includes(this._currentUserEmail);
    const blockedByUserAlt = Array.isArray(user?.blocked_users) && user.blocked_users.includes(this._currentUserEmail);
    if (blockedByUser || blockedByUserAlt) return false;

    if (isEmailQuery) {
      return email === q;
    }

    if (displayName.startsWith('https://')) return false;
    if (displayName === '[content deleted]' || displayName === '[contenido eliminado]') return false;
    if (this._looksLikeEmail(displayNameRaw)) return false;

    return displayName.includes(q) || email.includes(q);
  }

  _looksLikeEmail(value) {
    if (!value || typeof value !== 'string') return false;
    const normalized = value.trim();
    if (!normalized.includes('@') || !normalized.includes('.')) return false;
    if (/\\s/.test(normalized)) return false;
    const parts = normalized.split('@');
    if (parts.length !== 2) return false;
    return parts[0].length > 0 && parts[1].includes('.') && parts[1].split('.').every(Boolean);
  }

  _renderSearchResults(users, query) {
    if (!this.$searchResults) return;
    this.$searchResults.innerHTML = '';

    if (!query.trim()) {
      this._setSearchState('Search users');
      this._hideSearchDropdown();
      return;
    }

    if (!users.length) {
      this._setSearchState(`No users found for "${query}"`);
      const empty = document.createElement('div');
      empty.className = 'search-empty';
      empty.textContent = 'No results';
      this.$searchResults.appendChild(empty);
      this._showSearchDropdown();
      return;
    }

    this._setSearchState(`Found ${users.length} result${users.length === 1 ? '' : 's'}`);

    users.forEach(user => {
      const item = document.createElement('button');
      item.className = 'search-item';
      item.type = 'button';

      const wrap = document.createElement('div');
      wrap.className = 'search-avatar-wrap';

      const img = document.createElement('img');
      img.className = 'search-avatar';
      img.alt = 'Profile picture';
      img.src = user.profile_picture || '/org-owner.jpg';
      img.onerror = () => { img.src = '/org-owner.jpg'; };

      const frame = document.createElement('div');
      frame.className = 'search-avatar-frame';
      if (String(user.profile_picture_frame || '').trim()) {
        frame.style.backgroundImage = `url('${user.profile_picture_frame}')`;
        frame.style.display = 'block';
      }

      wrap.appendChild(img);
      wrap.appendChild(frame);

      const text = document.createElement('div');
      text.className = 'search-text';

      const nameLine = document.createElement('div');
      nameLine.className = 'search-name';

      const nameSpan = document.createElement('span');
      nameSpan.textContent = user['display name'] || user.display_name || user.email;
      nameLine.appendChild(nameSpan);

      if (user.is_verified) {
        const badge = document.createElement('img');
        badge.src = '/assets/verified.png';
        badge.alt = 'Verified';
        badge.className = 'verified-icon';
        nameLine.appendChild(badge);
      }

      const emailLine = document.createElement('div');
      emailLine.className = 'search-email';
      emailLine.textContent = user.email;

      text.appendChild(nameLine);
      text.appendChild(emailLine);

      item.appendChild(wrap);
      item.appendChild(text);

      item.addEventListener('click', () => {
        window.location.href = `/viewprofile?profile=${encodeURIComponent(user.email)}`;
      });

      this.$searchResults.appendChild(item);
    });

    this._showSearchDropdown();
  }

  _setSearchState(text) {
    if (this.$searchMeta) this.$searchMeta.textContent = text;
  }

  _clearSearchResults(metaText) {
    if (this.$searchResults) this.$searchResults.innerHTML = '';
    if (this.$searchMeta && metaText) this.$searchMeta.textContent = metaText;
  }

  _showSearchDropdown() {
    if (!this.$searchDropdown) return;
    this.$searchDropdown.classList.add('show');
    this.$searchDropdown.setAttribute('aria-hidden', 'false');
  }

  _hideSearchDropdown() {
    if (!this.$searchDropdown) return;
    this.$searchDropdown.classList.remove('show');
    this.$searchDropdown.setAttribute('aria-hidden', 'true');
  }

  _onDocumentClick(e) {
    if (this._pageLocked) return;
    const path = typeof e.composedPath === 'function' ? e.composedPath() : [];

    const clickedInsideCoin = path.includes(this.$coin) || path.includes(this.$coinDropdown) || path.includes(this.$coin?.parentElement);
    const clickedInsideProfile = path.includes(this.$profileArea) || path.includes(this.$dropdown);
    const clickedInsideMobile = path.includes(this.$mobileMenu) || path.includes(this.$hamburger);
    const clickedInsideSearch = path.includes(this.$searchShell) || path.includes(this.$searchDropdown) || path.includes(this.$center);

    if (!clickedInsideCoin) this._hideCoinDropdown();
    if (!clickedInsideProfile) this._hideDropdown();
    if (!clickedInsideMobile) this._closeMobileMenu();
    if (!clickedInsideSearch) {
      this._hideSearchDropdown();
      this._hideMobileSearchPanel();
    }
  }

  _onWindowKeydown(e) {
    if (e.key === 'Escape') {
      this._hideDropdown();
      this._hideCoinDropdown();
      this._closeMobileMenu();
      this._hideSearchDropdown();
    }
  }

  _onResize() {
    this._hideDropdown();
    this._hideCoinDropdown();
    this._closeMobileMenu();
    this._hideSearchDropdown();
    this._hideMobileSearchPanel();
  }

  _toggleMobileMenu() {
    if (this._pageLocked) return;
    this._mobileMenuOpen = !this._mobileMenuOpen;
    if (this._mobileMenuOpen) {
      this.$mobileMenu.classList.add('show');
      this.$mobileMenu.setAttribute('aria-hidden', 'false');
      this.$hamburger.setAttribute('aria-expanded', 'true');
    } else {
      this._closeMobileMenu();
    }
  }

  _showMobileSearchPanel() {
    if (this._pageLocked) return;
    this._mobileSearchOpen = true;
    if (this.$center) this.$center.classList.add('mobile-visible');
    if (this.$searchInput) {
      this.$searchInput.focus();
    }
  }

  _hideMobileSearchPanel() {
    this._mobileSearchOpen = false;
    if (this.$center) this.$center.classList.remove('mobile-visible');
  }

  _toggleMobileSearch() {
    if (this._pageLocked) return;
    if (this._mobileSearchOpen) {
      this._hideMobileSearchPanel();
    } else {
      this._showMobileSearchPanel();
    }
  }

  _closeMobileMenu() {
    this._mobileMenuOpen = false;
    this.$mobileMenu.classList.remove('show');
    this.$mobileMenu.setAttribute('aria-hidden', 'true');
    this.$hamburger.setAttribute('aria-expanded', 'false');
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
      document.documentElement.style.setProperty('--topbar-bg', '#ffffff');
      document.documentElement.style.setProperty('--topbar-text', '#111111');
      document.documentElement.style.setProperty('--topbar-border', 'rgba(0,0,0,0.06)');
      document.documentElement.style.setProperty('--chip-bg', 'rgba(0,0,0,0.04)');
      document.documentElement.style.setProperty('--chip-hover', 'rgba(0,0,0,0.06)');
      document.documentElement.style.setProperty('--dropdown-bg', '#ffffff');
      document.documentElement.style.setProperty('--dropdown-text', '#111111');
      document.documentElement.style.setProperty('--nav-hover', 'rgba(0,0,0,0.04)');
      document.documentElement.style.setProperty('--surface-border', 'rgba(0,0,0,0.08)');
      document.documentElement.style.setProperty('--surface-border-strong', 'rgba(0,0,0,0.11)');
      document.documentElement.style.setProperty('--focus-ring', 'rgba(0,0,0,0.18)');
    } else {
      document.body.classList.remove('light');
      document.body.classList.add('dark');
      document.documentElement.style.setProperty('--topbar-bg', '#1f1f1f');
      document.documentElement.style.setProperty('--topbar-text', '#e9e9e9');
      document.documentElement.style.setProperty('--topbar-border', 'rgba(255,255,255,0.06)');
      document.documentElement.style.setProperty('--chip-bg', 'rgba(255,255,255,0.03)');
      document.documentElement.style.setProperty('--chip-hover', 'rgba(255,255,255,0.05)');
      document.documentElement.style.setProperty('--dropdown-bg', '#262626');
      document.documentElement.style.setProperty('--dropdown-text', '#e9e9e9');
      document.documentElement.style.setProperty('--nav-hover', 'rgba(255,255,255,0.03)');
      document.documentElement.style.setProperty('--surface-border', 'rgba(255,255,255,0.06)');
      document.documentElement.style.setProperty('--surface-border-strong', 'rgba(255,255,255,0.09)');
      document.documentElement.style.setProperty('--focus-ring', 'rgba(168,85,247,0.35)');
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
          await this._enableFirestorePersistence(firebase.firestore());
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
      this._currentUserEmail = user?.email || null;

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

          if (!isBanned) {
            const compactBalance = `DF$ - ${this._compact(coins)}`;
            this.$coin.textContent = compactBalance;
            if (this.$coinBalanceSummary) this.$coinBalanceSummary.textContent = compactBalance;
          } else {
            this.$coin.textContent = 'DF$ - ?';
            if (this.$coinBalanceSummary) this.$coinBalanceSummary.textContent = 'DF$ - ?';
          }

          this.$pfp.style.backgroundImage = `url(${data.profile_picture || '/org-owner.jpg'})`;
          const display = data['display name'] || data.display_name || user.email;
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

      if (this._isInWebView()) {
        console.warn('WebView detected; skipping terms dialog.');
        return true;
      }

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
            background: rgba(0, 0, 0, 0.72);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
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
          #dp-terms-overlay a {
            color: #c4b5fd;
            text-decoration: underline;
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
            background: #6b21a8;
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
          <p><a href="https://darkpurpleof.github.io/terms" target="_blank" rel="noopener noreferrer">Read the full Terms of Service</a></p>
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

    if (this.$trans) {
      this.$trans.classList.remove('disabled');
      this.$trans.textContent = 'My transactions';
    }

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
    if (this.$coinBalanceSummary) this.$coinBalanceSummary.textContent = `DF$ - 0`;
    this.$pfp.style.backgroundImage = `url('/org-owner.jpg')`;
    this.$name.textContent = 'Not signed in';
    this.$email.textContent = '';
    this._showSignedOutDropdownOptions();
    this._currentUserEmail = null;
  }

  _renderSignedInBasic(user) {
    if (this._pageLocked) return;
    this.$coin.textContent = `DF$ - 0`;
    if (this.$coinBalanceSummary) this.$coinBalanceSummary.textContent = `DF$ - 0`;
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

  async _enableFirestorePersistence(db) {
    if (!db || typeof db.enablePersistence !== 'function') return;
    if (this._firestorePersistenceEnabled) return;

    try {
      await db.enablePersistence({ synchronizeTabs: true });
      this._firestorePersistenceEnabled = true;
      console.info('Firestore persistence enabled for this document.');
    } catch (err) {
      if (err && err.code === 'failed-precondition') {
        console.warn('Firestore persistence could not be enabled because multiple tabs are open in this browser session.', err);
      } else if (err && err.code === 'unimplemented') {
        console.warn('Firestore persistence is not available in this browser.', err);
      } else {
        console.warn('Firestore persistence could not be enabled:', err);
      }
    }
  }

  _isInWebView() {
    const ua = String(window.navigator.userAgent || '');
    const webViewPatterns = [
      /\bwv\b/i,
      /Android.*AppleWebKit/i,
      /FBAN|FBAV|Instagram|Twitter|LinkedIn|Snapchat|Discord|Pinterest|Line/i,
      /WebView/i
    ];
    return webViewPatterns.some(pattern => pattern.test(ua));
  }

  _isTrue(value) {
    return value === true;
  }
}

customElements.define('dp-topbar', DPTopbar);