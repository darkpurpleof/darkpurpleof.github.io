import "/dp-profile-sheet.js";

(function () {
  // Load firebase compat SDKs and initialize if needed
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

  const STYLE_ID = "dp-image-viewer-style";
  const OVERLAY_ID = "dp-image-viewer";

  function esc(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      :root{
        --bg:#171717;
        --panel:#1b1b1b;
        --card:#1f1f1f;
        --muted:#a8a8a8;
        --text:#eaeaea;
        --border:rgba(255,255,255,.06);
        --border-strong:rgba(255,255,255,.1);
        --soft:rgba(255,255,255,.03);
        --radius:14px;
      }

      body.light{
        --bg:#f6f8fb;
        --panel:#ffffff;
        --card:#ffffff;
        --muted:#475569;
        --text:#0f172a;
        --border:rgba(0,0,0,.06);
        --border-strong:rgba(0,0,0,.09);
        --soft:rgba(0,0,0,.025);
      }

      .dp-iv-overlay{
        position:fixed;
        inset:0;
        z-index:999999;
        display:none;
        background:rgba(0,0,0,.5);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        overflow:hidden;
      }

      .dp-iv-overlay.open{ display:block; }

      .dp-iv-shell{
        position:absolute;
        inset:0;
        display:flex;
        flex-direction:column;
        color:var(--text);
      }

      .dp-iv-topbar{
        display:flex;
        align-items:center;
        gap:10px;
        padding:calc(env(safe-area-inset-top, 0px) + 8px) 8px 8px;
        background:linear-gradient(180deg, rgba(0,0,0,.48), rgba(0,0,0,0));
      }

      .dp-iv-back,
      .dp-iv-menu-btn{
        width:40px;
        height:40px;
        border:0;
        border-radius:999px;
        background:rgba(0,0,0,.28);
        color:#fff;
        display:grid;
        place-items:center;
        cursor:pointer;
        flex-shrink:0;
      }

      .dp-iv-back svg,
      .dp-iv-menu-btn svg{
        width:20px;
        height:20px;
      }

      .dp-iv-author{
        display:flex;
        align-items:center;
        gap:10px;
        min-width:0;
        flex:1;
        padding-right:6px;
      }

      .dp-iv-avatar-wrap{
        position:relative;
        width:40px;
        height:40px;
        flex-shrink:0;
      }

      .dp-iv-avatar,
      .dp-iv-frame{
        position:absolute;
        inset:0;
        width:100%;
        height:100%;
        border-radius:999px;
        object-fit:cover;
      }

      .dp-iv-avatar{
        inset:4px;
        width:32px;
        height:32px;
        background:var(--soft);
      }

      .dp-iv-author-text{
        min-width:0;
        display:grid;
        gap:1px;
      }

      .dp-iv-author-name{
        display:flex;
        align-items:center;
        gap:6px;
        min-width:0;
        font-size:15px;
        font-weight:800;
        line-height:1.2;
        color:#fff;
      }

      .dp-iv-author-name span{
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
      }

      .dp-iv-author-name img{
        width:16px;
        height:16px;
        flex-shrink:0;
      }

      .dp-iv-author-email{
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
        font-size:12px;
        color:rgba(255,255,255,.7);
      }

      .dp-iv-stage{
        position:relative;
        flex:1;
        min-height:0;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:8px 12px 16px;
      }

      .dp-iv-media-wrap{
        position:relative;
        width:100%;
        height:100%;
        display:flex;
        align-items:center;
        justify-content:center;
        overflow:hidden;
        border-radius:18px;
      }

      .dp-iv-image,
      .dp-iv-video{
        max-width:100%;
        max-height:100%;
        object-fit:contain;
        user-select:none;
        -webkit-user-drag:none;
      }

      .dp-iv-image{
        cursor:grab;
        transform-origin:center center;
        will-change: transform;
      }

      .dp-iv-image.dragging{
        cursor:grabbing;
      }

      .dp-iv-menu{
        position:absolute;
        top:56px;
        right:12px;
        min-width:220px;
        background:linear-gradient(180deg, var(--card), var(--panel));
        border:1px solid var(--border);
        border-radius:16px;
        box-shadow:0 18px 40px rgba(0,0,0,.28);
        padding:6px;
        display:none;
        z-index:3;
      }

      .dp-iv-menu.open{ display:block; }

      .dp-iv-item{
        width:100%;
        display:flex;
        align-items:center;
        gap:10px;
        border:0;
        background:transparent;
        color:var(--text);
        border-radius:12px;
        padding:11px 12px;
        cursor:pointer;
        text-align:left;
        font:inherit;
        font-weight:700;
      }

      .dp-iv-item:hover{
        background:var(--soft);
      }

      .dp-iv-item svg{
        width:18px;
        height:18px;
        flex-shrink:0;
      }

      .dp-iv-item:disabled{
        opacity:.45;
        cursor:not-allowed;
      }

      .dp-iv-loading{
        position:absolute;
        inset:0;
        display:grid;
        place-items:center;
        pointer-events:none;
      }

      .dp-iv-spinner{
        width:28px;
        height:28px;
        border-radius:50%;
        border:2px solid rgba(255,255,255,.2);
        border-top-color:#fff;
        animation:dpIvSpin 1s linear infinite;
      }

      @keyframes dpIvSpin{
        from{ transform:rotate(0deg); }
        to{ transform:rotate(360deg); }
      }

      @media (max-width: 600px){
        .dp-iv-topbar{
          padding-top:calc(env(safe-area-inset-top, 0px) + 6px);
        }
        .dp-iv-author-email{
          max-width: 54vw;
        }
        .dp-iv-menu{
          min-width: 200px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function svg(name) {
    const icons = {
      back: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
      more: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 6.5h.01M12 12h.01M12 17.5h.01" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        </svg>`,
      download: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3v10m0 0l4-4m-4 4l-4-4M5 17v2h14v-2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
      copy: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 9h10v10H9z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M5 15V5h10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
      share: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 8a3 3 0 1 0-2.8-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M9 13l6-3M9 11l6 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          <circle cx="6" cy="12" r="2.3" fill="none" stroke="currentColor" stroke-width="1.8"/>
          <circle cx="18" cy="6" r="2.3" fill="none" stroke="currentColor" stroke-width="1.8"/>
          <circle cx="18" cy="18" r="2.3" fill="none" stroke="currentColor" stroke-width="1.8"/>
        </svg>`,
      person: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 12.2a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 8.3a7 7 0 0 1 14 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`
    };
    return icons[name] || "";
  }

  function fileNameFromUrl(url) {
    try {
      const u = new URL(url, location.href);
      const last = u.pathname.split("/").filter(Boolean).pop() || "image";
      return last.includes(".") ? last : `${last}.jpg`;
    } catch {
      const last = String(url).split("/").filter(Boolean).pop() || "image.jpg";
      return last.includes(".") ? last : `${last}.jpg`;
    }
  }

  function getMime(fileName) {
    const n = fileName.toLowerCase();
    if (n.endsWith(".png")) return "image/png";
    if (n.endsWith(".webp")) return "image/webp";
    if (n.endsWith(".gif")) return "image/gif";
    if (n.endsWith(".mp4")) return "video/mp4";
    if (n.endsWith(".webm")) return "video/webm";
    if (n.endsWith(".mov")) return "video/quicktime";
    return "image/jpeg";
  }

  function detectKind(url, advancedMode) {
    const clean = String(url || "").split("?")[0].toLowerCase();
    if (!advancedMode) return "image";
    if (/\.(mp4|mkv|webm|mov|3gp|m4v)$/.test(clean)) return "video";
    return clean.endsWith(".gif") ? "gif" : "image";
  }

  function createOverlay() {
    injectStyles();

    let overlay = document.getElementById(OVERLAY_ID);
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.className = "dp-iv-overlay";
    overlay.innerHTML = `
      <div class="dp-iv-shell" role="dialog" aria-modal="true">
        <div class="dp-iv-topbar">
          <button class="dp-iv-back" type="button" aria-label="Back">${svg("back")}</button>

          <div class="dp-iv-author">
            <div class="dp-iv-avatar-wrap">
              <img class="dp-iv-frame" data-frame alt="" hidden>
              <img class="dp-iv-avatar" data-avatar alt="">
            </div>
            <div class="dp-iv-author-text">
              <div class="dp-iv-author-name">
                <span data-name></span>
                <img data-verified src="/assets/verified.png" alt="" hidden>
              </div>
              <div class="dp-iv-author-email" data-email></div>
            </div>
          </div>

          <button class="dp-iv-menu-btn" type="button" aria-label="More">${svg("more")}</button>

          <div class="dp-iv-menu" data-menu>
            <button class="dp-iv-item" data-download type="button"><span>Download</span></button>
            <button class="dp-iv-item" data-copy type="button"><span>Copy link</span></button>
            <button class="dp-iv-item" data-author type="button"><span>View author</span></button>
          </div>
        </div>

        <div class="dp-iv-stage">
          <div class="dp-iv-media-wrap">
            <img class="dp-iv-image" data-image alt="" hidden>
            <video class="dp-iv-video" data-video controls playsinline hidden></video>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const close = () => {
      overlay.classList.remove("open");
      document.body.style.overflow = "";
    };

    overlay._close = close;

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });

    overlay.querySelector(".dp-iv-back").addEventListener("click", close);
    overlay.querySelector(".dp-iv-menu-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      overlay.querySelector("[data-menu]").classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (!overlay.classList.contains("open")) return;
      if (!overlay.contains(e.target)) return;
      if (!e.target.closest(".dp-iv-menu-btn") && !e.target.closest("[data-menu]")) {
        overlay.querySelector("[data-menu]").classList.remove("open");
      }
    });

    return overlay;
  }

  async function downloadFile(url, filename) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch file');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename || fileNameFromUrl(url);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn('Download failed:', err);
    }
  }

  window.ImageViewer = {
    open: async ({
      imageUrl,
      authorEmail = "",
      secure = false,
      advancedMode = false
    }) => {
      const overlay = createOverlay();
      const menu = overlay.querySelector("[data-menu]");
      const img = overlay.querySelector("[data-image]");
      const vid = overlay.querySelector("[data-video]");
      const verified = overlay.querySelector("[data-verified]");
      const avatar = overlay.querySelector("[data-avatar]");
      const frame = overlay.querySelector("[data-frame]");
      const name = overlay.querySelector("[data-name]");
      const emailEl = overlay.querySelector("[data-email]");

      const isLocal = String(imageUrl || "").startsWith("file:///");
      const kind = detectKind(imageUrl, advancedMode);

      document.body.style.overflow = "hidden";
      menu.classList.remove("open");
      overlay.classList.add("open");

      // In simple mode, hide profile picture, email, and menu button
      if (!advancedMode) {
        overlay.querySelector(".dp-iv-avatar-wrap").style.display = "none";
        overlay.querySelector(".dp-iv-author-email").style.display = "none";
        overlay.querySelector(".dp-iv-menu-btn").style.display = "none";
        overlay.setAttribute("data-simple-mode", "true");
        // Constrain media wrap to square
        const mediaWrap = overlay.querySelector(".dp-iv-media-wrap");
        mediaWrap.style.width = "300px";
        mediaWrap.style.height = "300px";
        mediaWrap.style.margin = "0 auto";
      } else {
        overlay.querySelector(".dp-iv-avatar-wrap").style.display = "";
        overlay.querySelector(".dp-iv-author-email").style.display = "";
        overlay.querySelector(".dp-iv-menu-btn").style.display = "";
        overlay.removeAttribute("data-simple-mode");
        const mediaWrap = overlay.querySelector(".dp-iv-media-wrap");
        mediaWrap.style.width = "";
        mediaWrap.style.height = "";
        mediaWrap.style.margin = "";
      }

      // Set defaults
      let authorName = "No Display Name";
      let authorVerified = false;
      let authorPfp = "/org-owner.jpg";
      let authorFrame = "";

      // Fetch author data from Firestore if email provided
      if (authorEmail) {
        try {
          if (window.firebase && firebase.firestore) {
            const db = firebase.firestore();
            const docSnap = await db.collection('user_data').doc(authorEmail).get();
            if (docSnap.exists) {
              const data = docSnap.data();
              authorName = data['display name'] || data.display_name || authorName;
              authorPfp = data.profile_picture || authorPfp;
              authorFrame = data.profile_picture_frame || "";
              authorVerified = Boolean(data.is_verified);
            }
          }
        } catch (err) {
          console.warn('Failed to fetch author data from Firestore:', err);
        }
      }

      name.textContent = authorName;
      emailEl.textContent = authorEmail;
      verified.hidden = !authorVerified;
      avatar.src = authorPfp;

      if (authorFrame) {
        frame.hidden = false;
        frame.src = authorFrame;
      } else {
        frame.hidden = true;
      }

      img.hidden = true;
      vid.hidden = true;
      img.removeAttribute("src");
      vid.removeAttribute("src");

      if (kind === "video") {
        vid.hidden = false;
        vid.src = imageUrl;
      } else {
        img.hidden = false;
        img.src = imageUrl;
      }

      const cleanUp = () => {
        img.style.transform = "translate3d(0,0,0) scale(1)";
        img.dataset.scale = "1";
        img.dataset.x = "0";
        img.dataset.y = "0";
      };

      cleanUp();

      let scale = 1;
      let x = 0;
      let y = 0;
      let dragging = false;
      let startX = 0;
      let startY = 0;

      const applyTransform = () => {
        img.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      };

      img.onwheel = (e) => {
        if (kind === "video" || overlay.getAttribute("data-simple-mode")) return;
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.12 : 0.12;
        scale = Math.min(8, Math.max(1, scale + delta));
        if (scale === 1) {
          x = 0;
          y = 0;
        }
        applyTransform();
      };

      img.onpointerdown = (e) => {
        if (kind === "video" || scale <= 1 || overlay.getAttribute("data-simple-mode")) return;
        dragging = true;
        img.classList.add("dragging");
        startX = e.clientX - x;
        startY = e.clientY - y;
        img.setPointerCapture?.(e.pointerId);
      };

      img.onpointermove = (e) => {
        if (!dragging) return;
        x = e.clientX - startX;
        y = e.clientY - startY;
        applyTransform();
      };

      const stopDrag = () => {
        dragging = false;
        img.classList.remove("dragging");
      };

      img.onpointerup = stopDrag;
      img.onpointercancel = stopDrag;
      img.ondblclick = () => {
        if (kind === "video") return;
        if (scale === 1) {
          scale = 2;
        } else {
          scale = 1;
          x = 0;
          y = 0;
        }
        applyTransform();
      };

      overlay.querySelector("[data-download]").onclick = async () => {
        menu.classList.remove("open");
        if (secure || isLocal) return;
        await downloadFile(imageUrl, fileNameFromUrl(imageUrl));
      };

      overlay.querySelector("[data-copy]").onclick = async () => {
        menu.classList.remove("open");
        if (secure || isLocal) return;
        try {
          await navigator.clipboard.writeText(imageUrl);
        } catch {}
      };

      overlay.querySelector("[data-author]").onclick = () => {
        menu.classList.remove("open");
        if (!authorEmail) return;
        if (window.ProfileBottomSheet?.open) {
          window.ProfileBottomSheet.open({
            email: authorEmail,
            username: authorName,
            pfp: authorPfp,
            frame: authorFrame,
            verified: authorVerified
          });
        }
      };

      overlay.querySelector("[data-download]").disabled = secure || isLocal;
      overlay.querySelector("[data-copy]").disabled = secure || isLocal;

      return overlay;
    },
    close() {
      document.getElementById(OVERLAY_ID)?._close?.();
    }
  };
})();