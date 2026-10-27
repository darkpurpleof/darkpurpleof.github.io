/* sendgift.js  (v3)
   Reusable bottom sheet for sending UGC gifts.
   Requires Firebase compat globals: firebase.auth(), firebase.firestore()
   Optional: /uploader.js (window.CatboxUploader) to upload the gift image from a file.

   Sending goes through the backend function (send-gift.mjs):
     POST <endpoint>   Authorization: Bearer <Firebase ID token>
   The server decides sender, price and item state, and writes coins/gift/transaction atomically.
   The client only READS Firestore (recipient lookup, balance, item preview).

   Configure the endpoint once (if the page is not served from the same origin as the function):
     SendGiftSheet.configure({ endpoint: "https://YOUR-SITE.netlify.app/economy/sendgift" });
   or per call:  SendGiftSheet.open({ endpoint: "...", ... })
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
  const MAX_MESSAGE = 190;
  const REQUEST_TIMEOUT_MS = 20000;
  const EMOJIS = ["🎉", "❤️", "🎂", "🙏", "🔥", "✨"];
  const Z_TOP = "2147483647";
  // lowered while the uploader runs so its own dialogs/overlays (max z-index, appended later) show above the sheet
  const Z_UPLOADING = "2147483000";

  // Public path of the netlify function (see netlify.toml). Override with configure() / open({endpoint}).
  let ENDPOINT = root.SENDGIFT_ENDPOINT || "/economy/sendgift";

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

  // Strings for the UI + backend error codes + uploader (merged into I18N below)
  const I18N_EXTRA = {
    en: {
      accountBanned: "This account is banned.",
      sessionExpired: "Your session expired. Please sign in again.",
      networkError: "Network error. Check your connection and try again.",
      serverError: "The server had a problem. Please try again.",
      invalidRequest: "Some details are invalid. Check them and try again.",
      livePreview: "Live preview",
      from: "From",
      to: "To",
      you: "You",
      balance: "Your balance",
      afterSending: "After sending",
      useItemImage: "Use item image",
      imageHttps: "Image URL must start with https://",
      noResults: "No results",
      messagePlaceholder: "Write something nice…",
      messageEmpty: "Your message will appear here",
      onItsWay: "On its way to {name}",
      change: "Change",
      free: "Free",
      imageFailed: "Image couldn't be loaded",
      userFound: "User found",
      back: "Back",
      done: "Done",
      uploadImage: "Upload image",
      uploadingImage: "Uploading…",
      uploaded: "Image uploaded",
      uploadFailed: "Upload failed.",
      notImage: "Please choose an image file.",
      uploaderMissing: "Uploads are not available on this page."
    },
    es: {
      accountBanned: "Esta cuenta está suspendida.",
      sessionExpired: "Tu sesión expiró. Inicia sesión de nuevo.",
      networkError: "Error de red. Revisa tu conexión e inténtalo de nuevo.",
      serverError: "El servidor tuvo un problema. Inténtalo de nuevo.",
      invalidRequest: "Algunos datos no son válidos. Revísalos e inténtalo de nuevo.",
      livePreview: "Vista previa",
      from: "De",
      to: "Para",
      you: "Tú",
      balance: "Tu saldo",
      afterSending: "Después de enviar",
      useItemImage: "Usar imagen del objeto",
      imageHttps: "La URL de la imagen debe empezar con https://",
      noResults: "Sin resultados",
      messagePlaceholder: "Escribe algo bonito…",
      messageEmpty: "Tu mensaje aparecerá aquí",
      onItsWay: "En camino a {name}",
      change: "Cambiar",
      free: "Gratis",
      imageFailed: "No se pudo cargar la imagen",
      userFound: "Usuario encontrado",
      back: "Atrás",
      done: "Listo",
      uploadImage: "Subir imagen",
      uploadingImage: "Subiendo…",
      uploaded: "Imagen subida",
      uploadFailed: "Error al subir.",
      notImage: "Elige un archivo de imagen.",
      uploaderMissing: "Las subidas no están disponibles en esta página."
    },
    de: {
      accountBanned: "Dieses Konto ist gesperrt.",
      sessionExpired: "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.",
      networkError: "Netzwerkfehler. Prüfe deine Verbindung und versuche es erneut.",
      serverError: "Der Server hatte ein Problem. Bitte versuche es erneut.",
      invalidRequest: "Einige Angaben sind ungültig. Bitte prüfen und erneut versuchen.",
      livePreview: "Live-Vorschau",
      from: "Von",
      to: "An",
      you: "Du",
      balance: "Dein Guthaben",
      afterSending: "Nach dem Senden",
      useItemImage: "Objektbild verwenden",
      imageHttps: "Die Bild-URL muss mit https:// beginnen",
      noResults: "Keine Ergebnisse",
      messagePlaceholder: "Schreib etwas Nettes…",
      messageEmpty: "Deine Nachricht erscheint hier",
      onItsWay: "Unterwegs zu {name}",
      change: "Ändern",
      free: "Gratis",
      imageFailed: "Bild konnte nicht geladen werden",
      userFound: "Benutzer gefunden",
      back: "Zurück",
      done: "Fertig",
      uploadImage: "Bild hochladen",
      uploadingImage: "Wird hochgeladen…",
      uploaded: "Bild hochgeladen",
      uploadFailed: "Upload fehlgeschlagen.",
      notImage: "Bitte eine Bilddatei wählen.",
      uploaderMissing: "Uploads sind auf dieser Seite nicht verfügbar."
    },
    ja: {
      accountBanned: "このアカウントは停止されています。",
      sessionExpired: "セッションの有効期限が切れました。再度サインインしてください。",
      networkError: "ネットワークエラーです。接続を確認してもう一度お試しください。",
      serverError: "サーバーで問題が発生しました。もう一度お試しください。",
      invalidRequest: "入力内容に無効なものがあります。確認してもう一度お試しください。",
      livePreview: "ライブプレビュー",
      from: "送信者",
      to: "宛先",
      you: "あなた",
      balance: "所持コイン",
      afterSending: "送信後",
      useItemImage: "アイテム画像を使う",
      imageHttps: "画像URLはhttps://で始まる必要があります",
      noResults: "結果なし",
      messagePlaceholder: "素敵なメッセージを書こう…",
      messageEmpty: "ここにメッセージが表示されます",
      onItsWay: "{name} に向かっています",
      change: "変更",
      free: "無料",
      imageFailed: "画像を読み込めませんでした",
      userFound: "ユーザーが見つかりました",
      back: "戻る",
      done: "完了",
      uploadImage: "画像をアップロード",
      uploadingImage: "アップロード中…",
      uploaded: "画像をアップロードしました",
      uploadFailed: "アップロードに失敗しました。",
      notImage: "画像ファイルを選んでください。",
      uploaderMissing: "このページではアップロードを利用できません。"
    },
    ru: {
      accountBanned: "Этот аккаунт заблокирован.",
      sessionExpired: "Сессия истекла. Войдите снова.",
      networkError: "Ошибка сети. Проверьте подключение и повторите попытку.",
      serverError: "Ошибка сервера. Повторите попытку.",
      invalidRequest: "Некоторые данные недействительны. Проверьте и повторите.",
      livePreview: "Предпросмотр",
      from: "От",
      to: "Кому",
      you: "Вы",
      balance: "Ваш баланс",
      afterSending: "После отправки",
      useItemImage: "Использовать изображение предмета",
      imageHttps: "URL изображения должен начинаться с https://",
      noResults: "Ничего не найдено",
      messagePlaceholder: "Напишите что-нибудь приятное…",
      messageEmpty: "Здесь появится ваше сообщение",
      onItsWay: "Летит к {name}",
      change: "Изменить",
      free: "Бесплатно",
      imageFailed: "Не удалось загрузить изображение",
      userFound: "Пользователь найден",
      back: "Назад",
      done: "Готово",
      uploadImage: "Загрузить изображение",
      uploadingImage: "Загрузка…",
      uploaded: "Изображение загружено",
      uploadFailed: "Ошибка загрузки.",
      notImage: "Выберите файл изображения.",
      uploaderMissing: "Загрузка недоступна на этой странице."
    }
  };
  for (const lang of Object.keys(I18N_EXTRA)) Object.assign(I18N[lang], I18N_EXTRA[lang]);

  // Backend error code -> i18n key (see send-gift.mjs)
  const ERROR_KEYS = {
    invalid_request: "invalidRequest",
    self_gift: "cantSendToSelf",
    account_banned: "accountBanned",
    recipient_not_found: "recipientNotFound",
    recipient_unavailable: "recipientBlocked",
    recipient_blocked_by_you: "youBlockedUser",
    item_not_for_sale: "notForSale",
    duplicate_gift: "duplicateGift",
    not_enough_coins: "notEnoughCoins"
  };

  const ICON = {
    gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><rect x="3" y="8" width="18" height="4"/><path d="M12 8v13"/><path d="M19 12v9H5v-9"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square" stroke-linejoin="miter"><path d="M15 5l-7 7 7 7"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="square" stroke-linejoin="miter"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="square"><path d="M7 7l10 10M17 7L7 17"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><rect x="3" y="4" width="18" height="16"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-8 8"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square" stroke-linejoin="miter"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 20h16"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.2-4 4-6 8-6s6.8 2 8 6"/></svg>',
    msg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><path d="M4 4h16v12H9l-5 4z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square"><path d="M12 5v14M5 12h14"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square" stroke-linejoin="miter"><path d="M9 5l7 7-7 7"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square" stroke-linejoin="miter"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    verified: '<svg viewBox="0 0 24 24"><path fill="#7c3aed" d="M12 1.8l2.6 1.9 3.2-.1 1 3 2.6 1.9-1 3 1 3-2.6 1.9-1 3-3.2-.1L12 22.2l-2.6-1.9-3.2.1-1-3-2.6-1.9 1-3-1-3 2.6-1.9 1-3 3.2.1z"/><path d="M8.2 12.2l2.6 2.6 5-5.2" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  const CSS = `
    :host { all: initial; }
    *, *::before, *::after { box-sizing: border-box; }
    button, input, textarea { font-family: inherit; }
    .sg-root {
      --a: var(--accent, #6b21a8);
      --a2: var(--accent-h, var(--accent-strong, #5b21b6));
      --tx: var(--text, #eaeaea);
      --mu: var(--muted, #a8a8a8);
      --bd: var(--border, rgba(255,255,255,.04));
      --bd2: rgba(255,255,255,.1);
      --c1: var(--surface, var(--card, #1f1f1f));
      --c2: var(--raised, var(--card-2, #242424));
      --pn: var(--bg, var(--panel, #171717));
      --lily: #c8a2c8;
      --lily-tx: #e4cfe4;
      --err: #ff6b6b;
      --ease: cubic-bezier(.2,.8,.2,1);
      font-family: Inter, system-ui, -apple-system, "Segoe UI", sans-serif;
      font-size: 14.5px;
      color: var(--tx);
      -webkit-font-smoothing: antialiased;
    }

    /* ---------- overlay + sheet ---------- */
    .sg-overlay {
      position: fixed; inset: 0;
      display: grid; place-items: end center;
      padding: 16px;
      background: rgba(0,0,0,.6);
      opacity: 0; pointer-events: none;
      transition: opacity .2s var(--ease);
    }
    .sg-overlay.open { opacity: 1; pointer-events: auto; }

    .sg-sheet {
      position: relative;
      width: min(980px, 100%);
      height: min(760px, calc(100vh - 32px));
      height: min(760px, calc(100dvh - 32px));
      display: grid; grid-template-rows: auto minmax(0,1fr) auto;
      background: var(--c1);
      border: 1px solid var(--bd2);
      border-radius: 8px;
      box-shadow: 0 24px 60px rgba(0,0,0,.5);
      overflow: hidden;
      transform: translateY(40px); opacity: 0;
      transition: transform .3s var(--ease), opacity .2s var(--ease);
    }
    .sg-overlay.open .sg-sheet { transform: none; opacity: 1; }
    .sg-overlay.closing .sg-sheet { transform: translateY(30px); opacity: 0; transition: transform .2s var(--ease), opacity .15s ease; }

    .sg-header {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      padding: 16px 22px; touch-action: none; border-bottom: 1px solid var(--bd);
    }
    .sg-title-wrap { display: flex; align-items: center; gap: 12px; min-width: 0; }
    .sg-badge {
      width: 40px; height: 40px; border-radius: 6px; flex: none; display: grid; place-items: center;
      background: var(--a); color: #fff;
    }
    .sg-badge svg { width: 22px; height: 22px; }
    .sg-titles { min-width: 0; }
    .sg-title { margin: 0; font: 700 20px/1.25 Inter, system-ui, sans-serif; }
    .sg-subtitle {
      margin: 2px 0 0; font: 500 13px/1.3 Inter, system-ui, sans-serif; color: var(--mu);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 46vw;
    }
    .sg-subtitle:empty { display: none; }
    .sg-header-right { display: flex; align-items: center; gap: 10px; }
    .sg-balance {
      display: inline-flex; align-items: center; padding: 8px 12px; border-radius: 6px;
      background: var(--c2); border: 1px solid var(--bd2);
      font: 700 13px/1 Inter, system-ui, sans-serif; font-variant-numeric: tabular-nums;
    }
    .sg-balance.bump { animation: sgBump .35s var(--ease); }
    @keyframes sgBump { 40% { transform: scale(1.06); } }
    .sg-iconbtn {
      width: 38px; height: 38px; flex: none; display: grid; place-items: center; cursor: pointer;
      color: var(--mu); background: none; border: 1px solid var(--bd2); border-radius: 6px;
      transition: color .15s, border-color .15s;
    }
    .sg-iconbtn svg { width: 18px; height: 18px; }
    .sg-iconbtn:hover { color: var(--tx); border-color: var(--mu); }

    /* ---------- views ---------- */
    .sg-viewport { position: relative; overflow: hidden; min-height: 0; display: flex; flex-direction: column; }
    .sg-view-main { flex: 1; min-height: 0; overflow: auto; padding: 20px 22px 24px; overscroll-behavior: contain; transition: opacity .2s; }
    .sg-view-picker {
      position: absolute; inset: 0; display: flex; flex-direction: column; background: var(--c1);
      transform: translateX(100%); transition: transform .3s var(--ease); visibility: hidden;
    }
    .sg-sheet.picking .sg-view-main { opacity: 0; pointer-events: none; }
    .sg-sheet.picking .sg-view-picker { transform: none; visibility: visible; }
    .sg-sheet.picking .sg-footer { display: none; }

    .sg-banner { display: none; margin: 0 0 16px; }
    .sg-banner.show { display: block; }
    .sg-banner-in {
      display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 6px;
      color: #ffb4b4; background: rgba(192,57,43,.12); border: 1px solid rgba(192,57,43,.5);
      font: 500 13px/1.4 Inter, system-ui, sans-serif;
    }
    .sg-banner-in svg { width: 16px; height: 16px; flex: none; }

    .sg-grid { display: grid; grid-template-columns: minmax(0, .95fr) minmax(0, 1.05fr); gap: 24px; align-items: start; }
    .sg-col { display: grid; gap: 16px; min-width: 0; }
    .sg-col-preview { position: sticky; top: 0; }

    .sg-eyebrow { display: flex; align-items: center; gap: 8px; font: 600 12px/1 Inter, system-ui, sans-serif; letter-spacing: .07em; text-transform: uppercase; color: var(--mu); }

    /* ---------- gift card preview ---------- */
    .sg-giftcard { border-radius: 8px; overflow: hidden; border: 1px solid var(--bd2); background: var(--c2); }
    .sg-gc-media { position: relative; aspect-ratio: 16 / 10; overflow: hidden; background: var(--pn); }
    .sg-gc-media img {
      position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block;
      opacity: 0; transition: opacity .3s var(--ease);
    }
    .sg-gc-media img.ok { opacity: 1; }
    .sg-gc-ph {
      position: absolute; inset: 0; display: grid; place-content: center; justify-items: center; gap: 10px; text-align: center; padding: 16px;
      color: var(--mu); font: 500 13px/1.4 Inter, system-ui, sans-serif; background: var(--pn); transition: opacity .2s;
    }
    .sg-gc-ph.hide { opacity: 0; pointer-events: none; }
    .sg-gc-ph svg { width: 40px; height: 40px; }
    .sg-gc-tag {
      position: absolute; top: 10px; left: 10px; display: inline-flex; align-items: center; gap: 6px; padding: 5px 9px;
      border-radius: 4px; background: var(--a2); color: #fff;
      font: 600 12px/1 Inter, system-ui, sans-serif;
    }
    .sg-gc-tag svg { width: 14px; height: 14px; }
    .sg-gc-body { padding: 14px 16px 16px; display: grid; gap: 10px; }
    .sg-gc-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
    .sg-gc-name { font: 700 16px/1.25 Inter, system-ui, sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
    .sg-gc-name.empty { color: var(--mu); font-weight: 600; }
    .sg-gc-route { display: flex; align-items: center; gap: 8px; font: 500 13px/1.2 Inter, system-ui, sans-serif; color: var(--mu); min-width: 0; }
    .sg-gc-route b { color: var(--tx); font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 40%; }
    .sg-gc-route svg { width: 14px; height: 14px; flex: none; }
    .sg-gc-msg {
      padding: 10px 12px; border-radius: 6px; background: var(--pn); border: 1px solid var(--bd2);
      font: 500 13.5px/1.5 Inter, system-ui, sans-serif; color: var(--tx);
      white-space: pre-wrap; word-break: break-word; max-height: 110px; overflow: hidden;
    }
    .sg-gc-msg.empty { color: var(--mu); font-style: italic; }

    /* ---------- chips ---------- */
    .sg-chip {
      display: inline-flex; align-items: center; gap: 6px; padding: 4px 9px; border-radius: 4px; flex: none;
      font: 600 12px/1.2 Inter, system-ui, sans-serif; color: var(--mu); background: var(--pn); border: 1px solid var(--bd2);
      white-space: nowrap; font-variant-numeric: tabular-nums;
    }
    .sg-chip svg { width: 13px; height: 13px; }
    .sg-chip.coin { color: var(--tx); }
    .sg-chip.ok { color: var(--lily-tx); background: rgba(200,162,200,.12); border-color: rgba(200,162,200,.35); }
    .sg-chip.err { color: #ffb4b4; background: rgba(192,57,43,.12); border-color: rgba(192,57,43,.5); }
    .sg-chip.btn { cursor: pointer; color: var(--tx); background: transparent; border-color: var(--bd2); transition: border-color .15s; }
    .sg-chip.btn:hover { border-color: var(--mu); }

    .sg-summary { display: grid; padding: 2px 16px; border-radius: 8px; background: var(--c2); border: 1px solid var(--bd); }
    .sg-sum-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; font: 500 13.5px/1 Inter, system-ui, sans-serif; color: var(--mu); }
    .sg-sum-row + .sg-sum-row { border-top: 1px solid var(--bd); }
    .sg-sum-row b { color: var(--tx); font-weight: 700; font-variant-numeric: tabular-nums; }
    .sg-sum-row.total b { font-size: 15px; }
    .sg-sum-row.total b.neg { color: var(--err); }

    /* ---------- fields ---------- */
    .sg-field { padding: 16px; border-radius: 8px; background: var(--c2); border: 1px solid var(--bd); display: grid; gap: 10px; min-width: 0; }
    .sg-field:focus-within { border-color: var(--a); }
    .sg-label { display: flex; align-items: center; gap: 8px; font: 600 12px/1 Inter, system-ui, sans-serif; letter-spacing: .07em; text-transform: uppercase; color: var(--mu); }
    .sg-label .sg-ico { width: 20px; height: 20px; display: grid; place-items: center; color: var(--mu); }
    .sg-label .sg-ico svg { width: 15px; height: 15px; }
    .sg-label .grow { flex: 1; }
    .sg-inputwrap { position: relative; }
    .sg-input, .sg-textarea {
      width: 100%; color: var(--tx); outline: none; background: var(--pn);
      border: 1px solid var(--bd2); border-radius: 6px; padding: 10px 12px; font: 500 14px/1.4 Inter, system-ui, sans-serif;
    }
    .sg-input::placeholder, .sg-textarea::placeholder { color: rgba(255,255,255,.3); }
    .sg-input:focus, .sg-textarea:focus { outline: 2px solid var(--a2); outline-offset: -1px; }
    .sg-inputwrap .sg-input { padding-right: 44px; }
    .sg-textarea { min-height: 96px; resize: none; }
    .sg-status { position: absolute; right: 9px; top: 50%; width: 24px; height: 24px; margin-top: -12px; display: grid; place-items: center; pointer-events: none; }
    .sg-status .ok, .sg-status .bad { width: 22px; height: 22px; border-radius: 4px; display: grid; place-items: center; }
    .sg-status .ok { background: var(--lily); color: #2a1238; }
    .sg-status .bad { background: var(--err); color: #2a0a0a; }
    .sg-status svg { width: 14px; height: 14px; }

    .sg-spin { width: 18px; height: 18px; border-radius: 50%; border: 2.5px solid rgba(255,255,255,.15); border-top-color: var(--lily); animation: sgSpin .8s linear infinite; }
    @keyframes sgSpin { to { transform: rotate(360deg); } }

    .sg-msg { font: 500 13px/1.4 Inter, system-ui, sans-serif; color: var(--mu); }
    .sg-msg.err { color: var(--err); }
    .sg-msg.ok { color: var(--lily-tx); }

    .sg-profile { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 6px; background: var(--pn); border: 1px solid var(--bd2); }
    .sg-avatar { position: relative; width: 44px; height: 44px; flex: none; border-radius: 6px; overflow: hidden; display: grid; place-items: center; background: var(--a); color: #fff; font: 700 18px/1 Inter, system-ui, sans-serif; }
    .sg-avatar img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .sg-avatar img.sg-broken { display: none; }
    .sg-pinfo { min-width: 0; flex: 1; }
    .sg-pname { display: flex; align-items: center; gap: 6px; font: 700 14px/1.2 Inter, system-ui, sans-serif; }
    .sg-pname span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sg-pname svg { width: 16px; height: 16px; flex: none; }
    .sg-pmail { margin-top: 3px; font: 500 12.5px/1.2 Inter, system-ui, sans-serif; color: var(--mu); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .sg-pick-empty, .sg-pick-tile {
      width: 100%; display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 6px; cursor: pointer; text-align: left;
      color: var(--tx); transition: border-color .15s;
    }
    .sg-pick-empty { border: 1px dashed var(--bd2); background: var(--pn); }
    .sg-pick-empty:hover { border-color: var(--a2); }
    .sg-pick-empty .plus { width: 44px; height: 44px; border-radius: 6px; display: grid; place-items: center; background: var(--a); color: #fff; }
    .sg-pick-empty .plus svg { width: 20px; height: 20px; }
    .sg-pick-tile { border: 1px solid var(--bd2); background: var(--pn); }
    .sg-pick-tile:hover { border-color: var(--a2); }
    .sg-thumb { width: 48px; height: 48px; flex: none; border-radius: 6px; overflow: hidden; background: var(--c2); border: 1px solid var(--bd); display: grid; place-items: center; color: var(--mu); }
    .sg-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .sg-thumb svg { width: 22px; height: 22px; }
    .sg-pt-main { min-width: 0; flex: 1; display: grid; gap: 6px; }
    .sg-pt-name { font: 700 14px/1.2 Inter, system-ui, sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sg-pt-sub { font: 500 12.5px/1.2 Inter, system-ui, sans-serif; color: var(--mu); }
    .sg-pick-chev { width: 18px; height: 18px; color: var(--mu); flex: none; }

    .sg-skel { position: relative; overflow: hidden; border-radius: 6px; background: rgba(255,255,255,.06); }
    .sg-skel::after { content: ""; position: absolute; inset: 0; background: linear-gradient(100deg, transparent 20%, rgba(255,255,255,.08) 50%, transparent 80%); transform: translateX(-100%); animation: sgSkel 1.3s infinite; }
    @keyframes sgSkel { to { transform: translateX(100%); } }

    .sg-row { display: flex; align-items: center; gap: 10px; }
    .sg-row.between { justify-content: space-between; }
    .sg-row.wrap { flex-wrap: wrap; }
    .sg-emojis { display: flex; gap: 6px; flex-wrap: wrap; }
    .sg-emoji { width: 34px; height: 34px; border-radius: 6px; border: 1px solid var(--bd2); background: var(--pn); cursor: pointer; font-size: 16px; line-height: 1; transition: border-color .15s; }
    .sg-emoji:hover { border-color: var(--mu); }
    .sg-count { font: 600 12px/1 Inter, system-ui, sans-serif; color: var(--mu); font-variant-numeric: tabular-nums; }
    .sg-count.warn { color: #e6b800; } .sg-count.max { color: var(--err); }

    /* ---------- picker ---------- */
    .sg-picker-top { display: flex; gap: 10px; align-items: center; padding: 16px 22px 10px; }
    .sg-searchwrap { position: relative; flex: 1; }
    .sg-searchwrap svg { position: absolute; left: 12px; top: 50%; width: 17px; height: 17px; margin-top: -8.5px; color: var(--mu); pointer-events: none; }
    .sg-searchwrap .sg-input { padding-left: 38px; }
    .sg-picker-body { flex: 1; min-height: 0; overflow: auto; padding: 4px 22px 22px; overscroll-behavior: contain; }
    .sg-picker-title { font: 600 12px/1 Inter, system-ui, sans-serif; letter-spacing: .07em; text-transform: uppercase; color: var(--mu); margin: 8px 0 12px; }
    .sg-pgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
    .sg-pcard {
      position: relative; display: grid; border-radius: 8px; overflow: hidden; cursor: pointer; text-align: left; padding: 0;
      color: var(--tx); background: var(--c2); border: 1px solid var(--bd2); transition: border-color .15s;
    }
    .sg-pcard:hover { border-color: var(--mu); }
    .sg-pcard.sel { border-color: var(--a2); box-shadow: 0 0 0 1px var(--a2); }
    .sg-pimg { aspect-ratio: 1; background: var(--pn); overflow: hidden; display: grid; place-items: center; color: var(--mu); }
    .sg-pimg img { width: 100%; height: 100%; object-fit: cover; }
    .sg-pimg svg { width: 28px; height: 28px; }
    .sg-pmeta { padding: 10px 11px 12px; display: grid; gap: 5px; }
    .sg-pmeta .n { font: 700 13px/1.2 Inter, system-ui, sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sg-pmeta .s { font: 500 12px/1.2 Inter, system-ui, sans-serif; color: var(--mu); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sg-pcheck { position: absolute; top: 8px; right: 8px; width: 22px; height: 22px; border-radius: 4px; display: grid; place-items: center; background: var(--a2); color: #fff; }
    .sg-pcheck svg { width: 14px; height: 14px; }
    .sg-pskel { aspect-ratio: .8; border-radius: 8px; }
    .sg-empty { grid-column: 1 / -1; padding: 40px 10px; text-align: center; color: var(--mu); font: 500 14px/1.5 Inter, system-ui, sans-serif; }

    /* ---------- footer + buttons ---------- */
    .sg-footer { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; padding: 14px 22px; border-top: 1px solid var(--bd); background: var(--c1); }
    .sg-tos { flex: 1 1 260px; font: 500 12.5px/1.45 Inter, system-ui, sans-serif; color: var(--mu); }
    .sg-actions { display: flex; gap: 8px; margin-left: auto; }
    .sg-btn {
      position: relative; overflow: hidden; display: inline-flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;
      min-width: 110px; padding: 12px 16px; border-radius: 6px; font: 600 14px/1 Inter, system-ui, sans-serif; color: #fff;
      border: 1px solid var(--a); background: var(--a);
      transition: background .15s, border-color .15s, opacity .15s;
    }
    .sg-btn:hover { background: var(--a2); border-color: var(--a2); }
    .sg-btn.ghost { background: transparent; color: var(--tx); border-color: rgba(128,128,128,.28); }
    .sg-btn.ghost:hover { border-color: var(--mu); background: transparent; }
    .sg-btn.small { min-width: 0; padding: 8px 12px; font-size: 13px; }
    .sg-btn:disabled, .sg-btn.uploading { opacity: .5; cursor: not-allowed; pointer-events: none; }
    .sg-btn svg { width: 16px; height: 16px; }
    .sg-btn.blocked { opacity: .5; cursor: not-allowed; }
    .sg-btn.blocked:hover { background: var(--a); border-color: var(--a); }
    .sg-btn.shake { animation: sgShake .35s var(--ease); }
    @keyframes sgShake { 25%, 75% { transform: translateX(-4px); } 50% { transform: translateX(4px); } }
    .sg-btn-spin { display: none; width: 16px; height: 16px; border-radius: 50%; border: 2.5px solid rgba(255,255,255,.3); border-top-color: #fff; animation: sgSpin .75s linear infinite; }
    .sg-btn.loading { pointer-events: none; opacity: .8; }
    .sg-btn.loading .sg-btn-spin { display: block; }
    .sg-btn.loading .sg-btn-ico { display: none; }

    /* ---------- success overlay ---------- */
    .sg-success { position: absolute; inset: 0; z-index: 5; display: grid; place-items: center; padding: 20px; text-align: center; background: var(--c1); opacity: 0; pointer-events: none; transition: opacity .2s var(--ease); }
    .sg-sheet.success .sg-success { opacity: 1; pointer-events: auto; }
    .sg-success-card { display: grid; justify-items: center; gap: 10px; max-width: 360px; }
    .sg-success-mark { width: 64px; height: 64px; border-radius: 8px; display: grid; place-items: center; background: var(--lily); color: #2a1238; }
    .sg-success-mark svg { width: 34px; height: 34px; }
    .sg-success h3 { margin: 6px 0 0; font: 700 22px/1.2 Inter, system-ui, sans-serif; }
    .sg-success p { margin: 0; color: var(--mu); font: 500 14px/1.5 Inter, system-ui, sans-serif; }
    .sg-success .sg-chip { margin: 4px 0 8px; }

    /* ---------- toast ---------- */
    .sg-toast {
      position: fixed; top: 18px; left: 50%; display: flex; align-items: center; gap: 9px; max-width: min(92vw, 520px);
      padding: 10px 16px; border-radius: 6px; font: 600 14px/1.3 Inter, system-ui, sans-serif; color: #fff; pointer-events: none;
      box-shadow: 0 8px 24px rgba(0,0,0,.4); transform: translate(-50%, -140%); opacity: 0;
      transition: transform .3s var(--ease), opacity .2s;
    }
    .sg-toast.show { transform: translate(-50%, 0); opacity: 1; }
    .sg-toast svg { width: 16px; height: 16px; flex: none; }
    .sg-toast.purple { background: var(--a2); }
    .sg-toast.yellow { background: #e6b800; color: #222; }
    .sg-toast.red { background: #c0392b; }

    /* ---------- responsive ---------- */
    @media (max-width: 860px) {
      .sg-overlay { padding: 8px 0 0; }
      .sg-sheet { width: 100%; height: calc(100vh - 8px); height: calc(100dvh - 8px); border-radius: 8px 8px 0 0; }
      .sg-grid { grid-template-columns: 1fr; gap: 16px; }
      .sg-col-preview { position: static; }
      .sg-gc-media { aspect-ratio: 2 / 1; }
      .sg-header, .sg-view-main, .sg-footer { padding-left: 16px; padding-right: 16px; }
      .sg-footer { padding-bottom: max(14px, env(safe-area-inset-bottom)); }
      .sg-tos { display: none; }
      .sg-actions { width: 100%; } .sg-actions .sg-btn { flex: 1; }
      .sg-actions .ghost { flex: .6; }
    }
    @media (prefers-reduced-motion: reduce) {
      .sg-root *, .sg-root *::before, .sg-root *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; animation-delay: 0ms !important; }
    }
  `;

  const MARKUP = `
    <div class="sg-root">
      <div class="sg-overlay">
        <div class="sg-sheet" role="dialog" aria-modal="true" aria-labelledby="sg-title">
          <div class="sg-header">
            <div class="sg-title-wrap">
              <div class="sg-badge">${ICON.gift}</div>
              <div class="sg-titles">
                <h2 class="sg-title" id="sg-title" data-i18n="title"></h2>
                <p class="sg-subtitle" id="sg-subtitle"></p>
              </div>
            </div>
            <div class="sg-header-right">
              <div class="sg-balance" id="sg-balance"><span id="sg-balance-num">—</span></div>
              <button class="sg-iconbtn" type="button" data-action="close" data-i18n-aria="close">${ICON.close}</button>
            </div>
          </div>

          <div class="sg-viewport">
            <div class="sg-view sg-view-main">
              <div class="sg-banner" id="sg-banner"><div class="sg-banner-in">${ICON.x}<span id="sg-banner-text"></span></div></div>
              <div class="sg-grid">
                <div class="sg-col sg-col-preview">
                  <div class="sg-eyebrow"><span data-i18n="livePreview"></span></div>
                  <div id="sg-stage">
                    <div class="sg-giftcard" id="sg-giftcard">
                      <div class="sg-gc-media">
                        <img id="sg-gc-img" alt="" referrerpolicy="no-referrer">
                        <div class="sg-gc-ph" id="sg-gc-ph">${ICON.gift}<span id="sg-gc-ph-text"></span></div>
                        <div class="sg-gc-tag">${ICON.gift}<span data-i18n="yourGift"></span></div>
                      </div>
                      <div class="sg-gc-body">
                        <div class="sg-gc-row"><div class="sg-gc-name" id="sg-gc-name"></div><div id="sg-gc-price"></div></div>
                        <div class="sg-gc-route"><span data-i18n="from"></span><b id="sg-gc-from"></b>${ICON.arrow}<span data-i18n="to"></span><b id="sg-gc-to"></b></div>
                        <div class="sg-gc-msg" id="sg-gc-msg"></div>
                      </div>
                    </div>
                  </div>
                  <div class="sg-summary">
                    <div class="sg-sum-row"><span data-i18n="price"></span><b id="sg-sum-price">—</b></div>
                    <div class="sg-sum-row"><span data-i18n="balance"></span><b id="sg-sum-balance">—</b></div>
                    <div class="sg-sum-row total"><span data-i18n="afterSending"></span><b id="sg-sum-after">—</b></div>
                  </div>
                </div>

                <div class="sg-col sg-col-form">
                  <section class="sg-field">
                    <label class="sg-label" for="sg-recipient-input"><span class="sg-ico">${ICON.user}</span><span data-i18n="recipient"></span></label>
                    <div class="sg-inputwrap">
                      <input class="sg-input" id="sg-recipient-input" type="email" inputmode="email" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="name@email.com">
                      <span class="sg-status" id="sg-recipient-status"></span>
                    </div>
                    <div id="sg-recipient-card"></div>
                  </section>

                  <section class="sg-field">
                    <div class="sg-label"><span class="sg-ico">${ICON.gift}</span><span data-i18n="yourGift"></span></div>
                    <div id="sg-gift-field"></div>
                  </section>

                  <section class="sg-field">
                    <label class="sg-label" for="sg-image-input"><span class="sg-ico">${ICON.image}</span><span class="grow" data-i18n="previewImage"></span><span id="sg-image-action"></span></label>
                    <div class="sg-inputwrap">
                      <input class="sg-input" id="sg-image-input" type="url" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="https://">
                      <span class="sg-status" id="sg-image-status"></span>
                    </div>
                    <div class="sg-row">
                      <button type="button" class="sg-btn ghost small" id="sg-upload" data-action="upload">${ICON.upload}<span id="sg-upload-label"></span></button>
                      <input type="file" id="sg-file" accept="image/*" hidden>
                    </div>
                    <div id="sg-image-hint" class="sg-msg"></div>
                  </section>

                  <section class="sg-field">
                    <label class="sg-label" for="sg-message-input"><span class="sg-ico">${ICON.msg}</span><span data-i18n="messageOptional"></span></label>
                    <textarea class="sg-textarea" id="sg-message-input" maxlength="${MAX_MESSAGE}" data-i18n-ph="messagePlaceholder"></textarea>
                    <div class="sg-row between wrap">
                      <div class="sg-emojis">${EMOJIS.map((e) => `<button type="button" class="sg-emoji" data-action="emoji" data-emoji="${e}">${e}</button>`).join("")}</div>
                      <span class="sg-count" id="sg-count">0/${MAX_MESSAGE}</span>
                    </div>
                  </section>
                </div>
              </div>
            </div>

            <div class="sg-view sg-view-picker">
              <div class="sg-picker-top">
                <button class="sg-iconbtn" type="button" data-action="back" data-i18n-aria="back">${ICON.back}</button>
                <div class="sg-searchwrap">${ICON.search}<input class="sg-input" id="sg-search" type="search" autocomplete="off" data-i18n-ph="searchApproved"></div>
              </div>
              <div class="sg-picker-body">
                <div class="sg-picker-title" data-i18n="approvedUgc"></div>
                <div class="sg-pgrid" id="sg-picker-list"></div>
              </div>
            </div>
          </div>

          <div class="sg-footer">
            <div class="sg-tos" data-i18n="tos"></div>
            <div class="sg-actions">
              <button class="sg-btn ghost" type="button" data-action="close" data-i18n="cancel"></button>
              <button class="sg-btn primary" type="button" id="sg-send" data-action="send">
                <span class="sg-btn-ico">${ICON.gift}</span><span class="sg-btn-spin"></span>
                <span id="sg-send-label"></span>
              </button>
            </div>
          </div>

          <div class="sg-success" id="sg-success" aria-live="polite">
            <div class="sg-success-card">
              <div class="sg-success-mark">${ICON.check}</div>
              <h3 data-i18n="success"></h3>
              <p id="sg-success-text"></p>
              <span class="sg-chip coin" id="sg-success-bal"></span>
              <button class="sg-btn" type="button" data-action="close" data-i18n="done"></button>
            </div>
          </div>
        </div>
      </div>
      <div class="sg-toast" id="sg-toast"></div>
    </div>
  `;

  // ---------------------------------------------------------------------------
  // module state
  // ---------------------------------------------------------------------------
  let hostEl = null;
  let shadow = null;
  let state = null;
  let approvedCachePromise = null;
  let closeTimer = null;
  let toastTimer = null;
  let lookupTimer = null;
  let successTimer = null;
  let prevFocus = null;
  let prevBodyOverflow = "";
  let renderedLang = null;

  const $ = (sel) => (shadow ? shadow.querySelector(sel) : null);
  const reducedMotion = () => !!(root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches);

  // ---------------------------------------------------------------------------
  // firebase + language helpers
  // ---------------------------------------------------------------------------
  function ensureFirebase() {
    if (!root.firebase || !root.firebase.auth || !root.firebase.firestore) {
      throw new Error("Firebase is not available on this page.");
    }
  }
  function getAuth() { ensureFirebase(); return root.firebase.auth(); }
  function getFirestore() { ensureFirebase(); return root.firebase.firestore(); }

  function isAllowedLang(code) { return ALLOWED_LANGS.has((code || "").toLowerCase()); }

  function navLanguage() {
    const nav = String((root.navigator && root.navigator.language) || "").toLowerCase().slice(0, 2);
    return isAllowedLang(nav) ? nav : FALLBACK_LANG;
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
    return lang || navLanguage();
  }

  function t(key, lang, vars = {}) {
    const dict = I18N[lang] || I18N.en;
    let str = dict[key] || I18N.en[key] || key;
    for (const [k, v] of Object.entries(vars)) str = str.replaceAll(`{${k}}`, String(v));
    return str;
  }
  const tt = (key, vars) => t(key, state ? state.lang : FALLBACK_LANG, vars);

  // ---------------------------------------------------------------------------
  // tiny utils
  // ---------------------------------------------------------------------------
  function escapeHtml(text) {
    return String(text ?? "")
      .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }
  // the backend only accepts https image urls (<= 1000 chars)
  function isHttps(url) {
    try { return new URL(url).protocol === "https:" && String(url).length <= 1000; } catch { return false; }
  }
  function isValidUrl(url) {
    try { const u = new URL(url); return u.protocol === "http:" || u.protocol === "https:"; } catch { return false; }
  }
  const fmt = (n) => Number(n).toLocaleString();
  // DF$ has no logo, so amounts are always written as plain text
  const df = (n) => `DF$ ${fmt(n)}`;

  // only touch the DOM when something actually changed
  function setHtml(el, html) {
    if (!el || el._h === html) return;
    el._h = html;
    el.innerHTML = html;
  }
  function setText(el, v) {
    if (el && el.textContent !== v) el.textContent = v;
  }

  // count-up animation for DF$ amounts
  function tween(el, to) {
    if (!el) return;
    if (typeof to !== "number" || !Number.isFinite(to)) {
      cancelAnimationFrame(el._raf);
      el._v = undefined;
      setText(el, "—");
      return;
    }
    const from = el._v;
    if (from === undefined || from === to || reducedMotion()) {
      cancelAnimationFrame(el._raf);
      el._v = to;
      setText(el, df(to));
      return;
    }
    cancelAnimationFrame(el._raf);
    el._v = to;
    const start = performance.now();
    const dur = 400;
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = df(Math.round(from + (to - from) * e));
      if (p < 1) el._raf = requestAnimationFrame(step);
    };
    el._raf = requestAnimationFrame(step);
  }

  function priceChipHtml(price) {
    if (price === -1) return `<span class="sg-chip err">${escapeHtml(tt("notForSale"))}</span>`;
    if (!Number.isFinite(price)) return "";
    if (price === 0) return `<span class="sg-chip ok">${escapeHtml(tt("free"))}</span>`;
    return `<span class="sg-chip coin">${escapeHtml(df(price))}</span>`;
  }

  // ---------------------------------------------------------------------------
  // root lifecycle
  // ---------------------------------------------------------------------------
  function createRoot() {
    if (hostEl && shadow) return;

    if (!document.querySelector("link[data-sendgift-inter]")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap";
      link.setAttribute("data-sendgift-inter", "1");
      document.head.appendChild(link);
    }

    hostEl = document.createElement("div");
    hostEl.id = "sendgift-sheet-host";
    // Hardened host: explicit box so host-page CSS (transforms, overflow) can never clip or offset the sheet.
    // (No popover/top layer: the uploader's dialogs must be able to sit above the sheet.)
    hostEl.style.cssText = "position:fixed;inset:0;width:100%;height:100%;max-width:none;max-height:none;margin:0;padding:0;border:0;overflow:visible;background:transparent;color:inherit;display:block;visibility:visible;opacity:1;z-index:" + Z_TOP + ";pointer-events:none;";
    shadow = hostEl.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = CSS;
    shadow.appendChild(style);

    const tpl = document.createElement("template");
    tpl.innerHTML = MARKUP.trim();
    shadow.appendChild(tpl.content);

    document.body.appendChild(hostEl);
    renderedLang = null;
    bindStaticEvents();
  }

  function destroyRoot() {
    clearTimeout(closeTimer); clearTimeout(toastTimer); clearTimeout(lookupTimer); clearTimeout(successTimer);
    document.removeEventListener("keydown", onDocKey, true);
    if (hostEl && hostEl.parentNode) hostEl.parentNode.removeChild(hostEl);
    hostEl = null; shadow = null; renderedLang = null;
  }

  function applyStrings() {
    if (!shadow || !state || renderedLang === state.lang) return;
    renderedLang = state.lang;
    shadow.querySelectorAll("[data-i18n]").forEach((el) => setText(el, tt(el.getAttribute("data-i18n"))));
    shadow.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = tt(el.getAttribute("data-i18n-ph")); });
    shadow.querySelectorAll("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", tt(el.getAttribute("data-i18n-aria"))); });
  }

  // ---------------------------------------------------------------------------
  // public: open / close
  // ---------------------------------------------------------------------------
  function open(opts) {
    opts = opts || {};
    clearTimeout(closeTimer);
    if (hostEl) { state = null; destroyRoot(); document.body.style.overflow = prevBodyOverflow; }
    createRoot();

    prevFocus = document.activeElement;
    prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onDocKey, true);

    const hasRef = opts.ugcId && (opts.author || opts.ugcAuthor) && (typeof opts.typeId === "number" || typeof opts.ugcType === "number");
    const s = {
      open: true,
      view: "main",
      lang: navLanguage(),
      endpoint: String(opts.endpoint || ENDPOINT),
      currentEmail: "",
      currentCoins: null,
      currentCoinsError: null,
      blockedUsers: new Set(),
      recipientEmail: String(opts.initialEmail || opts.recipientEmail || opts.email || "").trim(),
      recipientState: { status: "idle" },
      lookupSeq: 0,
      selectedGiftRef: opts.initialGiftRef || (hasRef
        ? { ugcId: opts.ugcId, typeId: typeof opts.typeId === "number" ? opts.typeId : opts.ugcType, author: opts.author || opts.ugcAuthor }
        : null),
      selectedGift: null,
      loadingSelectedGift: !!(opts.initialGiftRef || hasRef),
      selectedGiftError: null,
      giftMessage: String(opts.initialMessage || "").slice(0, MAX_MESSAGE),
      giftImageUrl: String(opts.initialImageUrl || "").trim(),
      imageAutoFilled: false,
      imgState: "idle",
      uploading: false,
      sendingGift: false,
      sent: false,
      topError: null,
      approvedItems: [],
      loadingApproved: false,
      approvedError: null,
      filters: { q: "" }
    };
    state = s;

    // initial values for the persistent inputs
    $("#sg-recipient-input").value = s.recipientEmail;
    $("#sg-image-input").value = s.giftImageUrl;
    $("#sg-message-input").value = s.giftMessage;
    $("#sg-search").value = "";

    try { applyStrings(); render(); } catch (err) { console.error("[SendGiftSheet] initial render failed", err); }

    // Reveal deterministically: force a reflow so the closed state is committed, then add .open.
    const overlay = $(".sg-overlay");
    if (overlay) {
      void overlay.offsetWidth;
      overlay.classList.add("open");
      hostEl.style.pointerEvents = "auto";
    }
    if (!s.recipientEmail) setTimeout(() => { if (state === s) { const i = $("#sg-recipient-input"); i && i.focus({ preventScroll: true }); } }, 300);

    bootstrap(s).catch((err) => {
      if (state !== s) return;
      setTopError((err && err.message) || "Firebase is not available on this page.");
    });
  }

  function close() {
    if (!hostEl || !shadow) return;
    const overlay = $(".sg-overlay");
    state = null;
    clearTimeout(lookupTimer); clearTimeout(successTimer);
    document.removeEventListener("keydown", onDocKey, true);
    document.body.style.overflow = prevBodyOverflow;
    hostEl.style.pointerEvents = "none";
    if (overlay) { overlay.classList.remove("open"); overlay.classList.add("closing"); }
    try { prevFocus && prevFocus.focus && prevFocus.focus({ preventScroll: true }); } catch (_) {}
    clearTimeout(closeTimer);
    closeTimer = setTimeout(destroyRoot, 220);
  }

  async function bootstrap(s) {
    const user = getAuth().currentUser;
    const email = (user && user.email) || "";
    s.currentEmail = email;
    s.lang = await resolveLanguage(email);
    if (state !== s) return;
    render();
    if (!email) { setTopError(tt("noAccount")); return; }

    loadCurrentProfileData();
    if (s.selectedGiftRef) loadSelectedGift();
    if (s.recipientEmail) lookupRecipient();
  }

  function setTopError(msg, kind = "red") {
    if (!state) return;
    state.topError = msg;
    render();
    toast(msg, kind);
    const btn = $("#sg-send");
    if (btn) { btn.classList.remove("shake"); void btn.offsetWidth; btn.classList.add("shake"); }
  }

  // ---------------------------------------------------------------------------
  // data loading (reads only; every write goes through the backend)
  // ---------------------------------------------------------------------------
  async function loadCurrentProfileData() {
    const s = state;
    if (!s) return;
    try {
      const snap = await getFirestore().collection("user_data").doc(s.currentEmail).get();
      if (state !== s) return;
      const parsed = Number(snap.exists ? (snap.get("coins") ?? 0) : 0);
      s.currentCoins = Number.isFinite(parsed) ? parsed : 0;
      const raw = snap.exists ? snap.get("blockedUsers") : [];
      s.blockedUsers = new Set(Array.isArray(raw) ? raw.filter((x) => typeof x === "string").map((x) => x.toLowerCase()) : []);
    } catch (err) {
      if (state !== s) return;
      s.currentCoinsError = (err && err.message) || "Failed to load data.";
      s.currentCoins = 0;
      s.blockedUsers = new Set();
    }
    render();
  }

  async function lookupRecipient() {
    const s = state;
    if (!s) return;
    clearTimeout(lookupTimer);
    const email = String(s.recipientEmail || "").trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      s.recipientState = { status: "idle" };
      render();
      return;
    }
    if (s.currentEmail && email.toLowerCase() === s.currentEmail.toLowerCase()) {
      s.recipientState = { status: "error", message: tt("cantSendToSelf") };
      render();
      return;
    }

    const seq = ++s.lookupSeq;
    s.recipientState = { status: "loading" };
    render();

    try {
      const snap = await getFirestore().collection("user_data").doc(email).get();
      if (state !== s || seq !== s.lookupSeq) return;
      if (!snap.exists) {
        s.recipientState = { status: "error", message: tt("recipientNotFound") };
      } else {
        s.recipientState = {
          status: "ready",
          profile: {
            email,
            displayName: String(snap.get("display name") || "").trim(),
            profilePicture: String(snap.get("profile_picture") || "").trim(),
            isVerified: snap.get("is_verified") === true
          }
        };
      }
    } catch (err) {
      if (state !== s || seq !== s.lookupSeq) return;
      s.recipientState = {
        status: "error",
        message: err && err.code === "permission-denied" ? tt("recipientBlocked") : ((err && err.message) || tt("recipientBlocked"))
      };
    }
    render();
  }

  async function loadUgcItem(author, typeId, ugcId) {
    const collectionName = typeId === 0 ? "store-items" : "development-items";
    const snap = await getFirestore().collection("ugc").doc(author).collection(collectionName).doc(ugcId).get();
    if (!snap.exists) return null;
    if (snap.get("on_sale") === false) return null;
    return {
      name: String(snap.get("name") || snap.get("title") || ""),
      image: String(snap.get("image") || "").trim(),
      price: Number(snap.get("price") ?? 0),
      verified: snap.get("verified") === true
    };
  }

  async function loadSelectedGift() {
    const s = state;
    if (!s) return;
    const ref = s.selectedGiftRef;
    if (!ref) {
      s.loadingSelectedGift = false; s.selectedGift = null; s.selectedGiftError = null;
      render();
      return;
    }
    s.loadingSelectedGift = true;
    s.selectedGiftError = null;
    render();
    try {
      const item = await loadUgcItem(ref.author, ref.typeId, ref.ugcId);
      if (state !== s || s.selectedGiftRef !== ref) return;
      s.selectedGift = item;
      if (!item) s.selectedGiftError = tt("itemNotFound");
      // default the card image to the item image (user can still change it)
      if (item && isHttps(item.image) && (!s.giftImageUrl || s.imageAutoFilled)) {
        s.giftImageUrl = item.image;
        s.imageAutoFilled = true;
      }
    } catch (err) {
      if (state !== s || s.selectedGiftRef !== ref) return;
      s.selectedGift = null;
      s.selectedGiftError = (err && err.message) || tt("itemNotFound");
    } finally {
      if (state === s && s.selectedGiftRef === ref) { s.loadingSelectedGift = false; render(); }
    }
  }

  async function loadApprovedItems() {
    if (approvedCachePromise) return approvedCachePromise;
    approvedCachePromise = (async () => {
      try {
        const res = await fetch(APPROVED_JSON_URL, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const items = Array.isArray(data && data.marketplace && data.marketplace.items) ? data.marketplace.items : [];
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

  // ---------------------------------------------------------------------------
  // derived state
  // ---------------------------------------------------------------------------
  const getRecipient = () => (state && state.recipientState.status === "ready" ? state.recipientState.profile : null);
  function getCanAfford() {
    const gift = state && state.selectedGift;
    if (!gift || state.currentCoins == null) return false;
    return state.currentCoins >= Number(gift.price || 0);
  }
  function isRecipientBlocked() {
    const p = getRecipient();
    return !!(p && state.blockedUsers.has(p.email.toLowerCase()));
  }

  function canSend() {
    const s = state;
    const recipient = getRecipient();
    const gift = s.selectedGift;
    if (!s.currentEmail) return { ok: false, error: tt("noAccount") };
    if (!gift) return { ok: false, error: tt("noGiftSelected") };
    if (!Number.isFinite(gift.price) || gift.price < 0) return { ok: false, error: tt("notForSale") };
    if (!recipient || !s.recipientEmail.trim()) return { ok: false, error: tt("noRecipient") };
    if (!s.giftImageUrl) return { ok: false, error: tt("imageRequired") };
    if (!isHttps(s.giftImageUrl)) return { ok: false, error: isValidUrl(s.giftImageUrl) ? tt("imageHttps") : tt("invalidUrl") };
    if (recipient.email.toLowerCase() === s.currentEmail.toLowerCase()) return { ok: false, error: tt("cantSendToSelf") };
    if (isRecipientBlocked()) return { ok: false, error: tt("blockedSending") };
    if (!getCanAfford()) return { ok: false, error: tt("notEnoughCoins") };
    if (s.uploading) return { ok: false, error: tt("uploadingImage") };
    return { ok: true };
  }

  // ---------------------------------------------------------------------------
  // rendering (targeted updates so inputs are never clobbered)
  // ---------------------------------------------------------------------------
  function render() {
    if (!shadow || !state) return;
    applyStrings();
    updateHeader();
    updateRecipient();
    updateGiftField();
    updateImageField();
    updateMessage();
    updatePreview();
    updateSummary();
    updateBanner();
    updateFooter();
    updatePicker();
  }

  function updateHeader() {
    const s = state;
    const recipient = getRecipient();
    setText($("#sg-subtitle"), recipient ? `${tt("sendTo")} ${recipient.displayName || recipient.email}` : "");
    const num = $("#sg-balance-num");
    const before = num._v;
    tween(num, s.currentCoins);
    if (before !== undefined && s.currentCoins != null && before !== s.currentCoins) {
      const b = $("#sg-balance");
      b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
    }
  }

  function updateRecipient() {
    const s = state;
    const st = s.recipientState;
    const blocked = isRecipientBlocked();
    setHtml($("#sg-recipient-status"),
      st.status === "loading" ? `<div class="sg-spin"></div>`
        : st.status === "ready" ? `<span class="ok">${ICON.check}</span>`
        : st.status === "error" ? `<span class="bad">${ICON.x}</span>` : "");

    let html = "";
    if (st.status === "loading") {
      html = `<div class="sg-msg">${escapeHtml(tt("recipientLoading"))}</div>`;
    } else if (st.status === "error") {
      html = `<div class="sg-msg err">${escapeHtml(st.message)}</div>`;
    } else if (st.status === "ready") {
      const p = st.profile;
      const name = p.displayName || p.email;
      html = `
        <div class="sg-profile">
          <div class="sg-avatar"><span>${escapeHtml(name.trim().charAt(0).toUpperCase() || "?")}</span>${p.profilePicture ? `<img src="${escapeHtml(p.profilePicture)}" alt="" referrerpolicy="no-referrer">` : ""}</div>
          <div class="sg-pinfo">
            <div class="sg-pname"><span>${escapeHtml(name)}</span>${p.isVerified ? ICON.verified : ""}</div>
            <div class="sg-pmail">${escapeHtml(p.email)}</div>
          </div>
          <span class="sg-chip ok">${ICON.check}${escapeHtml(tt("userFound"))}</span>
        </div>
        ${blocked ? `<div class="sg-msg err">${escapeHtml(tt("youBlockedUser"))}</div>` : ""}`;
    }
    setHtml($("#sg-recipient-card"), html);
  }

  function updateGiftField() {
    const s = state;
    const gift = s.selectedGift;
    let html;
    if (s.loadingSelectedGift && s.selectedGiftRef) {
      html = `<div class="sg-pick-tile" style="cursor:default"><div class="sg-thumb sg-skel"></div><div class="sg-pt-main"><div class="sg-skel" style="height:14px;width:60%"></div><div class="sg-skel" style="height:12px;width:35%"></div></div></div>`;
    } else if (gift) {
      html = `
        <button type="button" class="sg-pick-tile" data-action="open-picker">
          <div class="sg-thumb">${gift.image ? `<img src="${escapeHtml(gift.image)}" alt="" referrerpolicy="no-referrer">` : ICON.gift}</div>
          <div class="sg-pt-main"><div class="sg-pt-name">${escapeHtml(gift.name || "")}</div><div>${priceChipHtml(gift.price)}</div></div>
          <span class="sg-chip btn">${escapeHtml(tt("change"))}</span>
        </button>`;
    } else {
      html = `
        ${s.selectedGiftError ? `<div class="sg-msg err">${escapeHtml(s.selectedGiftError)}</div>` : ""}
        <button type="button" class="sg-pick-empty" data-action="open-picker">
          <span class="plus">${ICON.plus}</span>
          <div class="sg-pt-main"><div class="sg-pt-name">${escapeHtml(tt("selectGift"))}</div><div class="sg-pt-sub">${escapeHtml(tt("chooseGiftHint"))}</div></div>
          <span class="sg-pick-chev">${ICON.chevron}</span>
        </button>`;
    }
    setHtml($("#sg-gift-field"), html);
  }

  function updateImageField() {
    const s = state;
    const input = $("#sg-image-input");
    if (input.value !== s.giftImageUrl && shadow.activeElement !== input) input.value = s.giftImageUrl;

    const v = s.giftImageUrl;
    let status = "";
    if (s.uploading) status = `<div class="sg-spin"></div>`;
    else if (v) {
      if (!isHttps(v) || s.imgState === "error") status = `<span class="bad">${ICON.x}</span>`;
      else if (s.imgState === "loading") status = `<div class="sg-spin"></div>`;
      else if (s.imgState === "ok") status = `<span class="ok">${ICON.check}</span>`;
    }
    setHtml($("#sg-image-status"), status);

    const up = $("#sg-upload");
    up.classList.toggle("uploading", s.uploading);
    up.disabled = s.uploading;
    setText($("#sg-upload-label"), s.uploading ? tt("uploadingImage") : tt("uploadImage"));

    const hint = $("#sg-image-hint");
    let cls = "sg-msg", text = tt("imageHint");
    if (v && !isHttps(v)) { cls = "sg-msg err"; text = isValidUrl(v) ? tt("imageHttps") : tt("invalidUrl"); }
    else if (v && s.imgState === "error") { cls = "sg-msg err"; text = tt("imageFailed"); }
    if (hint.className !== cls) hint.className = cls;
    setText(hint, text);

    const g = s.selectedGift;
    setHtml($("#sg-image-action"),
      g && isHttps(g.image) && g.image !== v
        ? `<button type="button" class="sg-chip btn" data-action="use-item-image">${escapeHtml(tt("useItemImage"))}</button>` : "");
  }

  function updateMessage() {
    const s = state;
    const ta = $("#sg-message-input");
    if (ta.value !== s.giftMessage && shadow.activeElement !== ta) ta.value = s.giftMessage;
    const n = s.giftMessage.length;
    const c = $("#sg-count");
    setText(c, `${n}/${MAX_MESSAGE}`);
    const cls = "sg-count" + (n >= MAX_MESSAGE ? " max" : n > MAX_MESSAGE - 30 ? " warn" : "");
    if (c.className !== cls) c.className = cls;
  }

  function updatePreview() {
    const s = state;
    const gift = s.selectedGift;
    const recipient = getRecipient();

    const img = $("#sg-gc-img");
    const ph = $("#sg-gc-ph");
    const url = isHttps(s.giftImageUrl) ? s.giftImageUrl : "";
    if ((img.dataset.src || "") !== url) {
      img.dataset.src = url;
      img.classList.remove("ok");
      if (url) { s.imgState = "loading"; img.src = url; }
      else { img.removeAttribute("src"); s.imgState = "idle"; }
    }
    ph.classList.toggle("hide", !!url && s.imgState === "ok");
    setText($("#sg-gc-ph-text"), s.imgState === "error" ? tt("imageFailed") : tt("enterUrl"));

    const name = $("#sg-gc-name");
    setText(name, gift && gift.name ? gift.name : tt("yourGift"));
    name.classList.toggle("empty", !(gift && gift.name));
    setHtml($("#sg-gc-price"), gift ? priceChipHtml(gift.price) : "");
    setText($("#sg-gc-from"), tt("you"));
    setText($("#sg-gc-to"), recipient ? (recipient.displayName || recipient.email) : (s.recipientEmail.trim() || "—"));

    const msg = $("#sg-gc-msg");
    setText(msg, s.giftMessage.trim() ? s.giftMessage : tt("messageEmpty"));
    msg.classList.toggle("empty", !s.giftMessage.trim());
  }

  function updateSummary() {
    const s = state;
    const gift = s.selectedGift;
    const price = gift && Number.isFinite(gift.price) && gift.price >= 0 ? gift.price : null;
    const bal = s.currentCoins;
    const after = price != null && bal != null ? bal - price : null;
    tween($("#sg-sum-price"), price);
    tween($("#sg-sum-balance"), bal);
    const a = $("#sg-sum-after");
    tween(a, after);
    a.classList.toggle("neg", after != null && after < 0);
  }

  function updateBanner() {
    const b = $("#sg-banner");
    const msg = state.topError;
    if (msg) setText($("#sg-banner-text"), msg);
    if (b.classList.contains("show") !== !!msg) b.classList.toggle("show", !!msg);
  }

  function updateFooter() {
    const s = state;
    const btn = $("#sg-send");
    const blocked = !s.sendingGift && !canSend().ok;
    btn.classList.toggle("loading", s.sendingGift);
    btn.classList.toggle("blocked", blocked);
    btn.setAttribute("aria-disabled", blocked || s.sendingGift ? "true" : "false");
    setText($("#sg-send-label"), s.sendingGift ? tt("sending") : tt("confirm"));
  }

  function updatePicker() {
    const s = state;
    const list = $("#sg-picker-list");
    if (!list) return;
    const q = String(s.filters.q || "").trim().toLowerCase();
    let html;
    if (s.loadingApproved) {
      html = Array.from({ length: 8 }, () => `<div class="sg-skel sg-pskel"></div>`).join("");
    } else if (s.approvedError) {
      html = `<div class="sg-empty">${escapeHtml(s.approvedError)}</div>`;
    } else {
      const items = (s.approvedItems || []).filter((it) => !q || [it.name, it.author, it.subtype, it.id].some((v) => String(v || "").toLowerCase().includes(q)));
      if (!items.length) {
        html = `<div class="sg-empty">${escapeHtml(s.approvedItems.length ? tt("noResults") : tt("approvedEmpty"))}</div>`;
      } else {
        const sel = s.selectedGiftRef;
        html = items.map((it) => {
          const isSel = !!(sel && sel.ugcId === it.id && sel.author === it.author);
          return `
            <button type="button" class="sg-pcard${isSel ? " sel" : ""}" data-action="pick" data-key="${escapeHtml(it.author + "::" + it.id)}">
              <div class="sg-pimg">${it.icon ? `<img src="${escapeHtml(it.icon)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ICON.gift}</div>
              <div class="sg-pmeta"><div class="n">${escapeHtml(it.name)}</div><div class="s">${escapeHtml([it.subtype, it.author].filter(Boolean).join(" · "))}</div></div>
              ${isSel ? `<span class="sg-pcheck">${ICON.check}</span>` : ""}
            </button>`;
        }).join("");
      }
    }
    setHtml(list, html);
  }

  // ---------------------------------------------------------------------------
  // picker (slides over the form, inside the same sheet)
  // ---------------------------------------------------------------------------
  async function openPicker() {
    const s = state;
    if (!s) return;
    s.view = "picker";
    $(".sg-sheet").classList.add("picking");
    setTimeout(() => { if (state === s && s.view === "picker") { const i = $("#sg-search"); i && i.focus({ preventScroll: true }); } }, 300);

    if (!s.approvedItems.length) {
      s.loadingApproved = true;
      s.approvedError = null;
      render();
      try {
        const items = await loadApprovedItems();
        if (state !== s) return;
        s.approvedItems = items;
        if (!items.length) s.approvedError = tt("approvedEmpty");
      } catch (err) {
        if (state !== s) return;
        s.approvedError = (err && err.message) || tt("approvedEmpty");
      } finally {
        if (state === s) { s.loadingApproved = false; render(); }
      }
    } else {
      render();
    }
  }

  function closePicker() {
    if (!state) return;
    state.view = "main";
    $(".sg-sheet").classList.remove("picking");
  }

  function pickItem(key) {
    const s = state;
    const item = (s.approvedItems || []).find((it) => `${it.author}::${it.id}` === key);
    if (!item) return;
    s.selectedGiftRef = { ugcId: item.id, author: item.author, typeId: item.type === 0 ? 0 : 1 };
    s.selectedGift = null;
    s.selectedGiftError = null;
    s.loadingSelectedGift = true;
    s.topError = null;
    if (s.imageAutoFilled) { s.giftImageUrl = ""; s.imageAutoFilled = false; }
    closePicker();
    render();
    loadSelectedGift();
  }

  // ---------------------------------------------------------------------------
  // image upload (window.CatboxUploader from /uploader.js)
  // ---------------------------------------------------------------------------
  async function uploadImage(file) {
    const s = state;
    if (!s || s.uploading || !file) return;
    if (!/^image\//i.test(file.type || "")) { setTopError(tt("notImage")); return; }
    if (!root.CatboxUploader || typeof root.CatboxUploader.upload !== "function") { setTopError(tt("uploaderMissing")); return; }

    s.uploading = true;
    s.topError = null;
    render();

    // the uploader shows its own dialogs/spinner on the page (z-index max, appended later): let them sit above the sheet
    hostEl.style.zIndex = Z_UPLOADING;
    let result = null;
    try { result = await root.CatboxUploader.upload(file); } catch (_) { result = null; }
    if (hostEl) hostEl.style.zIndex = Z_TOP;
    if (state !== s) return;

    s.uploading = false;

    // the uploader returns { success, ... } or null (not signed in / blocked / setup cancelled)
    let url = "";
    if (result && result.success !== false) {
      const src = result.data && typeof result.data === "object" ? result.data : result;
      url = String(src.url || src.link || src.fileUrl || src.file_url || (typeof result.data === "string" ? result.data : "") || "").trim();
    }

    if (url && isHttps(url)) {
      s.giftImageUrl = url;
      s.imageAutoFilled = false;
      s.topError = null;
      render();
      toast(tt("uploaded"), "purple");
    } else if (result) {
      setTopError((result && result.error) || tt("uploadFailed"));
    } else {
      render();
    }
  }

  // ---------------------------------------------------------------------------
  // events
  // ---------------------------------------------------------------------------
  function bindStaticEvents() {
    shadow.addEventListener("click", onClick);
    shadow.addEventListener("input", onInput);
    shadow.addEventListener("focusout", onFocusOut);
    shadow.addEventListener("change", (e) => {
      if (!e.target || e.target.id !== "sg-file") return;
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (file) uploadImage(file);
    });
    shadow.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target && e.target.id === "sg-recipient-input") {
        e.preventDefault();
        lookupRecipient();
        e.target.blur();
      }
    });
    // img "error" does not bubble -> capture it
    shadow.addEventListener("error", (e) => {
      const el = e.target;
      if (!el || el.tagName !== "IMG") return;
      if (el.closest(".sg-avatar")) el.classList.add("sg-broken");
      else if (el.id !== "sg-gc-img") el.style.display = "none";
    }, true);

    const gc = $("#sg-gc-img");
    gc.addEventListener("load", () => {
      if (!state || gc.dataset.src !== gc.getAttribute("src")) return;
      gc.classList.add("ok");
      state.imgState = "ok";
      render();
    });
    gc.addEventListener("error", () => {
      if (!state || !gc.dataset.src) return;
      state.imgState = "error";
      render();
    });

    bindDrag();
  }

  function onClick(e) {
    if (!state) return;
    if (e.target === $(".sg-overlay")) { close(); return; }
    const btn = e.target.closest && e.target.closest("[data-action]");
    if (!btn) return;
    const s = state;
    switch (btn.getAttribute("data-action")) {
      case "close": close(); break;
      case "back": closePicker(); break;
      case "open-picker": openPicker(); break;
      case "pick": pickItem(btn.getAttribute("data-key")); break;
      case "send": performSend(); break;
      case "upload": if (!s.uploading) $("#sg-file").click(); break;
      case "use-item-image":
        if (s.selectedGift && isHttps(s.selectedGift.image)) {
          s.giftImageUrl = s.selectedGift.image; s.imageAutoFilled = true; s.topError = null;
          render();
        }
        break;
      case "emoji": {
        const ta = $("#sg-message-input");
        const em = btn.getAttribute("data-emoji") || "";
        const a = ta.selectionStart == null ? ta.value.length : ta.selectionStart;
        const b = ta.selectionEnd == null ? a : ta.selectionEnd;
        const next = ta.value.slice(0, a) + em + ta.value.slice(b);
        if (next.length > MAX_MESSAGE) break;
        ta.value = next;
        s.giftMessage = next;
        ta.focus({ preventScroll: true });
        ta.setSelectionRange(a + em.length, a + em.length);
        render();
        break;
      }
    }
  }

  function onInput(e) {
    const s = state;
    if (!s) return;
    const id = e.target && e.target.id;
    if (id === "sg-recipient-input") {
      s.recipientEmail = e.target.value;
      s.recipientState = { status: "idle" };
      s.topError = null;
      clearTimeout(lookupTimer);
      lookupTimer = setTimeout(lookupRecipient, 550);
      render();
    } else if (id === "sg-image-input") {
      s.giftImageUrl = e.target.value.trim();
      s.imageAutoFilled = false;
      s.topError = null;
      render();
    } else if (id === "sg-message-input") {
      s.giftMessage = e.target.value.slice(0, MAX_MESSAGE);
      render();
    } else if (id === "sg-search") {
      s.filters.q = e.target.value;
      updatePicker();
    }
  }

  function onFocusOut(e) {
    const s = state;
    if (!s || !e.target || e.target.id !== "sg-recipient-input") return;
    if (s.recipientState.status === "idle" && s.recipientEmail.trim()) lookupRecipient();
  }

  function onDocKey(e) {
    if (!state || !shadow) return;
    // while the uploader's own dialog is open (sheet lowered), leave keys to it
    if (state.uploading) return;
    if (e.key === "Escape") {
      e.preventDefault(); e.stopPropagation();
      if (state.sent) close();
      else if (state.view === "picker") closePicker();
      else close();
      return;
    }
    if (e.key !== "Tab") return;
    const scope = state.sent ? $(".sg-success") : null;
    let list = Array.from((scope || shadow).querySelectorAll("button:not([disabled]), input:not([type=file]), textarea"));
    if (!scope) {
      list = list.filter((el) => (state.view === "picker" ? !!el.closest(".sg-view-picker, .sg-header") : !el.closest(".sg-view-picker, .sg-success")));
    }
    if (!list.length) return;
    const first = list[0], last = list[list.length - 1], active = shadow.activeElement;
    if (e.shiftKey && (active === first || !list.includes(active))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (active === last || !list.includes(active))) { e.preventDefault(); first.focus(); }
  }

  // drag the header down to dismiss
  function bindDrag() {
    const sheet = $(".sg-sheet");
    const header = $(".sg-header");
    let y0 = null, dy = 0, pid = null;
    header.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button")) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      y0 = e.clientY; dy = 0; pid = e.pointerId;
      try { header.setPointerCapture(pid); } catch (_) {}
      sheet.style.transition = "none";
    });
    header.addEventListener("pointermove", (e) => {
      if (y0 == null || e.pointerId !== pid) return;
      dy = Math.max(0, e.clientY - y0);
      sheet.style.transform = `translateY(${dy}px)`;
    });
    const up = (e) => {
      if (y0 == null || e.pointerId !== pid) return;
      y0 = null;
      if (dy > 110) {
        sheet.style.transition = "transform .2s cubic-bezier(.2,.8,.2,1)";
        sheet.style.transform = "translateY(110%)";
        close();
      } else {
        sheet.style.transition = "";
        sheet.style.transform = "";
      }
      dy = 0;
    };
    header.addEventListener("pointerup", up);
    header.addEventListener("pointercancel", up);
  }

  // ---------------------------------------------------------------------------
  // toast
  // ---------------------------------------------------------------------------
  function toast(message, kind = "purple") {
    createRoot();
    const el = $("#sg-toast");
    const icon = kind === "red" ? ICON.x : kind === "purple" ? ICON.check : "";
    el.className = `sg-toast ${kind}`;
    el.innerHTML = `${icon}<span>${escapeHtml(message)}</span>`;
    void el.offsetWidth;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      if (!el.isConnected) return;
      el.classList.remove("show");
      if (!state) setTimeout(() => { if (!state) destroyRoot(); }, 400);
    }, 2800);
  }

  // ---------------------------------------------------------------------------
  // sending: everything goes through the backend function
  // ---------------------------------------------------------------------------
  class GiftError extends Error {
    constructor(message, code, data) { super(message); this.name = "GiftError"; this.code = code; this.data = data; }
  }

  function toGiftError(status, data, lang) {
    const code = data && data.code;
    const key = code && ERROR_KEYS[code];
    let msg;
    if (key) msg = t(key, lang);
    else if (status === 401) msg = t("sessionExpired", lang);
    else if (status >= 500 || !data) msg = t("serverError", lang);
    else msg = (data && data.error) || t("error", lang);
    return new GiftError(msg, code || `http_${status}`, data);
  }

  async function sendGiftRequest(s, payload) {
    const user = getAuth().currentUser;
    if (!user) throw new GiftError(t("noAccount", s.lang), "no_account");

    const attempt = async (forceRefresh) => {
      let token;
      try { token = await user.getIdToken(forceRefresh); }
      catch (_) { throw new GiftError(t("sessionExpired", s.lang), "session_expired"); }

      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
      try {
        const res = await fetch(s.endpoint, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: ctrl.signal
        });
        let data = null;
        try { data = await res.json(); } catch (_) {}
        return { res, data };
      } catch (_) {
        throw new GiftError(t("networkError", s.lang), "network");
      } finally {
        clearTimeout(timer);
      }
    };

    let { res, data } = await attempt(false);
    if (res.status === 401) ({ res, data } = await attempt(true)); // token may just have expired
    if (res.ok && data && data.ok) return data;
    throw toGiftError(res.status, data, s.lang);
  }

  async function performSend() {
    const s = state;
    if (!s || s.sendingGift || s.sent) return;

    s.recipientEmail = String(s.recipientEmail || "").trim();
    const rp = getRecipient();
    if (!rp || rp.email !== s.recipientEmail) await lookupRecipient();
    if (state !== s) return;

    const check = canSend();
    if (!check.ok) { setTopError(check.error); return; }

    const recipient = getRecipient();
    const gift = s.selectedGift;
    const ref = s.selectedGiftRef;
    const name = recipient.displayName || recipient.email;

    s.sendingGift = true;
    s.topError = null;
    render();

    try {
      const res = await sendGiftRequest(s, {
        recipientEmail: recipient.email,
        ugcId: ref.ugcId,
        typeId: Number(ref.typeId) === 0 ? 0 : 1,
        author: ref.author,
        giftMessage: s.giftMessage,
        giftImageUrl: s.giftImageUrl,
        description: t("giftDescription", s.lang, { name }).slice(0, 200)
      });
      if (state !== s) return;
      if (Number.isFinite(res.coins)) s.currentCoins = res.coins;
      s.sendingGift = false;
      s.sent = true;
      render();
      showSuccess(s, name, res);
    } catch (err) {
      if (state !== s) return;
      s.sendingGift = false;
      // keep the local view in sync with what the server says
      if (err.data && Number.isFinite(err.data.coins)) s.currentCoins = err.data.coins;
      setTopError((err && err.message) || tt("error"));
    }
  }

  function showSuccess(s, name, res) {
    setText($("#sg-success-text"), tt("onItsWay", { name }));
    const bal = $("#sg-success-bal");
    if (Number.isFinite(res.coins)) bal.textContent = df(res.coins);
    bal.style.display = Number.isFinite(res.coins) ? "" : "none";
    $(".sg-sheet").classList.add("success");
    clearTimeout(successTimer);
    successTimer = setTimeout(() => { if (state === s) close(); }, 3400);
  }

  // ---------------------------------------------------------------------------
  // public api
  // ---------------------------------------------------------------------------
  return {
    open,
    close,
    toast,
    configure(cfg) {
      if (cfg && typeof cfg.endpoint === "string" && cfg.endpoint) ENDPOINT = cfg.endpoint;
    },
    setLanguage(lang) {
      if (state && isAllowedLang(lang)) {
        state.lang = lang;
        render();
      }
    },
    getState() {
      return state ? JSON.parse(JSON.stringify(state, (k, v) => (v instanceof Set ? Array.from(v) : v))) : null;
    }
  };
});