/* sendgift.js
   Reusable bottom sheet for sending UGC gifts.
   Requires Firebase compat globals: firebase.auth(), firebase.firestore()
*/

(function (root, factory) {
  const api = factory(root);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.SendGiftSheet = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const APPROVED_JSON_URL = "https://darkpurpleof.github.io/market/approveddev.json";
  const ALLOWED_LANGS = new Set(["en", "es", "de", "ja", "ru"]);
  const FALLBACK_LANG = "en";

  const I18N = {
    en: {
      title: "Send Gift",
      close: "Close",
      cancel: "Cancel",
      continue: "Continue",
      confirm: "Send gift",
      selectGift: "Select gift",
      yourGift: "Your gift",
      addMessage: "Add a message",
      messageOptional: "Message (optional)",
      recipient: "Recipient email",
      recipientLoading: "Looking up user...",
      recipientNotFound: "That user does not exist.",
      recipientBlocked: "That user does not accept gifts.",
      youBlockedUser: "You blocked this user.",
      cantSendToSelf: "You cannot send a gift to yourself.",
      noAccount: "No signed-in account was found.",
      missingData: "Missing data",
      missingDataMsg: "Open this screen with a valid recipient or selected item.",
      chooseGiftHint: "Tap to pick an approved UGC",
      approvedUgc: "Approved UGCs",
      approvedHint: "Pick one from the approved list.",
      loadingApproved: "Loading approved UGCs...",
      approvedEmpty: "No approved UGCs were found.",
      itemNotFound: "Gift could not be loaded.",
      notForSale: "Not for sale",
      price: "Price",
      coins: "Coins",
      sendTo: "Send to",
      enterUrl: "Paste image URL",
      imageUrl: "Image URL",
      useUrl: "Use URL",
      imageHint: "This gift image will be used as the card preview.",
      previewImage: "Gift image",
      loadingUser: "Loading user...",
      loadingGift: "Loading gift...",
      sendNow: "Send now",
      sending: "Sending...",
      success: "Gift sent",
      successMsg: "Your gift was sent successfully.",
      error: "Something went wrong.",
      invalidUrl: "Please enter a valid image URL.",
      noGiftSelected: "Please select a gift.",
      noRecipient: "Please enter a valid recipient.",
      imageRequired: "Please add an image URL.",
      notEnoughCoins: "Not enough coins.",
      duplicateGift: "That same gift was already sent to this recipient.",
      blockedSending: "You cannot send gifts to blocked users.",
      tos: "By sending a gift, you agree to the site's gifting rules.",
      searchApproved: "Search approved UGCs",
      subtype: "Type",
      author: "Author",
      chooseApproved: "Choose approved UGC",
      selected: "Selected",
      loaded: "Loaded",
      giftDescription: "Gift sent to {name}",
      loading: "Loading...",
      openImageDialog: "Tap to paste image URL"
    },
    es: {
      title: "Enviar regalo",
      close: "Cerrar",
      cancel: "Cancelar",
      continue: "Continuar",
      confirm: "Enviar regalo",
      selectGift: "Elegir regalo",
      yourGift: "Tu regalo",
      addMessage: "Añadir mensaje",
      messageOptional: "Mensaje (opcional)",
      recipient: "Correo del destinatario",
      recipientLoading: "Buscando usuario...",
      recipientNotFound: "Ese usuario no existe.",
      recipientBlocked: "Ese usuario no acepta regalos.",
      youBlockedUser: "Bloqueaste a este usuario.",
      cantSendToSelf: "No puedes enviarte un regalo a ti mismo.",
      noAccount: "No se encontró una cuenta iniciada.",
      missingData: "Faltan datos",
      missingDataMsg: "Abre esta pantalla con un destinatario válido o un objeto seleccionado.",
      chooseGiftHint: "Toca para elegir un UGC aprobado",
      approvedUgc: "UGCs aprobados",
      approvedHint: "Elige uno de la lista aprobada.",
      loadingApproved: "Cargando UGCs aprobados...",
      approvedEmpty: "No se encontraron UGCs aprobados.",
      itemNotFound: "No se pudo cargar el regalo.",
      notForSale: "No está a la venta",
      price: "Precio",
      coins: "Monedas",
      sendTo: "Enviar a",
      enterUrl: "Pega la URL de la imagen",
      imageUrl: "URL de la imagen",
      useUrl: "Usar URL",
      imageHint: "Esta imagen se usará como vista previa del regalo.",
      previewImage: "Imagen del regalo",
      loadingUser: "Cargando usuario...",
      loadingGift: "Cargando regalo...",
      sendNow: "Enviar ahora",
      sending: "Enviando...",
      success: "Regalo enviado",
      successMsg: "Tu regalo se envió correctamente.",
      error: "Algo salió mal.",
      invalidUrl: "Escribe una URL de imagen válida.",
      noGiftSelected: "Elige un regalo.",
      noRecipient: "Escribe un destinatario válido.",
      imageRequired: "Añade una URL de imagen.",
      notEnoughCoins: "No tienes suficientes monedas.",
      duplicateGift: "Ese mismo regalo ya se envió a este destinatario.",
      blockedSending: "No puedes enviar regalos a usuarios bloqueados.",
      tos: "Al enviar un regalo, aceptas las reglas de regalos del sitio.",
      searchApproved: "Buscar UGCs aprobados",
      subtype: "Tipo",
      author: "Autor",
      chooseApproved: "Elegir UGC aprobado",
      selected: "Seleccionado",
      loaded: "Cargado",
      giftDescription: "Regalo enviado a {name}",
      loading: "Cargando...",
      openImageDialog: "Toca para pegar la URL de la imagen"
    },
    de: {
      title: "Geschenk senden",
      close: "Schließen",
      cancel: "Abbrechen",
      continue: "Weiter",
      confirm: "Geschenk senden",
      selectGift: "Geschenk auswählen",
      yourGift: "Dein Geschenk",
      addMessage: "Nachricht hinzufügen",
      messageOptional: "Nachricht (optional)",
      recipient: "Empfänger-E-Mail",
      recipientLoading: "Benutzer wird gesucht...",
      recipientNotFound: "Dieser Benutzer existiert nicht.",
      recipientBlocked: "Dieser Benutzer akzeptiert keine Geschenke.",
      youBlockedUser: "Du hast diesen Benutzer blockiert.",
      cantSendToSelf: "Du kannst dir selbst kein Geschenk senden.",
      noAccount: "Kein angemeldetes Konto gefunden.",
      missingData: "Fehlende Daten",
      missingDataMsg: "Öffne diese Ansicht mit einem gültigen Empfänger oder ausgewählten Objekt.",
      chooseGiftHint: "Tippe, um ein freigegebenes UGC auszuwählen",
      approvedUgc: "Freigegebene UGCs",
      approvedHint: "Wähle eines aus der freigegebenen Liste.",
      loadingApproved: "Freigegebene UGCs werden geladen...",
      approvedEmpty: "Keine freigegebenen UGCs gefunden.",
      itemNotFound: "Geschenk konnte nicht geladen werden.",
      notForSale: "Nicht zum Verkauf",
      price: "Preis",
      coins: "Münzen",
      sendTo: "Senden an",
      enterUrl: "Bild-URL einfügen",
      imageUrl: "Bild-URL",
      useUrl: "URL verwenden",
      imageHint: "Dieses Geschenkbild wird als Vorschau verwendet.",
      previewImage: "Geschenkbild",
      loadingUser: "Benutzer wird geladen...",
      loadingGift: "Geschenk wird geladen...",
      sendNow: "Jetzt senden",
      sending: "Wird gesendet...",
      success: "Geschenk gesendet",
      successMsg: "Dein Geschenk wurde erfolgreich gesendet.",
      error: "Etwas ist schiefgelaufen.",
      invalidUrl: "Bitte eine gültige Bild-URL eingeben.",
      noGiftSelected: "Bitte ein Geschenk auswählen.",
      noRecipient: "Bitte einen gültigen Empfänger eingeben.",
      imageRequired: "Bitte eine Bild-URL hinzufügen.",
      notEnoughCoins: "Nicht genug Münzen.",
      duplicateGift: "Dasselbe Geschenk wurde diesem Empfänger bereits gesendet.",
      blockedSending: "An blockierte Benutzer können keine Geschenke gesendet werden.",
      tos: "Mit dem Senden eines Geschenks akzeptierst du die Geschenkrichtlinien der Seite.",
      searchApproved: "Freigegebene UGCs suchen",
      subtype: "Typ",
      author: "Autor",
      chooseApproved: "Freigegebenes UGC wählen",
      selected: "Ausgewählt",
      loaded: "Geladen",
      giftDescription: "Geschenk gesendet an {name}",
      loading: "Lädt...",
      openImageDialog: "Tippe, um die Bild-URL einzufügen"
    },
    ja: {
      title: "ギフトを送る",
      close: "閉じる",
      cancel: "キャンセル",
      continue: "続行",
      confirm: "ギフトを送信",
      selectGift: "ギフトを選ぶ",
      yourGift: "あなたのギフト",
      addMessage: "メッセージを追加",
      messageOptional: "メッセージ（任意）",
      recipient: "受信者のメール",
      recipientLoading: "ユーザーを確認中...",
      recipientNotFound: "そのユーザーは存在しません。",
      recipientBlocked: "そのユーザーはギフトを受け付けていません。",
      youBlockedUser: "このユーザーをブロックしています。",
      cantSendToSelf: "自分にはギフトを送れません。",
      noAccount: "サインイン中のアカウントが見つかりません。",
      missingData: "データ不足",
      missingDataMsg: "有効な受信者または選択済みアイテムで開いてください。",
      chooseGiftHint: "タップして承認済みUGCを選ぶ",
      approvedUgc: "承認済みUGC",
      approvedHint: "承認リストから1つ選んでください。",
      loadingApproved: "承認済みUGCを読み込み中...",
      approvedEmpty: "承認済みUGCが見つかりません。",
      itemNotFound: "ギフトを読み込めませんでした。",
      notForSale: "販売不可",
      price: "価格",
      coins: "コイン",
      sendTo: "送信先",
      enterUrl: "画像URLを貼り付け",
      imageUrl: "画像URL",
      useUrl: "URLを使う",
      imageHint: "このギフト画像がプレビューとして使われます。",
      previewImage: "ギフト画像",
      loadingUser: "ユーザーを読み込み中...",
      loadingGift: "ギフトを読み込み中...",
      sendNow: "今すぐ送信",
      sending: "送信中...",
      success: "ギフトを送信しました",
      successMsg: "ギフトが正常に送信されました。",
      error: "問題が発生しました。",
      invalidUrl: "有効な画像URLを入力してください。",
      noGiftSelected: "ギフトを選んでください。",
      noRecipient: "有効な受信者を入力してください。",
      imageRequired: "画像URLを追加してください。",
      notEnoughCoins: "コインが足りません。",
      duplicateGift: "同じギフトはこの受信者にすでに送信されています。",
      blockedSending: "ブロックしたユーザーにはギフトを送れません。",
      tos: "ギフトを送信すると、サイトのギフト規則に同意したことになります。",
      searchApproved: "承認済みUGCを検索",
      subtype: "種類",
      author: "作者",
      chooseApproved: "承認済みUGCを選ぶ",
      selected: "選択済み",
      loaded: "読み込み完了",
      giftDescription: "{name} にギフトを送信",
      loading: "読み込み中...",
      openImageDialog: "タップして画像URLを貼り付け"
    },
    ru: {
      title: "Отправить подарок",
      close: "Закрыть",
      cancel: "Отмена",
      continue: "Продолжить",
      confirm: "Отправить подарок",
      selectGift: "Выбрать подарок",
      yourGift: "Ваш подарок",
      addMessage: "Добавить сообщение",
      messageOptional: "Сообщение (необязательно)",
      recipient: "Email получателя",
      recipientLoading: "Поиск пользователя...",
      recipientNotFound: "Такого пользователя не существует.",
      recipientBlocked: "Этот пользователь не принимает подарки.",
      youBlockedUser: "Вы заблокировали этого пользователя.",
      cantSendToSelf: "Нельзя отправить подарок самому себе.",
      noAccount: "Не найдено вошедшего аккаунта.",
      missingData: "Недостаточно данных",
      missingDataMsg: "Откройте это окно с действительным получателем или выбранным предметом.",
      chooseGiftHint: "Нажмите, чтобы выбрать одобренный UGC",
      approvedUgc: "Одобренные UGC",
      approvedHint: "Выберите один из одобренного списка.",
      loadingApproved: "Загрузка одобренных UGC...",
      approvedEmpty: "Одобренные UGC не найдены.",
      itemNotFound: "Не удалось загрузить подарок.",
      notForSale: "Не продается",
      price: "Цена",
      coins: "Монеты",
      sendTo: "Отправить кому",
      enterUrl: "Вставьте URL изображения",
      imageUrl: "URL изображения",
      useUrl: "Использовать URL",
      imageHint: "Это изображение будет использоваться как превью подарка.",
      previewImage: "Изображение подарка",
      loadingUser: "Загрузка пользователя...",
      loadingGift: "Загрузка подарка...",
      sendNow: "Отправить сейчас",
      sending: "Отправка...",
      success: "Подарок отправлен",
      successMsg: "Подарок успешно отправлен.",
      error: "Что-то пошло не так.",
      invalidUrl: "Введите корректный URL изображения.",
      noGiftSelected: "Выберите подарок.",
      noRecipient: "Введите корректного получателя.",
      imageRequired: "Добавьте URL изображения.",
      notEnoughCoins: "Недостаточно монет.",
      duplicateGift: "Этот подарок уже был отправлен этому получателю.",
      blockedSending: "Нельзя отправлять подарки заблокированным пользователям.",
      tos: "Отправляя подарок, вы соглашаетесь с правилами подарков сайта.",
      searchApproved: "Поиск одобренных UGC",
      subtype: "Тип",
      author: "Автор",
      chooseApproved: "Выбрать одобренный UGC",
      selected: "Выбрано",
      loaded: "Загружено",
      giftDescription: "Подарок отправлен пользователю {name}",
      loading: "Загрузка...",
      openImageDialog: "Нажмите, чтобы вставить URL изображения"
    }
  };

  let hostEl = null;
  let shadow = null;
  let styleEl = null;
  let state = null;
  let approvedCachePromise = null;

  function ensureFirebase() {
    if (!root.firebase || !firebase.auth || !firebase.firestore) {
      throw new Error("Firebase is not available on this page.");
    }
  }

  function getAuth() {
    ensureFirebase();
    return firebase.auth();
  }

  function getFirestore() {
    ensureFirebase();
    return firebase.firestore();
  }

  function isAllowedLang(code) {
    return ALLOWED_LANGS.has((code || "").toLowerCase());
  }

  async function resolveLanguage(currentEmail) {
    let lang = null;

    try {
      if (currentEmail) {
        const snap = await getFirestore().collection("user_data").doc(currentEmail).get();
        const raw = snap.exists ? String(snap.get("lang") || "").trim().toLowerCase() : "";
        if (isAllowedLang(raw)) lang = raw;
      }
    } catch (_) {}

    if (!lang) {
      const nav = String((root.navigator && root.navigator.language) || "").toLowerCase();
      const navCode = nav.slice(0, 2);
      if (isAllowedLang(navCode)) lang = navCode;
    }

    return lang || FALLBACK_LANG;
  }

  function t(key, lang, vars = {}) {
    const dict = I18N[lang] || I18N.en;
    let str = dict[key] || I18N.en[key] || key;
    for (const [k, v] of Object.entries(vars)) {
      str = str.replaceAll(`{${k}}`, String(v));
    }
    return str;
  }

  function escapeHtml(text) {
    return String(text ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function isValidUrl(url) {
    try {
      const u = new URL(url);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }

  function createRoot() {
    if (hostEl && shadow) return;

    if (!document.querySelector('link[data-sendgift-inter]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
      link.setAttribute('data-sendgift-inter', '1');
      document.head.appendChild(link);
    }

    hostEl = document.createElement("div");
    hostEl.id = "sendgift-sheet-host";
    hostEl.style.position = "fixed";
    hostEl.style.inset = "0";
    hostEl.style.zIndex = "2147483647";
    hostEl.style.pointerEvents = "auto";

    shadow = hostEl.attachShadow({ mode: "open" });

    styleEl = document.createElement("style");
    styleEl.textContent = `
      :host {
        all: initial;
      }
      *, *::before, *::after { box-sizing: border-box; }
      .sg-hidden { display: none !important; }
      .sg-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,.55);
        display: grid;
        place-items: end center;
        padding: 14px;
        opacity: 0;
        pointer-events: none;
        transition: opacity .2s ease;
      }
      .sg-overlay.open {
        opacity: 1;
        pointer-events: auto;
      }
      .sg-sheet {
        width: min(980px, 100%);
        max-height: min(92vh, 940px);
        background: linear-gradient(180deg, var(--card, #1f1f1f), var(--panel, #1b1b1b));
        color: var(--text, #eaeaea);
        border: 1px solid var(--border, rgba(255,255,255,.06));
        border-radius: 28px 28px 18px 18px;
        box-shadow: 0 18px 42px rgba(0,0,0,.38);
        overflow: hidden;
        transform: translateY(28px);
        transition: transform .22s ease;
        pointer-events: auto;
        display: grid;
        grid-template-rows: auto 1fr auto;
      }
      .sg-overlay.open .sg-sheet { transform: translateY(0); }
      .sg-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 16px 18px;
        border-bottom: 1px solid var(--border, rgba(255,255,255,.06));
        background: rgba(255,255,255,.015);
      }
      .sg-title-wrap { display: grid; gap: 4px; min-width: 0; }
      .sg-title {
        margin: 0;
        font: 800 18px/1.1 Inter, system-ui, sans-serif;
        letter-spacing: -0.02em;
      }
      .sg-subtitle {
        margin: 0;
        font: 600 12px/1.3 Inter, system-ui, sans-serif;
        color: var(--muted, #a8a8a8);
      }
      .sg-close {
        border: 1px solid var(--border, rgba(255,255,255,.06));
        background: var(--soft, rgba(255,255,255,.03));
        color: var(--text, #eaeaea);
        width: 40px;
        height: 40px;
        border-radius: 12px;
        cursor: pointer;
        display: grid;
        place-items: center;
        font-size: 18px;
      }
      .sg-content {
        overflow: auto;
        padding: 16px 18px 18px;
      }
      .sg-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.05fr) minmax(280px, .95fr);
        gap: 16px;
        justify-content: stretch;
      }
      .sg-grid.onecol {
        grid-template-columns: 1fr;
        justify-content: stretch;
      }
      .sg-grid.onecol > .sg-section:first-child {
        grid-column: 1 / -1;
        max-width: none;
      }
      .sg-grid:not(.onecol) > .sg-section {
        width: 100%;
        max-width: 760px;
      }
      .sg-grid:not(.onecol) > .sg-section:nth-child(2) {
        max-width: 280px;
      }
      .sg-grid.onecol > .sg-section {
        max-width: none;
      }
      @media (max-width: 900px) {
        .sg-sheet { width: 100%; max-height: 95vh; }
        .sg-grid { grid-template-columns: 1fr; }
      }
      .sg-card {
        background: linear-gradient(180deg, var(--card-2, #232323), var(--card, #1f1f1f));
        border: 1px solid var(--border, rgba(255,255,255,.06));
        border-radius: 22px;
        padding: 14px;
        min-width: 0;
      }
      .sg-section {
        display: grid;
        gap: 10px;
      }
      .sg-label {
        font: 800 12px/1.1 Inter, system-ui, sans-serif;
        letter-spacing: .08em;
        text-transform: uppercase;
        color: var(--muted, #a8a8a8);
      }
      .sg-input, .sg-textarea {
        width: 100%;
        border: 1px solid var(--border-strong, rgba(255,255,255,.08));
        background: rgba(255,255,255,.03);
        color: var(--text, #eaeaea);
        border-radius: 14px;
        padding: 13px 14px;
        font: 600 14px/1.4 Inter, system-ui, sans-serif;
        outline: none;
      }
      .sg-input::placeholder, .sg-textarea::placeholder { color: var(--muted, #a8a8a8); }
      .sg-input:focus, .sg-textarea:focus {
        border-color: rgba(107,33,168,.8);
        box-shadow: 0 0 0 3px rgba(107,33,168,.18);
      }
      .sg-textarea {
        min-height: 112px;
        resize: vertical;
      }
      .sg-row {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      .sg-row.wrap { flex-wrap: wrap; }
      .sg-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 11px;
        border-radius: 999px;
        font: 700 12px/1 Inter, system-ui, sans-serif;
        color: var(--muted, #a8a8a8);
        border: 1px solid var(--border, rgba(255,255,255,.06));
        background: var(--soft, rgba(255,255,255,.03));
      }
      .sg-pill strong { color: var(--text, #eaeaea); }
      .sg-button {
        width: 100%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        border: 1px solid var(--border, rgba(255,255,255,.06));
        background: linear-gradient(180deg, var(--accent-strong, #5b21b6), var(--accent, #6b21a8));
        color: #fff;
        border-radius: 16px;
        padding: 13px 16px;
        font: 800 14px/1 Inter, system-ui, sans-serif;
        cursor: pointer;
        box-shadow: 0 10px 22px rgba(91,33,182,.22);
      }
      .sg-button.secondary {
        background: var(--soft, rgba(255,255,255,.03));
        color: var(--text, #eaeaea);
        box-shadow: none;
      }
      .sg-button:disabled {
        opacity: .6;
        cursor: not-allowed;
      }
      .sg-preview {
        border-radius: 20px;
        border: 1px solid var(--border, rgba(255,255,255,.06));
        overflow: hidden;
        background: rgba(255,255,255,.02);
        cursor: pointer;
      }
      .sg-preview-media {
        width: 100%;
        aspect-ratio: 16 / 9;
        background: rgba(255,255,255,.03);
        display: grid;
        place-items: center;
        position: relative;
      }
      .sg-preview-media img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .sg-preview-fallback {
        padding: 16px;
        text-align: center;
        color: var(--muted, #a8a8a8);
        font: 700 14px/1.5 Inter, system-ui, sans-serif;
      }
      .sg-small {
        font: 600 12px/1.4 Inter, system-ui, sans-serif;
        color: var(--muted, #a8a8a8);
      }
      .sg-error {
        color: #ff6b6b;
        font: 700 13px/1.4 Inter, system-ui, sans-serif;
      }
      .sg-ok {
        color: #7ef0b1;
        font: 700 13px/1.4 Inter, system-ui, sans-serif;
      }
      .sg-list {
        display: grid;
        gap: 10px;
        max-height: min(52vh, 520px);
        overflow: auto;
        padding-right: 2px;
      }
      .sg-item {
        display: grid;
        grid-template-columns: 54px minmax(0,1fr);
        gap: 12px;
        align-items: center;
        padding: 12px;
        border-radius: 18px;
        border: 1px solid var(--border, rgba(255,255,255,.06));
        background: rgba(255,255,255,.025);
        cursor: pointer;
      }
      .sg-item:hover {
        border-color: var(--border-strong, rgba(255,255,255,.08));
        background: rgba(255,255,255,.04);
      }
      .sg-thumb {
        width: 54px;
        height: 54px;
        border-radius: 14px;
        overflow: hidden;
        background: rgba(255,255,255,.04);
        border: 1px solid var(--border, rgba(255,255,255,.06));
        flex-shrink: 0;
      }
      .sg-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .sg-item-title {
        margin: 0;
        font: 800 14px/1.2 Inter, system-ui, sans-serif;
      }
      .sg-item-title, .sg-item-desc { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .sg-card { overflow: hidden; }
      .sg-item-meta {
        margin-top: 5px;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .sg-item-desc {
        margin-top: 6px;
        color: var(--muted, #a8a8a8);
        font: 600 12px/1.45 Inter, system-ui, sans-serif;
      }
      .sg-footer {
        padding: 14px 18px 18px;
        border-top: 1px solid var(--border, rgba(255,255,255,.06));
        background: rgba(255,255,255,.012);
      }
      .sg-toast {
        position: fixed;
        top: 18px;
        left: 50%;
        transform: translateX(-50%);
        padding: 10px 14px;
        border-radius: 12px;
        font: 800 13px/1.2 Inter, system-ui, sans-serif;
        z-index: 2147483647;
        display: none;
        box-shadow: 0 12px 28px rgba(0,0,0,.22);
        pointer-events: none;
        max-width: min(90vw, 560px);
        text-align: center;
      }
      .sg-toast.purple { background: var(--accent-strong, #5b21b6); color: #fff; }
      .sg-toast.yellow { background: #e6b800; color: #222; }
      .sg-toast.red { background: #c00; color: #fff; }
      .sg-dialog {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,.56);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 2147483646;
        padding: 14px;
      }
      .sg-dialog.open { display: flex; }
      .sg-dialog-card {
        width: min(520px, 100%);
        background: linear-gradient(180deg, var(--card, #1f1f1f), var(--panel, #1b1b1b));
        color: var(--text, #eaeaea);
        border: 1px solid var(--border, rgba(255,255,255,.06));
        border-radius: 24px;
        box-shadow: 0 18px 42px rgba(0,0,0,.38);
        padding: 16px;
      }
      .sg-dialog-title {
        margin: 0 0 6px;
        font: 800 18px/1.1 Inter, system-ui, sans-serif;
      }
      .sg-dialog-text {
        margin: 0 0 14px;
        color: var(--muted, #a8a8a8);
        font: 600 13px/1.45 Inter, system-ui, sans-serif;
      }
      .sg-divider {
        height: 1px;
        background: var(--border, rgba(255,255,255,.06));
        margin: 8px 0;
      }
      .sg-spinner {
        width: 18px;
        height: 18px;
        border: 2px solid rgba(255,255,255,.18);
        border-top-color: var(--accent, #6b21a8);
        border-radius: 50%;
        animation: sgspin 1s linear infinite;
      }
      @keyframes sgspin { to { transform: rotate(360deg); } }
      .sg-topspace { height: 2px; }
      .sg-inline-link {
        color: inherit;
        font-weight: 800;
        text-decoration: underline;
      }
    `;
    shadow.appendChild(styleEl);

    const overlay = document.createElement("div");
    overlay.className = "sg-overlay";
    overlay.innerHTML = `
      <div class="sg-sheet" role="dialog" aria-modal="true" aria-label="Send gift">
        <div class="sg-header">
          <div class="sg-title-wrap">
            <h2 class="sg-title"></h2>
            <p class="sg-subtitle"></p>
          </div>
          <button class="sg-close" type="button" aria-label="Close">✕</button>
        </div>
        <div class="sg-content"></div>
        <div class="sg-footer"></div>
      </div>
    `;

    const toast = document.createElement("div");
    toast.className = "sg-toast";

    const dialog = document.createElement("div");
    dialog.className = "sg-dialog";
    dialog.innerHTML = `
      <div class="sg-dialog-card">
        <h3 class="sg-dialog-title"></h3>
        <p class="sg-dialog-text"></p>
        <div class="sg-section">
          <input class="sg-input sg-url-input" type="url" placeholder="https://..." autocomplete="off" />
          <div class="sg-row">
            <button class="sg-button secondary sg-dialog-cancel" type="button"></button>
            <button class="sg-button sg-dialog-ok" type="button"></button>
          </div>
        </div>
      </div>
    `;

    shadow.appendChild(overlay);
    shadow.appendChild(toast);
    shadow.appendChild(dialog);

    const approvedDialog = document.createElement("div");
    approvedDialog.className = "sg-dialog sg-approved-dialog";
    approvedDialog.innerHTML = `
      <div class="sg-dialog-card">
        <h3 class="sg-dialog-title"></h3>
        <div class="sg-section">
          <div class="sg-approved-list" style="max-height:60vh;overflow:auto;margin-top:8px;"></div>
          <div class="sg-row" style="justify-content:flex-end;margin-top:12px;gap:8px;">
            <button class="sg-button secondary sg-approved-close" type="button"></button>
          </div>
        </div>
      </div>
    `;
    shadow.appendChild(approvedDialog);
    approvedDialog.addEventListener("click", (e) => {
      if (e.target === approvedDialog) hideApprovedDialog();
    });

    document.body.appendChild(hostEl);

    shadow.querySelector(".sg-close").addEventListener("click", () => close());
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    dialog.addEventListener("click", (e) => {});
  }

  function toast(message, kind = "purple") {
    createRoot();
    const el = shadow.querySelector(".sg-toast");
    el.className = `sg-toast ${kind}`;
    el.textContent = message;
    el.style.display = "block";
    clearTimeout(el._timer);
    el._timer = setTimeout(() => {
      el.style.display = "none";
    }, 2600);
  }

  function showDialog({ title, text, placeholder, okText, cancelText, value = "", onOk }) {
    createRoot();
    const dialog = shadow.querySelector(".sg-dialog");
    const titleEl = dialog.querySelector(".sg-dialog-title");
    const textEl = dialog.querySelector(".sg-dialog-text");
    const input = dialog.querySelector(".sg-url-input");
    const ok = dialog.querySelector(".sg-dialog-ok");
    const cancel = dialog.querySelector(".sg-dialog-cancel");

    titleEl.textContent = title;
    textEl.textContent = text;
    input.placeholder = placeholder;
    input.value = value;
    ok.textContent = okText;
    cancel.textContent = cancelText;

    const cleanup = () => {
      ok.onclick = null;
      cancel.onclick = null;
      input.onkeydown = null;
    };

    const submit = () => {
      const val = input.value.trim();
      cleanup();
      hideDialog();
      onOk?.(val);
    };

    ok.onclick = submit;
    try {
      cancel.disabled = false;
    } catch (_) {}
    cancel.onclick = () => {
      cleanup();
      hideDialog();
    };
    input.onkeydown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submit();
      } else if (e.key === "Escape") {
        cleanup();
        hideDialog();
      }
    };

    dialog.classList.add("open");
    setTimeout(() => input.focus(), 30);
  }

  function hideDialog() {
    createRoot();
    shadow.querySelector(".sg-dialog").classList.remove("open");
  }

  function open() {
    let opts = arguments[0] || {};
    createRoot();
    state = {
      open: true,
      lang: FALLBACK_LANG,
      currentEmail: "",
      currentCoins: null,
      currentCoinsError: null,
      blockedUsers: new Set(),
      blockedUsersError: null,
      recipientEmail: String(opts.initialEmail || opts.recipientEmail || opts.email || "").trim(),
      recipientState: { status: "idle" },
      wasRecipientFocused: false,
      selectedGiftRef: opts.initialGiftRef || ((opts.ugcId && (opts.author || opts.ugcAuthor) && (typeof opts.typeId === "number" || typeof opts.ugcType === "number")) ? { ugcId: opts.ugcId, typeId: (typeof opts.typeId === "number" ? opts.typeId : opts.ugcType), author: (opts.author || opts.ugcAuthor) } : null),
      selectedGift: null,
      loadingSelectedGift: !!(opts.initialGiftRef || opts.ugcId),
      selectedGiftError: null,
      availableGiftOptions: [],
      loadingAvailableGiftOptions: false,
      availableGiftOptionsError: null,
      giftMessage: String(opts.initialMessage || "").slice(0, 190),
      giftImageUrl: String(opts.initialImageUrl || "").trim(),
      uploadingImage: false,
      sendingGift: false,
      showGiftPickerSheet: false,
      showApprovedUgcSheet: false,
      topError: null,
      approvedItems: [],
      loadingApproved: false,
      approvedError: null,
      filters: { q: "" }
    };

    const overlay = shadow.querySelector(".sg-overlay");
    overlay.classList.add("open");
    overlay.style.pointerEvents = "auto";
    try { hostEl.style.pointerEvents = "auto"; } catch (_) {}

    bootstrap().catch((err) => {
      state.topError = err?.message || "Firebase is not available on this page.";
      render();
      toast(state.topError, "red");
    });
  }

  function close() {
    if (!hostEl) return;
    state = null;
    const overlay = shadow.querySelector(".sg-overlay");
    overlay.classList.remove("open");
    overlay.style.pointerEvents = "none";
    try { hostEl.style.pointerEvents = "none"; } catch (_) {}
    setTimeout(() => {
      if (hostEl && hostEl.parentNode) hostEl.parentNode.removeChild(hostEl);
      hostEl = null;
      shadow = null;
      styleEl = null;
    }, 220);
  }

  async function bootstrap() {
    const auth = getAuth();
    const user = auth.currentUser;
    const email = user?.email || "";
    if (!email) {
      state.currentEmail = "";
      state.lang = await resolveLanguage("");
      render();
      return;
    }

    state.currentEmail = email;
    state.lang = await resolveLanguage(email);
    render();

    loadCurrentProfileData();
    if (state.selectedGiftRef) loadSelectedGift();
    if (state.showApprovedUgcSheet) loadApprovedItems();
    if (state.recipientEmail) lookupRecipient();
  }

  function setTopError(msg, kind = "red") {
    state.topError = msg;
    render();
    toast(msg, kind);
  }

  async function loadCurrentProfileData() {
    try {
      const snap = await getFirestore().collection("user_data").doc(state.currentEmail).get();
      const rawCoins = snap.exists ? snap.get("coins") : 0;
      const parsedCoins = Number(rawCoins ?? 0);
      state.currentCoins = Number.isFinite(parsedCoins) ? parsedCoins : 0;
      const raw = snap.exists ? snap.get("blockedUsers") : [];
      state.blockedUsers = new Set(Array.isArray(raw) ? raw.filter((x) => typeof x === "string").map((x) => x.toLowerCase()) : []);
    } catch (err) {
      state.currentCoinsError = err?.message || "Failed to load data.";
      state.currentCoins = 0;
      state.blockedUsers = new Set();
    }
    render();
  }

  async function lookupRecipient(forceEmail) {
    const email = String(forceEmail ?? state.recipientEmail ?? "").trim();
    if (!email) {
      state.recipientState = { status: "idle" };
      render();
      return;
    }

    state.recipientState = { status: "loading" };
    render();

    try {
      const snap = await getFirestore().collection("user_data").doc(email).get();
      if (!snap.exists) {
        state.recipientState = { status: "error", message: t("recipientNotFound", state.lang) };
      } else {
        const profile = {
          email,
          displayName: String(snap.get("display name") || "").trim(),
          profilePicture: String(snap.get("profile_picture") || "").trim(),
          profilePictureFrame: String(snap.get("profile_picture_frame") || "").trim(),
          isVerified: snap.get("is_verified") === true
        };
        state.recipientState = { status: "ready", profile };
      }
    } catch (err) {
      state.recipientState = {
        status: "error",
        message: err?.code === "permission-denied"
          ? t("recipientBlocked", state.lang)
          : (err?.message || t("recipientBlocked", state.lang))
      };
    }
    render();
  }

  async function loadSelectedGift() {
    const ref = state.selectedGiftRef;
    if (!ref) {
      state.loadingSelectedGift = false;
      state.selectedGift = null;
      state.selectedGiftError = null;
      render();
      return;
    }

    state.loadingSelectedGift = true;
    state.selectedGiftError = null;
    render();

    try {
      const item = await loadUgcItem(ref.author, ref.typeId, ref.ugcId);
      state.selectedGift = item;
      if (!item) state.selectedGiftError = t("itemNotFound", state.lang);
    } catch (err) {
      state.selectedGift = null;
      state.selectedGiftError = err?.message || t("itemNotFound", state.lang);
    } finally {
      state.loadingSelectedGift = false;
      render();
    }
  }

  async function loadApprovedItems() {
    if (approvedCachePromise) return approvedCachePromise;
    approvedCachePromise = (async () => {
      try {
        const res = await fetch(APPROVED_JSON_URL, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const items = Array.isArray(data?.marketplace?.items) ? data.marketplace.items : [];
        return items.map((item) => ({
          id: String(item.id || ""),
          name: String(item.name || ""),
          icon: String(item.icon || ""),
          author: String(item.author || ""),
          type: Number.isFinite(Number(item.type)) ? Number(item.type) : 1,
          subtype: String(item.subtype || "")
        })).filter((x) => x.id && x.name && x.author).sort((a, b) => a.name.localeCompare(b.name));
      } catch (err) {
        approvedCachePromise = null;
        throw err;
      }
    })();
    return approvedCachePromise;
  }

  async function openApprovedSheet() {
    state.showApprovedUgcSheet = true;
    state.loadingApproved = true;
    state.approvedError = null;
    render();
    try {
      state.approvedItems = await loadApprovedItems();
      if (!state.approvedItems.length) state.approvedError = t("approvedEmpty", state.lang);
    } catch (err) {
      state.approvedError = err?.message || t("approvedEmpty", state.lang);
    } finally {
      state.loadingApproved = false;
      render();
    }
  }

  async function loadUgcItem(author, typeId, ugcId) {
    const collectionName = typeId === 0 ? "store-items" : "development-items";
    const snap = await getFirestore().collection("ugc").doc(author).collection(collectionName).doc(ugcId).get();
    if (!snap.exists) return null;
    const onSale = snap.get("on_sale");
    if (onSale === false) return null;
    return {
      name: String(snap.get("name") || snap.get("title") || ""),
      image: String(snap.get("image") || "").trim(),
      price: Number(snap.get("price") ?? 0),
      verified: snap.get("verified") === true
    };
  }

  function getRecipientProfile() {
    return state.recipientState.status === "ready" ? state.recipientState.profile : null;
  }

  function getSelectedGiftState() {
    return state.selectedGift;
  }

  function getCanAfford() {
    const gift = getSelectedGiftState();
    const coins = state.currentCoins;
    if (!gift || coins == null) return false;
    return coins >= Number(gift.price || 0);
  }

  function getIsRecipientBlocked() {
    const profile = getRecipientProfile();
    return !!(profile && state.blockedUsers.has(profile.email.toLowerCase()));
  }

  function render() {
    if (!shadow || !state) return;
    const overlay = shadow.querySelector(".sg-overlay");
    const titleEl = shadow.querySelector(".sg-title");
    const subtitleEl = shadow.querySelector(".sg-subtitle");
    const content = shadow.querySelector(".sg-content");
    const footer = shadow.querySelector(".sg-footer");

    titleEl.textContent = t("title", state.lang);
    subtitleEl.textContent = "";

    const recipient = getRecipientProfile();
    const selectedGift = getSelectedGiftState();
    const canAfford = getCanAfford();
    const blocked = getIsRecipientBlocked();
    const canOpenConfirm = !!selectedGift && !!recipient && !!state.giftImageUrl && !state.uploadingImage && !state.sendingGift && canAfford && !blocked;
    const isSelf = recipient && state.currentEmail && recipient.email.toLowerCase() === state.currentEmail.toLowerCase();

    const recipientStateHtml = (() => {
      const st = state.recipientState;
      if (st.status === "idle") return "";
      if (st.status === "loading") {
        return `<div class="sg-row"><div class="sg-spinner"></div><div class="sg-small">${escapeHtml(t("recipientLoading", state.lang))}</div></div>`;
      }
      if (st.status === "error") {
        return `<div class="sg-error">${escapeHtml(st.message)}</div>`;
      }
      if (st.status === "ready") {
        const profile = st.profile;
        return `
          <div class="sg-card">
            <div class="sg-row" style="align-items:center;">
              <div class="sg-thumb" style="width:52px;height:52px;border-radius:50%;">
                <img src="${escapeHtml(profile.profilePicture || "file:///android_asset/default_pfp.png")}" alt="">
              </div>
              <div style="min-width:0;flex:1;">
                <div class="sg-item-title">${escapeHtml(profile.displayName || profile.email)}</div>
                <div class="sg-item-desc">${escapeHtml(profile.email)}</div>
              </div>
              ${profile.isVerified ? `<span class="sg-pill"><img src="https://darkpurpleof.github.io/assets/verified.png" alt="verified" style="width:18px;height:18px;display:block;" /></span>` : ""}
            </div>
            ${blocked ? `<div class="sg-error" style="margin-top:10px;">${escapeHtml(t("youBlockedUser", state.lang))}</div>` : ""}
            ${isSelf ? `<div class="sg-error" style="margin-top:10px;">${escapeHtml(t("cantSendToSelf", state.lang))}</div>` : ""}
          </div>
        `;
      }
      return "";
    })();

    const selectedGiftHtml = (() => {
      if (state.loadingSelectedGift && state.selectedGiftRef) {
        return `<div class="sg-card"><div class="sg-row"><div class="sg-spinner"></div><div class="sg-small">${escapeHtml(t("loadingGift", state.lang))}</div></div></div>`;
      }
      if (selectedGift) {
        return `
          <div class="sg-preview" id="sg-selected-gift-preview">
            <div class="sg-preview-media">
              ${selectedGift.image ? `<img src="${escapeHtml(selectedGift.image)}" alt="">` : `<div class="sg-preview-fallback">${escapeHtml(t("itemNotFound", state.lang))}</div>`}
            </div>
            <div class="sg-card" style="border:none;border-top:1px solid var(--border, rgba(255,255,255,.06));border-radius:0;">
              <div class="sg-row" style="justify-content:space-between;align-items:flex-start;">
                <div style="min-width:0;flex:1;">
                  <div class="sg-item-title">${escapeHtml(selectedGift.name || "")}</div>
                  <div class="sg-item-desc">${selectedGift.price === -1 ? escapeHtml(t("notForSale", state.lang)) : `${escapeHtml(t("price", state.lang))}: ${escapeHtml(selectedGift.price)}`}</div>
                </div>
                <button type="button" class="sg-button secondary" id="sg-change-gift-btn" style="width:auto;padding:10px 12px;border-radius:12px;">${escapeHtml(t("selectGift", state.lang))}</button>
              </div>
            </div>
          </div>
        `;
      }
      return `
        <div class="sg-card">
          <div class="sg-section">
            <div class="sg-row" style="justify-content:space-between;align-items:center;">
              <div>
                <div class="sg-label">${escapeHtml(t("yourGift", state.lang))}</div>
                <div class="sg-small">${escapeHtml(t("chooseGiftHint", state.lang))}</div>
              </div>
              <button type="button" class="sg-button secondary" id="sg-open-approved-btn" style="width:auto;padding:10px 12px;border-radius:12px;">${escapeHtml(t("selectGift", state.lang))}</button>
            </div>
          </div>
        </div>
      `;
    })();

    const previewHtml = (() => {
      if (state.giftImageUrl && isValidUrl(state.giftImageUrl)) {
        return `
          <div class="sg-preview" id="sg-image-preview">
            <div class="sg-preview-media">
              <img src="${escapeHtml(state.giftImageUrl)}" alt="">
            </div>
          </div>
        `;
      }
      return `
        <div class="sg-preview" id="sg-image-preview">
          <div class="sg-preview-media">
            <div class="sg-preview-fallback">
              ${escapeHtml(t("openImageDialog", state.lang))}
            </div>
          </div>
        </div>
      `;
    })();

    const recipientLabel = t("recipient", state.lang);
    const messageLabel = t("messageOptional", state.lang);

    const contentEl = shadow.querySelector('.sg-content');
    let prevScroll = 0;
    let focusedId = null;
    let selStart = null;
    let selEnd = null;
    try {
      if (contentEl) prevScroll = contentEl.scrollTop || 0;
      const active = shadow.activeElement;
      if (active && active.id) {
        focusedId = active.id;
        if (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') {
          try { selStart = active.selectionStart; selEnd = active.selectionEnd; } catch (e) {}
        }
      }
    } catch (e) {}

    const leftHtml = `
      <div class="sg-section">
        <div class="sg-card sg-section">
          <div class="sg-row" style="justify-content:space-between;align-items:center;">
            <div>
              <div class="sg-label">${escapeHtml(t("previewImage", state.lang))}</div>
              <div class="sg-small">${escapeHtml(t("imageHint", state.lang))}</div>
            </div>
            <span class="sg-pill">${escapeHtml(t("enterUrl", state.lang))}</span>
          </div>
          ${previewHtml}
          ${state.uploadingImage ? `<div class="sg-row"><div class="sg-spinner"></div><div class="sg-small">${escapeHtml(t("loading", state.lang))}</div></div>` : ""}
        </div>

        <div class="sg-card sg-section">
          <div class="sg-row" style="justify-content:space-between;align-items:center;">
            <div>
              <div class="sg-label">${escapeHtml(t("sendTo", state.lang))}</div>
              <div class="sg-small">${escapeHtml(t("recipient", state.lang))}</div>
            </div>
            <span class="sg-pill">${escapeHtml(t("recipient", state.lang))}</span>
          </div>
          <input class="sg-input" id="sg-recipient-input" type="email" value="${escapeHtml(state.recipientEmail)}" placeholder="${escapeHtml(recipientLabel)}" />
          <div id="sg-recipient-state">${recipientStateHtml}</div>
        </div>

        <div class="sg-card sg-section">
          <div class="sg-row" style="justify-content:space-between;align-items:center;">
            <div>
              <div class="sg-label">${escapeHtml(t("yourGift", state.lang))}</div>
              <div class="sg-small">${escapeHtml(t("chooseGiftHint", state.lang))}</div>
            </div>
            <span class="sg-pill">${escapeHtml(t("approvedUgc", state.lang))}</span>
          </div>
          ${selectedGiftHtml}
        </div>

        <div class="sg-card sg-section">
          <div class="sg-row" style="justify-content:space-between;align-items:center;">
            <div>
              <div class="sg-label">${escapeHtml(t("addMessage", state.lang))}</div>
              <div class="sg-small">${escapeHtml(t("messageOptional", state.lang))}</div>
            </div>
            <span class="sg-pill">${escapeHtml(t("messageOptional", state.lang))}</span>
          </div>
          <textarea class="sg-textarea" id="sg-message-input" maxlength="190" placeholder="${escapeHtml(t("addMessage", state.lang))}">${escapeHtml(state.giftMessage)}</textarea>
          <div class="sg-row wrap">
            <span class="sg-pill"><strong>${escapeHtml(String(state.giftMessage.length))}</strong>/190</span>
            ${state.currentCoinsError ? `<span class="sg-pill" style="color:#ff8080;">${escapeHtml(state.currentCoinsError)}</span>` : ""}
            ${state.topError ? `<span class="sg-pill" style="color:#ff8080;">${escapeHtml(state.topError)}</span>` : ""}
          </div>
        </div>
      </div>
    `;

    let rightHtml = "";
    if (state.loadingApproved || state.approvedError) {
      rightHtml = `
        <div class="sg-section">
          ${state.loadingApproved ? `<div class="sg-row"><div class="sg-spinner"></div><div class="sg-small">${escapeHtml(t("loadingApproved", state.lang))}</div></div>` : ""}
          ${state.approvedError ? `<div class="sg-error">${escapeHtml(state.approvedError)}</div>` : ""}
        </div>
      `;
    }

    content.innerHTML = `
      <div class="sg-grid">
        ${leftHtml}
        ${rightHtml}
      </div>
    `;

    try {
      const newContent = shadow.querySelector('.sg-content');
      if (newContent) newContent.scrollTop = prevScroll;
      if (focusedId) {
        const newFocused = shadow.getElementById ? shadow.getElementById(focusedId) : shadow.querySelector('#' + CSS.escape(focusedId));
        if (newFocused) {
          newFocused.focus({ preventScroll: true });
          if (selStart != null && (newFocused.tagName === 'INPUT' || newFocused.tagName === 'TEXTAREA')) {
            try { newFocused.setSelectionRange(selStart, selEnd || selStart); } catch (e) {}
          }
        }
      }
    } catch (e) {}

    try {
      const gridEl = shadow.querySelector('.sg-grid');
      if (gridEl) {
        if (!rightHtml || !String(rightHtml).trim()) gridEl.classList.add('onecol'); else gridEl.classList.remove('onecol');
      }
    } catch (e) {}

    footer.innerHTML = `
      <div class="sg-row" style="justify-content:space-between;align-items:center;flex-wrap:wrap;">
        <div class="sg-small">${escapeHtml(t("tos", state.lang))}</div>
        <div class="sg-row" style="gap:8px;">
          <button class="sg-button secondary" id="sg-cancel-btn" type="button" style="width:auto;padding:11px 14px;border-radius:14px;">${escapeHtml(t("cancel", state.lang))}</button>
          <button class="sg-button" id="sg-send-btn-bottom" type="button" style="width:auto;padding:11px 16px;border-radius:14px;" ${canOpenConfirm ? "" : "disabled"}>${escapeHtml(state.sendingGift ? t("sending", state.lang) : t("confirm", state.lang))}</button>
        </div>
      </div>
    `;

    bindEvents();
  }

  function renderApprovedList() {
    const q = String(state.filters.q || "").trim().toLowerCase();
    const items = (state.approvedItems || []).filter((item) => {
      if (!q) return true;
      return [item.name, item.author, item.subtype, item.id].some((v) => String(v || "").toLowerCase().includes(q));
    });

    if (state.loadingApproved) {
      return `<div class="sg-row"><div class="sg-spinner"></div><div class="sg-small">${escapeHtml(t("loadingApproved", state.lang))}</div></div>`;
    }
    if (state.approvedError) {
      return `<div class="sg-error">${escapeHtml(state.approvedError)}</div>`;
    }
    if (!items.length) {
      return `<div class="sg-small">${escapeHtml(t("approvedEmpty", state.lang))}</div>`;
    }

    return items.map((item) => `
      <div class="sg-item" data-approved-id="${escapeHtml(item.id)}" data-approved-author="${escapeHtml(item.author)}" data-approved-type="${escapeHtml(item.type)}">
        <div class="sg-thumb">${item.icon ? `<img src="${escapeHtml(item.icon)}" alt="">` : ""}</div>
        <div>
          <div class="sg-item-title">${escapeHtml(item.name)}</div>
          <div class="sg-item-meta">
            <span class="sg-pill">${escapeHtml(t("subtype", state.lang))}: <strong>${escapeHtml(item.subtype || "—")}</strong></span>
            <span class="sg-pill">${escapeHtml(t("author", state.lang))}: <strong>${escapeHtml(item.author || "—")}</strong></span>
          </div>
          <div class="sg-item-desc">${escapeHtml(item.id)}</div>
        </div>
      </div>
    `).join("");
  }

  function bindEvents() {
    if (!shadow || !state) return;

    const overlay = shadow.querySelector(".sg-overlay");
    const cancelBtn = shadow.querySelector("#sg-cancel-btn");
    const sendBtn = shadow.querySelector("#sg-send-btn");
    const sendBtnBottom = shadow.querySelector("#sg-send-btn-bottom");
    const openImageBtn = shadow.querySelector("#sg-open-image-btn");
    const imagePreview = shadow.querySelector("#sg-image-preview");
    const recipientInput = shadow.querySelector("#sg-recipient-input");
    const messageInput = shadow.querySelector("#sg-message-input");
    const openApprovedBtn = shadow.querySelector("#sg-open-approved-btn");
    const openApproved2Btn = shadow.querySelector("#sg-open-approved-2-btn");
    const closeApprovedBtn = shadow.querySelector("#sg-close-approved-btn");
    const changeGiftBtn = shadow.querySelector("#sg-change-gift-btn");
    const approvedSearch = shadow.querySelector("#sg-approved-search");

    const sendAction = () => performSend();

    cancelBtn && (cancelBtn.onclick = () => close());
    sendBtn && (sendBtn.onclick = sendAction);
    sendBtnBottom && (sendBtnBottom.onclick = sendAction);

    openImageBtn && (openImageBtn.onclick = () => openImageDialog());
    imagePreview && (imagePreview.onclick = () => openImageDialog());

    if (recipientInput) {
      recipientInput.oninput = (e) => {
        state.recipientEmail = e.target.value;
        state.recipientState = { status: "idle" };
      };
      recipientInput.onblur = () => lookupRecipient();
    }

    if (messageInput) {
      messageInput.oninput = (e) => {
        state.giftMessage = e.target.value.slice(0, 190);
        render();
      };
    }

    openApprovedBtn && (openApprovedBtn.onclick = async () => {
      await loadApprovedIfNeeded();
      showApprovedDialog();
    });
    openApproved2Btn && (openApproved2Btn.onclick = async () => {
      await loadApprovedIfNeeded();
      showApprovedDialog();
    });

    if (changeGiftBtn) {
      changeGiftBtn.onclick = async () => {
        await loadApprovedIfNeeded();
        showApprovedDialog();
      };
    }

    if (approvedSearch) {
      approvedSearch.oninput = (e) => {
        state.filters.q = e.target.value;
        render();
      };
    }
  }

  async function loadApprovedIfNeeded() {
    if (state.loadingApproved || state.approvedItems.length) return;
    state.loadingApproved = true;
    state.approvedError = null;
    render();
    try {
      state.approvedItems = await loadApprovedItems();
      if (!state.approvedItems.length) state.approvedError = t("approvedEmpty", state.lang);
    } catch (err) {
      state.approvedError = err?.message || t("approvedEmpty", state.lang);
    } finally {
      state.loadingApproved = false;
      render();
    }
  }

  function renderApprovedDialogList() {
    const q = String(state.filters.q || "").trim().toLowerCase();
    const items = (state.approvedItems || []).filter((item) => {
      if (!q) return true;
      return [item.name, item.subtype, String(item.type)].some((v) => String(v || "").toLowerCase().includes(q));
    });

    if (state.loadingApproved) {
      return `<div class="sg-row"><div class="sg-spinner"></div><div class="sg-small">${escapeHtml(t("loadingApproved", state.lang))}</div></div>`;
    }
    if (state.approvedError) {
      return `<div class="sg-error">${escapeHtml(state.approvedError)}</div>`;
    }
    if (!items.length) return `<div class="sg-small">${escapeHtml(t("approvedEmpty", state.lang))}</div>`;

    return items.map((item) => `
      <div class="sg-item" data-approved-id="${escapeHtml(item.id)}" data-approved-type="${escapeHtml(String(item.type))}">
        <div class="sg-thumb">${item.icon ? `<img src="${escapeHtml(item.icon)}" alt="">` : ""}</div>
        <div>
          <div class="sg-item-title">${escapeHtml(item.name)}</div>
          <div class="sg-item-meta">
            <span class="sg-pill">${escapeHtml(t("subtype", state.lang))}: <strong>${escapeHtml(item.subtype || "—")}</strong></span>
          </div>
        </div>
      </div>
    `).join("");
  }

  function showApprovedDialog() {
    createRoot();
    const dlg = shadow.querySelector('.sg-approved-dialog');
    if (!dlg) return;
    dlg.querySelector('.sg-dialog-title').textContent = t('approvedUgc', state.lang);
    dlg.querySelector('.sg-approved-close').textContent = t('close', state.lang);
    const list = dlg.querySelector('.sg-approved-list');
    list.innerHTML = renderApprovedDialogList();

    list.querySelectorAll('[data-approved-id]').forEach((el) => {
      el.onclick = async () => {
        const id = el.getAttribute('data-approved-id') || '';
        const type = Number(el.getAttribute('data-approved-type') || 1);
        const item = (state.approvedItems || []).find((it) => String(it.id) === String(id));
        const author = item ? (item.author || '') : '';
        state.selectedGiftRef = { ugcId: id, author, typeId: type === 0 ? 0 : 1 };
        state.selectedGift = null;
        state.selectedGiftError = null;
        state.loadingSelectedGift = true;
        hideApprovedDialog();
        render();
        await loadSelectedGift();
      };
    });

    dlg.classList.add('open');
    const closeBtn = dlg.querySelector('.sg-approved-close');
    closeBtn.onclick = () => hideApprovedDialog();
  }

  function hideApprovedDialog() {
    createRoot();
    const dlg = shadow.querySelector('.sg-approved-dialog');
    if (dlg) dlg.classList.remove('open');
  }

  function openImageDialog() {
    showDialog({
      title: t("enterUrl", state.lang),
      text: t("imageHint", state.lang),
      placeholder: "https://",
      okText: t("useUrl", state.lang),
      cancelText: t("cancel", state.lang),
      value: state.giftImageUrl,
      onOk: (value) => {
        const url = value.trim();
        if (!url) {
          setTopError(t("invalidUrl", state.lang), "red");
          return;
        }
        if (!isValidUrl(url)) {
          setTopError(t("invalidUrl", state.lang), "red");
          return;
        }
        state.giftImageUrl = url;
        render();
        toast(t("loaded", state.lang), "purple");
      }
    });
  }

  function canSend() {
    const recipient = getRecipientProfile();
    const gift = getSelectedGiftState();
    if (!state.currentEmail) return { ok: false, error: t("noAccount", state.lang) };
    if (!gift) return { ok: false, error: t("noGiftSelected", state.lang) };
    if (gift.price === -1) return { ok: false, error: t("notForSale", state.lang) };
    if (!recipient || !state.recipientEmail.trim()) return { ok: false, error: t("noRecipient", state.lang) };
    if (!state.giftImageUrl || !isValidUrl(state.giftImageUrl)) return { ok: false, error: t("imageRequired", state.lang) };
    if (recipient.email.toLowerCase() === state.currentEmail.toLowerCase()) return { ok: false, error: t("cantSendToSelf", state.lang) };
    if (state.blockedUsers.has(recipient.email.toLowerCase())) return { ok: false, error: t("blockedSending", state.lang) };
    if (!getCanAfford()) return { ok: false, error: t("notEnoughCoins", state.lang) };
    return { ok: true };
  }

  async function performSend() {
    state.recipientEmail = String(state.recipientEmail || "").trim();
    await lookupRecipient();
    const check = canSend();
    if (!check.ok) {
      setTopError(check.error, "red");
      return;
    }

    const recipient = getRecipientProfile();
    const gift = getSelectedGiftState();
    const ref = state.selectedGiftRef;
    if (!recipient || !gift || !ref) {
      setTopError(t("error", state.lang), "red");
      return;
    }

    state.sendingGift = true;
    state.topError = null;
    render();

    try {
      await sendGift({
        currentEmail: state.currentEmail,
        recipientEmail: recipient.email.trim(),
        recipientName: recipient.displayName || recipient.email,
        giftMessage: state.giftMessage,
        ugc: gift,
        giftImageUrl: state.giftImageUrl,
        ugcId: ref.ugcId,
        typeId: ref.typeId,
        author: ref.author,
        lang: state.lang
      });

      toast(t("success", state.lang), "purple");
      state.sendingGift = false;
      render();
      setTimeout(() => {
        close();
      }, 250);
    } catch (err) {
      state.sendingGift = false;
      state.topError = err?.message || t("error", state.lang);
      render();
      toast(state.topError, "red");
    }
  }

  async function sendGift({ currentEmail, recipientEmail, recipientName, giftMessage, ugc, giftImageUrl, ugcId, typeId, author, lang }) {
    const db = getFirestore();
    const typeCollection = typeId === 0 ? "store-items" : "development-items";

    const currentUserRef = db.collection("user_data").doc(currentEmail);
    const sentRoot = db.collection("gifts").doc(currentEmail).collection("sent");
    const receivedRoot = db.collection("gifts").doc(recipientEmail).collection("received");
    const txRoot = db.collection("transactions").doc(currentEmail).collection("records");

    const duplicateQuery = await db.collection("gifts")
      .doc(currentEmail)
      .collection("sent")
      .where("gift_ugcid", "==", ugcId)
      .where("gift_sentTo", "==", recipientEmail)
      .get();

    if (!duplicateQuery.empty) {
      throw new Error(t("duplicateGift", lang));
    }

    const giftDocId = db.collection("gifts").doc().id;
    const txDocId = txRoot.doc().id;

    await db.runTransaction(async (transaction) => {
      const currentSnap = await transaction.get(currentUserRef);
      const currentCoins = Number(String(currentSnap.get("coins") || "0"));
      const price = Number(ugc.price || 0);

      const blockedList = currentSnap.get("blockedUsers");
      if (Array.isArray(blockedList) && blockedList.some((item) => typeof item === "string" && item.toLowerCase() === recipientEmail.toLowerCase())) {
        throw new Error(t("blockedSending", lang));
      }

      if (recipientEmail.trim().toLowerCase() === currentEmail.toLowerCase()) {
        throw new Error(t("cantSendToSelf", lang));
      }

      if (currentCoins < price) {
        throw new Error(t("notEnoughCoins", lang));
      }

      const newCoins = currentCoins - price;

      const sentData = {
        giftcard_img: giftImageUrl,
        gift_author: author,
        gift_ugcid: ugcId,
        gift_typeid: typeId,
        gift_sentTo: recipientEmail,
        gift_message: giftMessage
      };

      const receivedData = {
        giftcard_img: giftImageUrl,
        gift_author: author,
        gift_ugcid: ugcId,
        gift_typeid: typeId,
        gift_sentBy: currentEmail,
        gift_message: giftMessage,
        gift_claimed: false
      };

      const txData = {
        amount: price,
        date: firebase.firestore.FieldValue.serverTimestamp(),
        description: t("giftDescription", lang, { name: recipientName }),
        image: ugc.image || "",
        source: currentEmail,
        type: "outgoing"
      };

      transaction.set(sentRoot.doc(giftDocId), sentData);
      transaction.set(receivedRoot.doc(giftDocId), receivedData);
      transaction.set(txRoot.doc(txDocId), txData);
      transaction.update(currentUserRef, "coins", String(newCoins));
    });

    void typeCollection;
  }

  return {
    open,
    close,
    toast,
    setLanguage(lang) {
      if (state && isAllowedLang(lang)) {
        state.lang = lang;
        render();
      }
    },
    getState() {
      return state ? JSON.parse(JSON.stringify({
        ...state,
        blockedUsers: Array.from(state.blockedUsers || [])
      })) : null;
    }
  };
});