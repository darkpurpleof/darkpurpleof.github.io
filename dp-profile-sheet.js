import "/sendgift.js";

// Load firebase compat SDKs and initialize if needed so this script can
// use `firebase.auth()` safely.
(async () => {
  const firebaseConfig = {
    apiKey: "AIzaSyCAPZF2zwU6z5rhikrIVZ4TVxf1tS5aTbA",
    authDomain: "darkpurpleof-s-website.firebaseapp.com",
    databaseURL: "https://darkpurpleof-s-website-default-rtdb.firebaseio.com",
    projectId: "darkpurpleof-s-website",
    storageBucket: "darkpurpleof-s-website.firebasestorage.app",
    messagingSenderId: "520651082420",
    appId: "1:520651082420:web:bb05c0c3fd64517952e5e1",
    measurementId: "G-S2X2JYC8Z0"
  };

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve();
      s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    });
  }

  try {
    if (!window.firebase) {
      await loadScript('https://www.gstatic.com/firebasejs/10.11.1/firebase-app-compat.js');
      await loadScript('https://www.gstatic.com/firebasejs/10.11.1/firebase-auth-compat.js');
      await loadScript('https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore-compat.js');
    }
  } catch (err) {
    console.warn('Failed to load Firebase SDKs:', err);
  }

  try {
    if (window.firebase && !firebase.apps?.length) {
      try {
        firebase.initializeApp(firebaseConfig);
      } catch (e) {
        console.warn('Firebase init error:', e);
      }
    }
  } catch (e) {
    console.warn('Firebase availability check failed:', e);
  }
})();

