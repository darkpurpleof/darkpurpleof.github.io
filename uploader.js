/**
 * catbox-upload.js (i18n + endpoint + compat-safe Firebase)
 */

(function () {
  "use strict";

  // ── Config ────────────────────────────────────────────────────────────
  const UPLOAD_ENDPOINT = "https://darkpurpleofswebsitetooling.netlify.app/api/catbox";

  const BLOCKED_EXTENSIONS = new Set([
    "apk","apks","xapk","aab","apkm","ipa","dmg","pkg","mobileconfig",
    "exe","msi","msp","msix","msixbundle","appx","appxbundle",
    "bat","cmd","com","scr","pif","dll","ocx","cpl",
    "sh","bash","zsh","ksh","run","bin","deb","rpm","appimage",
    "elf","so","dylib","kext","jar","war","ear","sar","application",
    "ps1","psm1","psd1","vbs","vbe","js","jse","wsf","wsh","hta",
    "py","pyc","pyo",
    "php","php3","php4","php5","phtml","pl","pm","rb",
    "swf","iso","img","vhd","vhdx","vmdk",
    "rar","tar","gz","tgz","bz2","xz","lz","lzma","cab",
    "pup","ipsw","ofp","kdz","tot","nb0","cia","3ds","nds",
    "nsp","xci","wad","wbfs","rvz","gcm","cso",
    "crx","xpi","dpplugin",
  ]);

  const BLOCKED_MIME_TYPES = new Set([
    "application/vnd.android.package-archive","application/x-apk",
    "application/java-archive","application/x-java-archive",
    "application/x-msdownload","application/x-dosexec",
    "application/vnd.microsoft.portable-executable",
    "application/x-msi","application/x-ms-installer",
    "application/x-debian-package","application/x-rpm",
    "application/x-sh","application/x-shellscript","text/x-shellscript",
    "application/x-bat","application/x-msdos-program",
    "application/x-executable","application/x-elf","application/x-mach-binary",
    "application/x-apple-diskimage","application/x-iso9660-image",
    "application/x-virtualbox-vdi","application/x-vmdk",
    "application/x-chrome-extension","application/x-xpinstall",
    "application/x-python-code","text/x-python",
    "application/x-php","text/x-php","application/x-httpd-php",
    "application/x-ms-shortcut",
  ]);

  // ── i18n ──────────────────────────────────────────────────────────────

  const SUPPORTED_LANGS = ["en", "es", "ru", "ja", "de"];

  const I18N = {
    en: {
      upload_failed: "Upload failed.",
      network_error: "Network error while uploading.",
      unexpected: "Unexpected response from server.",
      sign_in: "Sign in to upload files.",
      blocked: "This file can't be uploaded.",
      toast_uploaded: "File uploaded.",
      setup_title: "One-time setup",
      setup_connect: "Connect a Catbox account",
      setup_desc:
        "Uploads are hosted through Catbox.moe. You need a userhash to manage uploads later.",
      step1: "Go to catbox.moe and create a free account (or sign in).",
      step2: "Open your account page.",
      step3: "Copy the userhash shown there.",
      step4: "Paste it below and save.",
      open_catbox: "Open catbox.moe →",
      userhash: "Userhash",
      placeholder: "Paste your userhash here",
      save: "Save and continue",
      cancel: "Not now",
      enter_hash: "Enter a userhash to continue.",
      save_error: "Couldn't save that — please try again.",
      uploading: "Uploading…",
      setup_error: "Couldn't check your upload settings.",
    },

    es: {
      upload_failed: "Error al subir.",
      network_error: "Error de red al subir.",
      unexpected: "Respuesta inesperada del servidor.",
      sign_in: "Inicia sesión para subir archivos.",
      blocked: "Este archivo no se puede subir.",
      toast_uploaded: "Archivo subido.",
      setup_title: "Configuración inicial",
      setup_connect: "Conectar cuenta de Catbox",
      setup_desc:
        "Las subidas se alojan en Catbox.moe. Necesitas un userhash para gestionarlas.",
      step1: "Ve a catbox.moe y crea una cuenta (o inicia sesión).",
      step2: "Abre tu página de cuenta.",
      step3: "Copia el userhash.",
      step4: "Pégalo abajo y guarda.",
      open_catbox: "Abrir catbox.moe →",
      userhash: "Userhash",
      placeholder: "Pega tu userhash aquí",
      save: "Guardar y continuar",
      cancel: "Ahora no",
      enter_hash: "Introduce un userhash.",
      save_error: "No se pudo guardar — inténtalo de nuevo.",
      uploading: "Subiendo…",
      setup_error: "No se pudo comprobar tu configuración.",
    },

    ru: {
      upload_failed: "Ошибка загрузки.",
      network_error: "Ошибка сети при загрузке.",
      unexpected: "Неожиданный ответ сервера.",
      sign_in: "Войдите, чтобы загружать файлы.",
      blocked: "Этот файл нельзя загрузить.",
      toast_uploaded: "Файл загружен.",
      setup_title: "Первичная настройка",
      setup_connect: "Подключить аккаунт Catbox",
      setup_desc: "Для загрузки нужен userhash Catbox.",
      step1: "Перейдите на catbox.moe и войдите или зарегистрируйтесь.",
      step2: "Откройте страницу аккаунта.",
      step3: "Скопируйте userhash.",
      step4: "Вставьте его ниже.",
      open_catbox: "Открыть catbox.moe →",
      userhash: "Userhash",
      placeholder: "Вставьте userhash",
      save: "Сохранить",
      cancel: "Не сейчас",
      enter_hash: "Введите userhash.",
      save_error: "Ошибка сохранения.",
      uploading: "Загрузка…",
      setup_error: "Не удалось проверить настройки.",
    },

    ja: {
      upload_failed: "アップロードに失敗しました。",
      network_error: "ネットワークエラーです。",
      unexpected: "サーバーの応答が不正です。",
      sign_in: "ログインしてください。",
      blocked: "このファイルはアップロードできません。",
      toast_uploaded: "アップロード完了。",
      setup_title: "初期設定",
      setup_connect: "Catboxアカウント連携",
      setup_desc: "アップロードにはuserhashが必要です。",
      step1: "catbox.moeでアカウント作成/ログイン",
      step2: "アカウントページを開く",
      step3: "userhashをコピー",
      step4: "ここに貼り付けて保存",
      open_catbox: "catboxを開く →",
      userhash: "Userhash",
      placeholder: "userhashを貼り付け",
      save: "保存して続行",
      cancel: "あとで",
      enter_hash: "userhashを入力してください。",
      save_error: "保存できませんでした。",
      uploading: "アップロード中…",
      setup_error: "設定を確認できません。",
    },

    de: {
      upload_failed: "Upload fehlgeschlagen.",
      network_error: "Netzwerkfehler beim Upload.",
      unexpected: "Unerwartete Serverantwort.",
      sign_in: "Anmelden zum Hochladen.",
      blocked: "Diese Datei kann nicht hochgeladen werden.",
      toast_uploaded: "Datei hochgeladen.",
      setup_title: "Ersteinrichtung",
      setup_connect: "Catbox-Konto verbinden",
      setup_desc: "Für Uploads wird ein Userhash benötigt.",
      step1: "Bei catbox.moe registrieren oder anmelden.",
      step2: "Kontoseite öffnen.",
      step3: "Userhash kopieren.",
      step4: "Hier einfügen.",
      open_catbox: "catbox.moe öffnen →",
      userhash: "Userhash",
      placeholder: "Userhash einfügen",
      save: "Speichern",
      cancel: "Später",
      enter_hash: "Userhash eingeben.",
      save_error: "Speichern fehlgeschlagen.",
      uploading: "Wird hochgeladen…",
      setup_error: "Einstellungen konnten nicht geprüft werden.",
    }
  };

  function getBrowserLang() {
    const l = (navigator.language || "en").toLowerCase();
    if (l.startsWith("es")) return "es";
    if (l.startsWith("ru")) return "ru";
    if (l.startsWith("ja")) return "ja";
    if (l.startsWith("de")) return "de";
    return "en";
  }

  let LANG = "en";

  async function getUserLang(email) {
    try {
      const snap = await firebase.firestore()
        .collection("user_data")
        .doc(email)
        .get();

      const lang = snap.data()?.lang;
      if (SUPPORTED_LANGS.includes(lang)) return lang;
    } catch (_) {}
    return getBrowserLang();
  }

  const t = (k) => I18N[LANG]?.[k] || I18N.en[k] || k;

  // ── Firebase helpers ────────────────────────────────────────────────

  function getCurrentUser() {
    if (typeof firebase === "undefined" || !firebase.auth) return null;
    return firebase.auth().currentUser;
  }

  function getUserHashDocRef(email) {
    return firebase.firestore()
      .collection("user_data")
      .doc(email)
      .collection("private")
      .doc("special");
  }

  async function fetchUserhash(email) {
    const snap = await getUserHashDocRef(email).get();
    return snap.exists ? (snap.data().catbox_userhash || "").trim() : "";
  }

  async function saveUserhash(email, userhash) {
    await getUserHashDocRef(email).set(
      { catbox_userhash: userhash },
      { merge: true }
    );
  }

  // ── UI helpers ───────────────────────────────────────────────────────

  function showToast(message, type) {
    const toast = document.getElementById("toast");
    if (!toast) return console.warn(message);

    toast.classList.remove("purple", "yellow", "red");
    toast.classList.add(type || "purple");
    toast.textContent = message;
    toast.style.display = "block";

    clearTimeout(toast._cbxTimer);
    toast._cbxTimer = setTimeout(() => {
      toast.style.display = "none";
    }, 3200);
  }

  function isBlockedFile(file) {
    if (!file) return false;
    const name = (file.name || "").toLowerCase();
    const ext = name.split(".").pop() || "";
    if (BLOCKED_EXTENSIONS.has(ext)) return true;

    const mime = (file.type || "").toLowerCase();
    if (BLOCKED_MIME_TYPES.has(mime)) return true;

    return false;
  }

  function showSpinnerOverlay() {
    if (typeof document === "undefined") return;
    let overlay = document.getElementById("cbx-upload-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "cbx-upload-overlay";
      overlay.style.position = "fixed";
      overlay.style.inset = "0";
      overlay.style.background = "rgba(0,0,0,0.6)";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.zIndex = "2147483647";
      document.body.appendChild(overlay);

      const spinner = document.createElement("div");
      spinner.style.width = "44px";
      spinner.style.height = "44px";
      spinner.style.borderRadius = "50%";
      spinner.style.border = "3px solid rgba(255,255,255,0.18)";
      spinner.style.borderTopColor = "#fff";
      spinner.style.animation = "cbx-spin 0.8s linear infinite";
      overlay.appendChild(spinner);

      const style = document.getElementById("cbx-upload-overlay-styles");
      if (!style) {
        const css = document.createElement("style");
        css.id = "cbx-upload-overlay-styles";
        css.textContent = `@keyframes cbx-spin { to { transform: rotate(360deg); } }`;
        document.head.appendChild(css);
      }
    }
    overlay.style.display = "flex";
  }

  function hideOverlay() {
    if (typeof document === "undefined") return;
    const overlay = document.getElementById("cbx-upload-overlay");
    if (overlay) overlay.style.display = "none";
  }

  function ensureUserhashDialogStyles() {
    if (typeof document === "undefined" || document.getElementById("cbx-userhash-dialog-styles")) return;

    const style = document.createElement("style");
    style.id = "cbx-userhash-dialog-styles";
    style.textContent = `
      .cbx-userhash-backdrop {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: rgba(0, 0, 0, 0.68);
        backdrop-filter: blur(6px);
      }
      .cbx-userhash-dialog {
        width: min(560px, 100%);
        background: linear-gradient(180deg, var(--card, #1f1f1f) 0%, var(--panel, #1b1b1b) 100%);
        border: 1px solid var(--border, rgba(255,255,255,0.08));
        border-radius: 16px;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
        color: var(--text, #eaeaea);
        overflow: hidden;
      }
      .cbx-userhash-dialog__inner {
        padding: 20px;
        display: grid;
        gap: 14px;
      }
      .cbx-userhash-kicker {
        display: inline-flex;
        align-items: center;
        width: fit-content;
        padding: 6px 10px;
        border-radius: 999px;
        background: var(--soft, rgba(255,255,255,0.03));
        border: 1px solid var(--border, rgba(255,255,255,0.08));
        color: var(--muted, #a8a8a8);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.02em;
      }
      .cbx-userhash-title {
        margin: 0;
        font-size: 20px;
        font-weight: 800;
        letter-spacing: -0.02em;
      }
      .cbx-userhash-desc {
        margin: 0;
        color: var(--muted, #a8a8a8);
        font-size: 14px;
        line-height: 1.55;
      }
      .cbx-userhash-steps {
        margin: 0;
        padding-left: 18px;
        color: var(--muted, #a8a8a8);
        display: grid;
        gap: 6px;
        font-size: 14px;
      }
      .cbx-userhash-field {
        display: grid;
        gap: 7px;
      }
      .cbx-userhash-field span {
        font-size: 13px;
        font-weight: 700;
        color: var(--text, #eaeaea);
      }
      .cbx-userhash-field input {
        width: 100%;
        border: 1px solid var(--border, rgba(255,255,255,0.08));
        border-radius: 12px;
        padding: 12px 13px;
        background: var(--soft, rgba(255,255,255,0.03));
        color: var(--text, #eaeaea);
        font-size: 14px;
        outline: none;
      }
      .cbx-userhash-field input:focus {
        border-color: var(--accent, #6b21a8);
        box-shadow: 0 0 0 3px rgba(107, 33, 168, 0.2);
      }
      .cbx-userhash-error {
        color: #ff7a7a;
        font-size: 13px;
        min-height: 18px;
      }
      .cbx-userhash-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        flex-wrap: wrap;
      }
      .cbx-userhash-btn {
        border: 1px solid var(--border, rgba(255,255,255,0.08));
        border-radius: 12px;
        padding: 10px 13px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
      }
      .cbx-userhash-btn--secondary {
        background: var(--soft, rgba(255,255,255,0.03));
        color: var(--text, #eaeaea);
      }
      .cbx-userhash-btn--primary {
        background: linear-gradient(135deg, var(--accent, #6b21a8), var(--accent-strong, #5b21b6));
        color: #fff;
        border-color: transparent;
      }
      .cbx-userhash-link {
        color: var(--accent, #6b21a8);
        text-decoration: none;
        font-weight: 700;
      }
      .cbx-userhash-link:hover {
        text-decoration: underline;
      }
    `;
    document.head.appendChild(style);
  }

  async function showUserhashDialog(email) {
    ensureUserhashDialogStyles();

    const root = (typeof document !== "undefined" && document.body) ? document.body : document.documentElement;
    const backdrop = document.createElement("div");
    backdrop.className = "cbx-userhash-backdrop";

    const title = t("setup_title");
    const connect = t("setup_connect");
    const desc = t("setup_desc");
    const step1 = t("step1");
    const step2 = t("step2");
    const step3 = t("step3");
    const step4 = t("step4");
    const openCatbox = t("open_catbox");
    const userhashLabel = t("userhash");
    const placeholder = t("placeholder");
    const saveText = t("save");
    const cancelText = t("cancel");

    backdrop.innerHTML = `
      <div class="cbx-userhash-dialog" role="dialog" aria-modal="true" aria-labelledby="cbx-userhash-title">
        <div class="cbx-userhash-dialog__inner">
          <div class="cbx-userhash-kicker">${connect}</div>
          <h3 id="cbx-userhash-title" class="cbx-userhash-title">${title}</h3>
          <p class="cbx-userhash-desc">${desc}</p>
          <ol class="cbx-userhash-steps">
            <li>${step1}</li>
            <li>${step2}</li>
            <li>${step3}</li>
            <li>${step4}</li>
          </ol>
          <a class="cbx-userhash-link" href="https://catbox.moe/" target="_blank" rel="noopener noreferrer">${openCatbox}</a>
          <label class="cbx-userhash-field">
            <span>${userhashLabel}${email ? ` (${email})` : ""}</span>
            <input id="cbx-userhash-input" type="text" autocomplete="off" spellcheck="false" placeholder="${placeholder}" />
          </label>
          <div id="cbx-userhash-error" class="cbx-userhash-error"></div>
          <div class="cbx-userhash-actions">
            <button id="cbx-userhash-cancel" type="button" class="cbx-userhash-btn cbx-userhash-btn--secondary">${cancelText}</button>
            <button id="cbx-userhash-save" type="button" class="cbx-userhash-btn cbx-userhash-btn--primary">${saveText}</button>
          </div>
        </div>
      </div>
    `;

    const input = backdrop.querySelector("#cbx-userhash-input");
    const error = backdrop.querySelector("#cbx-userhash-error");
    const cancelBtn = backdrop.querySelector("#cbx-userhash-cancel");
    const saveBtn = backdrop.querySelector("#cbx-userhash-save");

    return new Promise((resolve) => {
      const close = () => {
        backdrop.remove();
      };

      const finish = (value) => {
        close();
        resolve(value);
      };

      const saveValue = async () => {
        const userhash = String(input.value || "").trim();
        if (!userhash) {
          error.textContent = t("enter_hash");
          input.focus();
          return;
        }

        try {
          await saveUserhash(email, userhash);
          if (typeof localStorage !== "undefined") {
            localStorage.setItem("catbox_userhash_" + email, userhash);
          }
        } catch (_) {
          error.textContent = t("save_error");
          return;
        }

        finish(userhash);
      };

      backdrop.addEventListener("click", (event) => {
        if (event.target === backdrop) finish("");
      });
      cancelBtn.addEventListener("click", () => finish(""));
      saveBtn.addEventListener("click", saveValue);
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          saveValue();
        }
      });
      document.addEventListener("keydown", function onKeydown(event) {
        if (event.key === "Escape") {
          document.removeEventListener("keydown", onKeydown);
          finish("");
        }
      });

      root.appendChild(backdrop);
      setTimeout(() => input.focus(), 0);
    });
  }

  // ── Upload core ──────────────────────────────────────────────────────

  async function performUpload(file, userhash) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("userhash", userhash);

    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeoutId = setTimeout(() => {
      if (controller) controller.abort();
    }, 20000);

    try {
      const res = await fetch(UPLOAD_ENDPOINT, {
        method: "POST",
        body: fd,
        signal: controller ? controller.signal : undefined,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || t("upload_failed") };
      }
      return data;
    } catch (e) {
      return { success: false, error: t("network_error") };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ── Main ──────────────────────────────────────────────────────────────

  async function upload(file) {
    if (!file) return null;

    const user = getCurrentUser();
    if (!user?.email) {
      showToast(t("sign_in"), "red");
      return null;
    }

    const email = user.email.toLowerCase();

    LANG = await getUserLang(email);

    if (isBlockedFile(file)) {
      showToast(t("blocked"), "red");
      return null;
    }

    let userhash = await fetchUserhash(email);
    let shouldShowUploadSpinner = false;

    if (!userhash) {
      userhash = await showUserhashDialog(email);
      if (!userhash) return null;
      shouldShowUploadSpinner = true;
    }

    try {
      await saveUserhash(email, userhash);
    } catch (_) {}

    if (shouldShowUploadSpinner) {
      showSpinnerOverlay();
    }

    const result = await performUpload(file, userhash);

    hideOverlay();

    if (result.success) showToast(t("toast_uploaded"), "purple");
    else showToast(result.error || t("upload_failed"), "red");

    return result;
  }

  window.CatboxUploader = { upload };

})();