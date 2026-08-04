const docsTopbarTemplate = document.createElement('template');

docsTopbarTemplate.innerHTML = `
  <style>
    :host { position: sticky; top: 0; z-index: 200; display: block; }
    * { box-sizing: border-box; }
    .top-bar { height: 60px; padding: 0 20px; background: color-mix(in srgb, var(--bg) 86%, transparent); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); }
    .top-bar-inner { max-width: 1320px; width: 100%; height: 100%; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 18px; }
    .brand { display: flex; align-items: center; gap: 10px; color: var(--text); font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; font-weight: 800; font-size: 15.5px; letter-spacing: -.01em; cursor: pointer; text-decoration: none; }
    .brand-mark { width: 30px; height: 30px; border-radius: 9px; object-fit: cover; border: 1px solid var(--border-strong); background: var(--soft); }
    .brand-sub { font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; background: var(--soft); border: 1px solid var(--border-strong); padding: 3px 7px; border-radius: 6px; }
    .top-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; position: relative; }
    .icon-btn { width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--border-strong); background: var(--soft); color: var(--text); display: none; place-items: center; cursor: pointer; }
    .icon-btn svg { width: 16px; height: 16px; }
    .signin-btn { display: flex; align-items: center; gap: 8px; background: var(--soft); color: var(--text); border: 1px solid var(--border-strong); border-radius: 999px; padding: 8px 12px; font: 700 13px Inter, system-ui, sans-serif; cursor: pointer; white-space: nowrap; box-shadow: 0 1px 2px rgba(0,0,0,.08); }
    .signin-btn:hover { background: var(--card-2); }
    .signin-btn svg, .profile-surface svg { width: 15px; height: 15px; }
    .signin-label { font-weight: 700; font-size: 12.5px; }
    .profile-surface { display: flex; align-items: center; gap: 8px; padding: 4px 0; color: var(--text); background: transparent; border: 0; font: 700 13px Inter, system-ui, sans-serif; cursor: pointer; white-space: nowrap; }
    .profile-surface:hover { opacity: .82; }
    .signin-avatar { width: 22px; height: 22px; border-radius: 999px; object-fit: cover; border: 1px solid var(--border-strong); }
    .signin-verif { width: 14px; height: 14px; flex-shrink: 0; }
    [hidden] { display: none !important; }
    .profile-menu { position: absolute; top: calc(100% + 8px); right: 0; min-width: 190px; padding: 8px; background: var(--panel); border: 1px solid var(--border-strong); border-radius: 14px; box-shadow: 0 16px 36px rgba(0,0,0,.18); }
    .profile-menu-item { width: 100%; padding: 10px; border: 0; border-radius: 10px; background: transparent; color: var(--text); text-align: left; cursor: pointer; font: 600 13px Inter, system-ui, sans-serif; }
    .profile-menu-item:hover { background: var(--soft); }
    .profile-menu-item.danger { color: #ff8b8b; }
    .profile-menu-divider { height: 1px; margin: 6px 0; background: var(--border); }
    @media (max-width: 860px) { .icon-btn { display: grid; } .brand-name { display: none; } }
  </style>
  <div class="top-bar">
    <div class="top-bar-inner">
      <a class="brand" href="/docs/" aria-label="Docs home">
        <img class="brand-mark" src="/org-owner.jpg" alt="Platform logo">
        <span class="brand-name">DarkPurpleOF's Website</span>
        <span class="brand-sub">DOCS</span>
      </a>
      <div class="top-actions">
        <button class="icon-btn" type="button" title="Menu" aria-label="Menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
        <button class="signin-btn" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg><span class="signin-label">Log in</span></button>
        <button class="profile-surface" type="button" aria-haspopup="menu" aria-expanded="false" hidden></button>
        <div class="profile-menu" role="menu" hidden>
          <button class="profile-menu-item" type="button" data-action="create">Create</button>
          <button class="profile-menu-item" type="button" data-action="home">Main Home</button>
          <button class="profile-menu-item" type="button" data-action="docs">Docs Home</button>
          <div class="profile-menu-divider"></div>
          <button class="profile-menu-item danger" type="button" data-action="logout">Logout</button>
        </div>
      </div>
    </div>
  </div>`;

class DpDocsTopbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).append(docsTopbarTemplate.content.cloneNode(true));
    this.labels = { docs: 'DOCS', login: 'Log in', create: 'Create', home: 'Main Home', docsHome: 'Docs Home', logout: 'Logout' };
    this.user = null;
    this.profileData = null;
  }

  connectedCallback() {
    const root = this.shadowRoot;
    this.menuButton = root.querySelector('.icon-btn');
    this.signInButton = root.querySelector('.signin-btn');
    this.profileSurface = root.querySelector('.profile-surface');
    this.profileMenu = root.querySelector('.profile-menu');
    this.menuButton.addEventListener('click', () => this.dispatchEvent(new CustomEvent('docs-menu-toggle', { bubbles: true })));
    this.signInButton.addEventListener('click', () => { window.location.href = '/login'; });
    this.profileSurface.addEventListener('click', event => { event.stopPropagation(); this.toggleProfileMenu(); });
    this.profileSurface.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); this.toggleProfileMenu(); }
    });
    root.querySelectorAll('.profile-menu-item').forEach(item => item.addEventListener('click', () => this.handleMenuAction(item.dataset.action)));
    this.onDocumentClick = () => this.toggleProfileMenu(false);
    document.addEventListener('click', this.onDocumentClick);
    this.render();
  }

  disconnectedCallback() { document.removeEventListener('click', this.onDocumentClick); }

  setLabels(labels) { this.labels = { ...this.labels, ...labels }; this.render(); }
  setUser(user, profileData) { this.user = user || null; this.profileData = profileData || null; this.render(); }

  get isSignedIn() { return Boolean(this.user?.email || this.user?.displayName || this.user?.photoURL || this.profileData); }

  render() {
    if (!this.shadowRoot || !this.signInButton) return;
    const root = this.shadowRoot;
    root.querySelector('.brand-sub').textContent = this.labels.docs;
    this.signInButton.querySelector('.signin-label').textContent = this.labels.login;
    root.querySelector('[data-action="create"]').textContent = this.labels.create;
    root.querySelector('[data-action="home"]').textContent = this.labels.home;
    root.querySelector('[data-action="docs"]').textContent = this.labels.docsHome;
    root.querySelector('[data-action="logout"]').textContent = this.labels.logout;
    const signedIn = this.isSignedIn;
    this.signInButton.hidden = signedIn;
    this.profileSurface.hidden = !signedIn;
    this.profileMenu.hidden = true;
    this.profileSurface.setAttribute('aria-expanded', 'false');
    if (!signedIn) return;
    const displayName = this.profileData?.['display name'] || this.profileData?.displayName || this.user?.displayName || this.user?.email?.split('@')[0] || '';
    const avatarUrl = this.profileData?.profile_picture || this.user?.photoURL || '';
    const verified = this.profileData?.is_verified === true;
    this.profileSurface.replaceChildren();
    if (!avatarUrl) this.profileSurface.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm-7 16a7 7 0 0 1 14 0"/></svg>');
    if (avatarUrl) { const avatar = new Image(); avatar.className = 'signin-avatar'; avatar.src = avatarUrl; avatar.alt = ''; this.profileSurface.append(avatar); }
    const label = document.createElement('span'); label.className = 'signin-label'; label.textContent = displayName || this.labels.login; this.profileSurface.append(label);
    if (verified) { const badge = new Image(); badge.className = 'signin-verif'; badge.src = '/assets/verified.png'; badge.alt = 'Verified'; this.profileSurface.append(badge); }
  }

  toggleProfileMenu(force) {
    if (!this.isSignedIn) return;
    const open = typeof force === 'boolean' ? force : this.profileMenu.hidden;
    this.profileMenu.hidden = !open;
    this.profileSurface.setAttribute('aria-expanded', String(open));
  }

  handleMenuAction(action) {
    this.toggleProfileMenu(false);
    if (action === 'create') window.location.href = '/creator/dashboard';
    if (action === 'home') window.location.href = '/home';
    if (action === 'docs') window.location.href = '/docs/';
    if (action === 'logout' && window.firebase?.auth) window.firebase.auth().signOut().finally(() => { window.location.href = '/login'; });
  }
}

customElements.define('dp-docs-topbar', DpDocsTopbar);