(function () {
  const STYLE_ID = "profile-sheet-style";

  function esc(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function svgIcon(name) {
    const icons = {
      arrow: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 19V5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M5 12l7-7 7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
      wall: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v10A2.5 2.5 0 0 1 17.5 18H8l-4 3V5.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M8 7.5h8M8 11h8M8 14.5h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>`,
      chat: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2h7A3.5 3.5 0 0 1 19 5.5v6A3.5 3.5 0 0 1 15.5 15H10l-4.5 3V5.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M8 6.8h8M8 10h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>`,
      gift: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 10h16v10H4V10Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M12 10v10M4 14h16M12 10c-1.8 0-3-.8-3-2s1.2-2 3-2 3 .8 3 2-1.2 2-3 2Zm0 0c-1.8 0-3-.8-3-2s1.2-2 3-2m0 4c1.8 0 3-.8 3-2s-1.2-2-3-2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9.2 6.2C8 5 6.7 4.7 5.8 5.5c-.8.8-.6 2.2.6 3.4L12 10l-2.8-3.8ZM14.8 6.2C16 5 17.3 4.7 18.2 5.5c.8.8.6 2.2-.6 3.4L12 10l2.8-3.8Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
        </svg>`
    };
    return icons[name] || "";
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      :root{
        --bg: #171717;
        --panel: #1b1b1b;
        --card: #1f1f1f;
        --card-2: #232323;
        --muted: #a8a8a8;
        --text: #eaeaea;
        --accent: #6b21a8;
        --accent-strong: #5b21b6;
        --border: rgba(255,255,255,0.05);
        --border-strong: rgba(255,255,255,0.08);
        --soft: rgba(255,255,255,0.03);
        --radius: 14px;
      }

      body.light {
        --bg: #f6f8fb;
        --panel: #ffffff;
        --card: #ffffff;
        --card-2: #f8fafc;
        --muted: #475569;
        --text: #0f172a;
        --border: rgba(0,0,0,0.06);
        --border-strong: rgba(0,0,0,0.09);
        --soft: rgba(0,0,0,0.025);
      }

      .dp-sheet-overlay {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: none;
        background: rgba(0,0,0,.62);
        backdrop-filter: blur(8px);
      }

      .dp-sheet-overlay.open { display: block; }

      .dp-sheet-panel {
        position: absolute;
        left: 50%;
        bottom: 0;
        transform: translateX(-50%) translateY(18px);
        width: min(100%, 820px);
        max-height: 92vh;
        background: linear-gradient(180deg, var(--card), var(--panel));
        border: 1px solid var(--border);
        border-bottom: 0;
        border-radius: 22px 22px 0 0;
        color: var(--text);
        overflow: hidden;
        box-shadow: 0 -18px 50px rgba(0,0,0,.35);
      }

      .dp-sheet-inner {
        max-height: 92vh;
        overflow: auto;
      }

      .dp-sheet-banner {
        position: relative;
        height: 220px;
        background: var(--soft);
      }

      .dp-sheet-banner img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .dp-sheet-fade {
        position: absolute;
        inset: auto 0 0 0;
        height: 80px;
        background: linear-gradient(to top, rgba(0,0,0,.62), transparent);
      }

      .dp-sheet-close {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 40px;
        height: 40px;
        border: 1px solid var(--border);
        border-radius: 999px;
        background: rgba(0,0,0,.35);
        color: #fff;
        display: grid;
        place-items: center;
        cursor: pointer;
      }

      .dp-sheet-close svg { width: 20px; height: 20px; }

      .dp-sheet-header {
        position: absolute;
        left: 50%;
        bottom: 12px;
        transform: translateX(-50%);
        display: grid;
        justify-items: center;
        gap: 8px;
        width: calc(100% - 24px);
        padding: 0 12px;
        text-align: center;
      }

      .dp-sheet-avatar-wrap {
        position: relative;
        width: 84px;
        height: 84px;
      }

      .dp-sheet-avatar-frame,
      .dp-sheet-avatar {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border-radius: 999px;
        object-fit: cover;
      }

      .dp-sheet-avatar {
        width: 76px;
        height: 76px;
        inset: 4px;
        border: 1px solid var(--border-strong);
        background: var(--soft);
        background-repeat: no-repeat;
        background-size: cover;
      }

      .dp-sheet-name {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        max-width: 100%;
        font-size: 16px;
        font-weight: 800;
        line-height: 1.2;
        color: #fff;
        text-shadow: 0 1px 2px rgba(0,0,0,.4);
      }

      .dp-sheet-name span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .dp-sheet-name img {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }

      .dp-sheet-email,
      .dp-sheet-bio {
        color: var(--muted);
        font-size: 13px;
        line-height: 1.6;
        word-break: break-word;
      }

      .dp-sheet-body {
        padding: 18px 20px 22px;
      }

      .dp-sheet-actions {
        display: grid;
        gap: 10px;
      }

      .dp-sheet-action {
        width: 100%;
        display: inline-flex;
        align-items: center;
        gap: 12px;
        padding: 13px 14px;
        border-radius: 16px;
        border: 1px solid var(--border);
        background: var(--soft);
        color: var(--text);
        cursor: pointer;
        text-align: left;
        font: inherit;
        font-weight: 700;
      }

      .dp-sheet-action svg {
        width: 19px;
        height: 19px;
        flex-shrink: 0;
      }

      .dp-sheet-action:hover {
        border-color: var(--border-strong);
        background: rgba(255,255,255,.05);
      }

      @media (max-width: 600px) {
        .dp-sheet-panel {
          width: 100%;
          border-radius: 18px 18px 0 0;
        }
        .dp-sheet-banner {
          height: 200px;
        }
        .dp-sheet-body {
          padding: 14px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function createOverlay() {
    injectStyles();

    let overlay = document.getElementById("dp-profile-sheet");
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = "dp-profile-sheet";
    overlay.className = "dp-sheet-overlay";
    overlay.innerHTML = `
      <div class="dp-sheet-panel" role="dialog" aria-modal="true">
        <div class="dp-sheet-inner">
          <div class="dp-sheet-banner">
            <img data-banner alt="">
            <div class="dp-sheet-fade"></div>
            <button class="dp-sheet-close" type="button" aria-label="Close">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 7l10 10M17 7L7 17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </button>
            <div class="dp-sheet-header">
              <div class="dp-sheet-avatar-wrap">
                <img data-frame class="dp-sheet-avatar-frame" alt="" hidden>
                <img data-avatar class="dp-sheet-avatar" alt="">
              </div>
              <div class="dp-sheet-name">
                <span data-name></span>
                <img data-verified src="/assets/verified.png" alt="" hidden>
              </div>
              <div class="dp-sheet-email" data-email></div>
            </div>
          </div>

          <div class="dp-sheet-body">
            <div class="dp-sheet-bio" data-bio></div>
            <div style="height:14px"></div>
            <div class="dp-sheet-actions">
              <button class="dp-sheet-action" data-post type="button">
                ${svgIcon("arrow")}
                <span>Post to wall</span>
              </button>
              <button class="dp-sheet-action" data-chat type="button">
                ${svgIcon("wall")}
                <span>Chat</span>
              </button>
              <button class="dp-sheet-action" data-gift type="button">
                ${svgIcon("gift")}
                <span>Send gift</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const close = () => overlay.classList.remove("open");
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    overlay.querySelector(".dp-sheet-close").addEventListener("click", close);

    overlay._close = close;
    return overlay;
  }

  window.ProfileBottomSheet = {
    open({ email, username, bio = "", banner = "/assets/default_banner.png", pfp = "/org-owner.png", frame = "", verified = false }) {
      const overlay = createOverlay();

      overlay.querySelector("[data-banner]").src = banner || "/assets/default_banner.png";
      overlay.querySelector("[data-avatar]").src = pfp || "/org-owner.jpg";
      overlay.querySelector("[data-name]").textContent = username || "No Display Name";
      overlay.querySelector("[data-email]").textContent = email || "";
      overlay.querySelector("[data-bio]").textContent = bio || "";

      const verifiedEl = overlay.querySelector("[data-verified]");
      verifiedEl.hidden = !verified;
      if (verified) verifiedEl.src = "/assets/verified.png";

      const frameEl = overlay.querySelector("[data-frame]");
      if (frame) {
        frameEl.src = frame;
        frameEl.hidden = false;
      } else {
        frameEl.hidden = true;
      }

      // Hide actions (post/chat/gift) when viewing your own profile
      try {
        const actionsEl = overlay.querySelector('.dp-sheet-actions');
        let currentEmail = null;
        if (window.firebase && firebase.auth && firebase.auth().currentUser) {
          currentEmail = firebase.auth().currentUser.email || null;
        }
        if (currentEmail && email && String(currentEmail).toLowerCase() === String(email).toLowerCase()) {
          if (actionsEl) actionsEl.style.display = 'none';
        } else {
          if (actionsEl) actionsEl.style.display = '';
        }
      } catch (e) {
        // ignore; if firebase not present, leave actions visible
      }

      overlay.querySelector("[data-post]").onclick = () => {
        if (email) location.href = `createpost?wall=${encodeURIComponent(email)}`;
      };

      overlay.querySelector("[data-chat]").onclick = () => {
        if (email) location.href = `chat?email=${encodeURIComponent(email)}`;
      };

      overlay.querySelector("[data-gift]").onclick = () => {
        if (window.SendGiftSheet?.open && email) {
          window.SendGiftSheet.open({
            email,
            username: username || ""
          });
        }
      };

      overlay.classList.add("open");
    },
    close() {
      const overlay = document.getElementById("dp-profile-sheet");
      overlay?._close?.();
    }
  };
})();