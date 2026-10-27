/* login-i18n.js — language from address bar (/es/login, /ja/login.html, ...),
   then ?lang=, then navigator.languages, then English.
   English strings are the keys, so English is the built-in fallback and any
   string without a translation is simply left as-is.
   Value arrays are ordered: [ru, ja, de, es].
   Exposes window.tr(str) and window.LANG. Existing code needs no changes for
   static text or toasts: a MutationObserver translates text/attributes that
   match a key, including text set later via textContent. */
(function () {
  var L = ["ru", "ja", "de", "es"], SUP = ["en"].concat(L);

  function detect() {
    var seg = (location.pathname.split("/").filter(Boolean)[0] || "").toLowerCase();
    if (SUP.indexOf(seg) > -1) return seg;
    var q = (new URLSearchParams(location.search).get("lang") || "").toLowerCase().slice(0, 2);
    if (SUP.indexOf(q) > -1) return q;
    var nl = navigator.languages || [navigator.language || "en"];
    for (var i = 0; i < nl.length; i++) {
      var c = String(nl[i]).toLowerCase().slice(0, 2);
      if (SUP.indexOf(c) > -1) return c;
    }
    return "en";
  }
  var lang = detect(), idx = L.indexOf(lang);

  var D = {
    "Login": ["Вход", "ログイン", "Anmelden", "Iniciar sesión"],
    "Sign in": ["Войти", "サインイン", "Anmelden", "Iniciar sesión"],
    "New user?": ["Впервые здесь?", "初めてご利用ですか？", "Neu hier?", "¿Eres nuevo?"],
    "Create an account": ["Создать аккаунт", "アカウントを作成", "Konto erstellen", "Crear una cuenta"],
    "Username": ["Имя пользователя", "ユーザー名", "Benutzername", "Nombre de usuario"],
    "yourname": ["ваше_имя", "あなたの名前", "deinname", "tunombre"],
    "We'll check both your account types automatically.": ["Мы автоматически проверим оба типа аккаунтов.", "両方のアカウント種別を自動的に確認します。", "Wir prüfen automatisch beide Kontotypen.", "Comprobaremos automáticamente ambos tipos de cuenta."],
    "Continue": ["Продолжить", "続行", "Weiter", "Continuar"],
    "Register instead": ["Зарегистрироваться", "代わりに登録する", "Stattdessen registrieren", "Registrarse en su lugar"],
    "Or": ["Или", "または", "Oder", "O"],
    "Log in to management": ["Войти в панель управления", "管理パネルにログイン", "Bei der Verwaltung anmelden", "Iniciar sesión en la administración"],
    "Log in with a legacy account": ["Войти через устаревший аккаунт", "レガシーアカウントでログイン", "Mit einem Legacy-Konto anmelden", "Iniciar sesión con una cuenta heredada"],
    "Log in with Playgrounds": ["Войти через Playgrounds", "Playgroundsでログイン", "Mit Playgrounds anmelden", "Iniciar sesión con Playgrounds"],
    "Get help signing in": ["Помощь со входом", "ログインのヘルプ", "Hilfe bei der Anmeldung", "Obtener ayuda para iniciar sesión"],
    "Go back": ["Назад", "戻る", "Zurück", "Volver"],
    "Back": ["Назад", "戻る", "Zurück", "Volver"],
    "Enter your password": ["Введите пароль", "パスワードを入力", "Passwort eingeben", "Introduce tu contraseña"],
    "Profile picture": ["Фото профиля", "プロフィール画像", "Profilbild", "Foto de perfil"],
    "Verified": ["Подтверждён", "認証済み", "Verifiziert", "Verificado"],
    "Not you?": ["Это не вы?", "あなたではありませんか？", "Nicht du?", "¿No eres tú?"],
    "Password": ["Пароль", "パスワード", "Passwort", "Contraseña"],
    "Log in": ["Войти", "ログイン", "Anmelden", "Iniciar sesión"],
    "Forgot password?": ["Забыли пароль?", "パスワードをお忘れですか？", "Passwort vergessen?", "¿Olvidaste tu contraseña?"],
    "Forgot email?": ["Забыли почту?", "メールアドレスをお忘れですか？", "E-Mail vergessen?", "¿Olvidaste tu correo?"],
    "Multiple accounts found": ["Найдено несколько аккаунтов", "複数のアカウントが見つかりました", "Mehrere Konten gefunden", "Se encontraron varias cuentas"],
    "Choose an account": ["Выберите аккаунт", "アカウントを選択", "Konto auswählen", "Elige una cuenta"],
    "This username matches more than one account. Pick the one you want to log in to.": ["Это имя пользователя соответствует нескольким аккаунтам. Выберите нужный.", "このユーザー名は複数のアカウントに一致します。ログインするアカウントを選択してください。", "Dieser Benutzername gehört zu mehr als einem Konto. Wähle das Konto, bei dem du dich anmelden möchtest.", "Este nombre de usuario coincide con más de una cuenta. Elige la cuenta en la que quieres iniciar sesión."],
    "App logo": ["Логотип приложения", "アプリのロゴ", "App-Logo", "Logotipo de la aplicación"],
    "Authorize": ["Разрешить", "許可する", "Autorisieren", "Autorizar"],
    "this app": ["это приложение", "このアプリ", "diese App", "esta aplicación"],
    "by {0}": ["от {0}", "作成者: {0}", "von {0}", "por {0}"],
    "Unknown": ["Неизвестно", "不明", "Unbekannt", "Desconocido"],
    "Wants to access your account": ["Запрашивает доступ к вашему аккаунту", "あなたのアカウントへのアクセスを求めています", "Möchte auf dein Konto zugreifen", "Quiere acceder a tu cuenta"],
    "Signed in": ["Вы вошли", "ログイン済み", "Angemeldet", "Sesión iniciada"],
    "Switch account": ["Сменить аккаунт", "アカウントを切り替える", "Konto wechseln", "Cambiar de cuenta"],
    "This will allow the app to": ["Это позволит приложению", "これにより、アプリは次のことができるようになります", "Damit erlaubst du der App,", "Esto permitirá a la aplicación"],
    "Cancel": ["Отмена", "キャンセル", "Abbrechen", "Cancelar"],
    "Authorization cancelled": ["Авторизация отменена", "認可がキャンセルされました", "Autorisierung abgebrochen", "Autorización cancelada"],
    "You chose not to authorize this app. You can safely close this window, or go back home.": ["Вы отказались авторизовать это приложение. Можно спокойно закрыть окно или вернуться на главную.", "このアプリの認可をキャンセルしました。このウィンドウを閉じるか、ホームに戻ってください。", "Du hast die Autorisierung dieser App abgelehnt. Du kannst dieses Fenster schließen oder zur Startseite zurückkehren.", "Decidiste no autorizar esta aplicación. Puedes cerrar esta ventana con tranquilidad o volver al inicio."],
    "Go home": ["На главную", "ホームへ", "Zur Startseite", "Ir al inicio"],
    "This account needs to be migrated": ["Аккаунт необходимо перенести", "このアカウントは移行が必要です", "Dieses Konto muss migriert werden", "Esta cuenta debe migrarse"],
    "Continue without app login": ["Продолжить без входа в приложение", "アプリへのログインなしで続行", "Ohne App-Anmeldung fortfahren", "Continuar sin iniciar sesión en la app"],
    "You're logging in to:": ["Вы входите в:", "ログイン先:", "Du meldest dich an bei:", "Estás iniciando sesión en:"],
    "Unnamed app": ["Приложение без названия", "名前のないアプリ", "Unbenannte App", "Aplicación sin nombre"],
    "Only log in if you trust this app": ["Входите, только если доверяете этому приложению", "このアプリを信頼できる場合のみログインしてください", "Melde dich nur an, wenn du dieser App vertraust", "Inicia sesión solo si confías en esta aplicación"],
    "Cancel OAuth": ["Отменить OAuth", "OAuthをキャンセル", "OAuth abbrechen", "Cancelar OAuth"],
    "Use current session": ["Использовать текущий сеанс", "現在のセッションを使用", "Aktuelle Sitzung verwenden", "Usar la sesión actual"],
    "Email": ["Эл. почта", "メールアドレス", "E-Mail", "Correo electrónico"],
    "Sign in with the email address tied to your legacy account.": ["Войдите с адресом почты, привязанным к устаревшему аккаунту.", "レガシーアカウントに紐づくメールアドレスでログインします。", "Melde dich mit der E-Mail-Adresse deines Legacy-Kontos an.", "Inicia sesión con el correo asociado a tu cuenta heredada."],
    "Legacy login is available until Dec 31, 2026.": ["Устаревший вход доступен до 31 декабря 2026 г.", "レガシーログインは2026年12月31日まで利用できます。", "Die Legacy-Anmeldung ist bis zum 31. Dezember 2026 verfügbar.", "El inicio de sesión heredado estará disponible hasta el 31 de diciembre de 2026."],
    "Legacy accounts will be discontinued on Dec 31, 2026. Migrate to a username soon.": ["Устаревшие аккаунты будут отключены 31 декабря 2026 г. Скоро перейдите на имя пользователя.", "レガシーアカウントは2026年12月31日に終了します。早めにユーザー名へ移行してください。", "Legacy-Konten werden am 31. Dezember 2026 eingestellt. Migriere bald auf einen Benutzernamen.", "Las cuentas heredadas se descontinuarán el 31 de diciembre de 2026. Migra pronto a un nombre de usuario."],
    "Use username instead": ["Использовать имя пользователя", "ユーザー名を使用", "Stattdessen Benutzernamen verwenden", "Usar nombre de usuario"],
    "Checking might take a few seconds.": ["Проверка может занять несколько секунд.", "確認には数秒かかる場合があります。", "Die Prüfung kann einige Sekunden dauern.", "La comprobación puede tardar unos segundos."],
    "Couldn't verify the current date. Check your connection and try again.": ["Не удалось проверить текущую дату. Проверьте соединение и повторите попытку.", "現在の日付を確認できませんでした。接続を確認してもう一度お試しください。", "Das aktuelle Datum konnte nicht geprüft werden. Prüfe deine Verbindung und versuche es erneut.", "No se pudo verificar la fecha actual. Comprueba tu conexión e inténtalo de nuevo."],
    "Legacy accounts have been migrated and can no longer log in this way.": ["Устаревшие аккаунты перенесены и больше не могут входить таким способом.", "レガシーアカウントは移行済みで、この方法ではログインできなくなりました。", "Legacy-Konten wurden migriert und können sich so nicht mehr anmelden.", "Las cuentas heredadas se han migrado y ya no pueden iniciar sesión de este modo."],
    "Legacy accounts can't be used to log in to apps. Migrate from Settings first.": ["Устаревшие аккаунты нельзя использовать для входа в приложения. Сначала выполните перенос в настройках.", "レガシーアカウントではアプリにログインできません。先に設定から移行してください。", "Mit Legacy-Konten kann man sich nicht bei Apps anmelden. Migriere zuerst in den Einstellungen.", "Las cuentas heredadas no pueden usarse para iniciar sesión en aplicaciones. Migra primero desde Ajustes."],
    "Couldn't verify the legacy login window.": ["Не удалось проверить период устаревшего входа.", "レガシーログインの期間を確認できませんでした。", "Der Zeitraum für die Legacy-Anmeldung konnte nicht geprüft werden.", "No se pudo verificar el periodo de inicio de sesión heredado."],
    "Redirecting...": ["Перенаправление...", "リダイレクトしています...", "Weiterleitung...", "Redirigiendo..."],
    "Authorizing...": ["Авторизация...", "認可しています...", "Autorisierung läuft...", "Autorizando..."],
    "This app's redirect is misconfigured.": ["Перенаправление этого приложения настроено неверно.", "このアプリのリダイレクト設定が正しくありません。", "Die Weiterleitung dieser App ist falsch konfiguriert.", "La redirección de esta aplicación está mal configurada."],
    "This app isn't allowed to use that return link.": ["Этому приложению не разрешено использовать эту ссылку возврата.", "このアプリはそのリターンリンクを使用できません。", "Diese App darf diesen Rückkehr-Link nicht verwenden.", "Esta aplicación no puede usar ese enlace de retorno."],
    "Couldn't complete authorization. Try again.": ["Не удалось завершить авторизацию. Повторите попытку.", "認可を完了できませんでした。もう一度お試しください。", "Autorisierung konnte nicht abgeschlossen werden. Versuche es erneut.", "No se pudo completar la autorización. Inténtalo de nuevo."],
    "Enter your username or email.": ["Введите имя пользователя или почту.", "ユーザー名またはメールアドレスを入力してください。", "Gib deinen Benutzernamen oder deine E-Mail ein.", "Introduce tu nombre de usuario o correo."],
    "Couldn't verify the current date. Try again.": ["Не удалось проверить текущую дату. Повторите попытку.", "現在の日付を確認できませんでした。もう一度お試しください。", "Das aktuelle Datum konnte nicht geprüft werden. Versuche es erneut.", "No se pudo verificar la fecha actual. Inténtalo de nuevo."],
    "Enter a valid email address.": ["Введите корректный адрес почты.", "有効なメールアドレスを入力してください。", "Gib eine gültige E-Mail-Adresse ein.", "Introduce un correo válido."],
    "Enter a valid username.": ["Введите корректное имя пользователя.", "有効なユーザー名を入力してください。", "Gib einen gültigen Benutzernamen ein.", "Introduce un nombre de usuario válido."],
    "Looking up your account...": ["Поиск вашего аккаунта...", "アカウントを検索しています...", "Dein Konto wird gesucht...", "Buscando tu cuenta..."],
    "Couldn't verify that username. Try again.": ["Не удалось проверить имя пользователя. Повторите попытку.", "ユーザー名を確認できませんでした。もう一度お試しください。", "Der Benutzername konnte nicht geprüft werden. Versuche es erneut.", "No se pudo verificar ese nombre de usuario. Inténtalo de nuevo."],
    "No account found with that username.": ["Аккаунт с таким именем не найден.", "そのユーザー名のアカウントは見つかりません。", "Kein Konto mit diesem Benutzernamen gefunden.", "No se encontró ninguna cuenta con ese nombre de usuario."],
    "Enter your password.": ["Введите пароль.", "パスワードを入力してください。", "Gib dein Passwort ein.", "Introduce tu contraseña."],
    "Your account is banned": ["Ваш аккаунт заблокирован", "アカウントが停止されています", "Dein Konto wurde gesperrt", "Tu cuenta está bloqueada"],
    "The email or password is incorrect.": ["Неверная почта или пароль.", "メールアドレスまたはパスワードが正しくありません。", "Die E-Mail oder das Passwort ist falsch.", "El correo o la contraseña son incorrectos."],
    "Please enter a valid email address.": ["Введите корректный адрес почты.", "有効なメールアドレスを入力してください。", "Bitte gib eine gültige E-Mail-Adresse ein.", "Introduce una dirección de correo válida."],
    "This account has been disabled.": ["Этот аккаунт отключён.", "このアカウントは無効化されています。", "Dieses Konto wurde deaktiviert.", "Esta cuenta ha sido deshabilitada."],
    "Too many login attempts. Please try again later.": ["Слишком много попыток входа. Повторите позже.", "ログイン試行回数が多すぎます。しばらくしてからもう一度お試しください。", "Zu viele Anmeldeversuche. Bitte versuche es später erneut.", "Demasiados intentos de inicio de sesión. Inténtalo de nuevo más tarde."],
    "Couldn't connect to the server. Check your internet connection and try again.": ["Не удалось подключиться к серверу. Проверьте интернет и повторите попытку.", "サーバーに接続できません。インターネット接続を確認してもう一度お試しください。", "Verbindung zum Server fehlgeschlagen. Prüfe deine Internetverbindung und versuche es erneut.", "No se pudo conectar con el servidor. Comprueba tu conexión a internet e inténtalo de nuevo."],
    "Your session has expired. Please log in again.": ["Сеанс истёк. Войдите снова.", "セッションの有効期限が切れました。もう一度ログインしてください。", "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.", "Tu sesión ha caducado. Inicia sesión de nuevo."],
    "Please log in again to continue.": ["Войдите снова, чтобы продолжить.", "続行するには再度ログインしてください。", "Bitte melde dich erneut an, um fortzufahren.", "Inicia sesión de nuevo para continuar."],
    "Password login is currently unavailable.": ["Вход по паролю сейчас недоступен.", "現在、パスワードでのログインは利用できません。", "Die Anmeldung per Passwort ist derzeit nicht verfügbar.", "El inicio de sesión con contraseña no está disponible por ahora."],
    "Something went wrong on our side. Please try again.": ["Что-то пошло не так на нашей стороне. Повторите попытку.", "こちら側で問題が発生しました。もう一度お試しください。", "Auf unserer Seite ist etwas schiefgelaufen. Bitte versuche es erneut.", "Algo salió mal por nuestra parte. Inténtalo de nuevo."],
    "That password is not strong enough.": ["Этот пароль недостаточно надёжный.", "このパスワードは強度が不足しています。", "Dieses Passwort ist nicht stark genug.", "Esa contraseña no es lo bastante segura."],
    "Unable to log in right now. Please try again.": ["Сейчас не удаётся войти. Повторите попытку.", "現在ログインできません。もう一度お試しください。", "Anmeldung derzeit nicht möglich. Bitte versuche es erneut.", "No se puede iniciar sesión ahora. Inténtalo de nuevo."],
    "Custom return link: this sign-in will return to {0} instead of this app's usual link.": ["Своя ссылка возврата: после входа вы вернётесь на {0} вместо обычной ссылки приложения.", "カスタムリターンリンク: このログイン後は、アプリの通常のリンクではなく {0} に戻ります。", "Eigener Rückkehr-Link: Nach der Anmeldung gelangst du zu {0} statt zum üblichen Link der App.", "Enlace de retorno personalizado: este inicio de sesión volverá a {0} en lugar del enlace habitual de la aplicación."],
    "Low": ["Низкий", "低", "Niedrig", "Bajo"],
    "Moderate": ["Средний", "中", "Mittel", "Medio"],
    "High": ["Высокий", "高", "Hoch", "Alto"],

    /* ---- Connected apps page ---- */
    "Connected apps": ["Подключённые приложения", "連携アプリ", "Verbundene Apps", "Aplicaciones conectadas"],
    "Apps and services that can access your account. Revoke access at any time.": ["Приложения и сервисы, у которых есть доступ к вашему аккаунту. Вы можете отозвать доступ в любой момент.", "あなたのアカウントにアクセスできるアプリとサービス。アクセスはいつでも取り消せます。", "Apps und Dienste, die auf dein Konto zugreifen können. Du kannst den Zugriff jederzeit widerrufen.", "Aplicaciones y servicios que pueden acceder a tu cuenta. Puedes revocar el acceso en cualquier momento."],
    "Revoke access": ["Отозвать доступ", "アクセスを取り消す", "Zugriff widerrufen", "Revocar acceso"],
    "Revoke all": ["Отозвать всё", "すべて取り消す", "Alle widerrufen", "Revocar todo"],
    "Authorized {0}": ["Авторизовано {0}", "認可日 {0}", "Autorisiert am {0}", "Autorizada el {0}"],
    "Last used {0}": ["Последнее использование {0}", "最終使用 {0}", "Zuletzt verwendet am {0}", "Último uso {0}"],
    "Never used": ["Не использовалось", "未使用", "Nie verwendet", "Nunca usada"],
    "Permissions": ["Разрешения", "権限", "Berechtigungen", "Permisos"],
    "No connected apps": ["Нет подключённых приложений", "連携アプリはありません", "Keine verbundenen Apps", "No hay aplicaciones conectadas"],
    "Apps you authorize will show up here.": ["Приложения, которым вы дадите доступ, появятся здесь.", "認可したアプリはここに表示されます。", "Apps, die du autorisierst, erscheinen hier.", "Las aplicaciones que autorices aparecerán aquí."],
    "Sign in to manage your connected apps.": ["Войдите, чтобы управлять подключёнными приложениями.", "連携アプリを管理するにはサインインしてください。", "Melde dich an, um deine verbundenen Apps zu verwalten.", "Inicia sesión para gestionar tus aplicaciones conectadas."],
    "Revoke access for {0}?": ["Отозвать доступ для {0}?", "{0} のアクセスを取り消しますか？", "Zugriff für {0} widerrufen?", "¿Revocar el acceso de {0}?"],
    "The app will be signed out and can no longer use your account. You can authorize it again later.": ["Приложение будет отключено и больше не сможет использовать ваш аккаунт. Позже вы сможете авторизовать его снова.", "アプリはサインアウトされ、あなたのアカウントを使用できなくなります。後でもう一度認可することもできます。", "Die App wird abgemeldet und kann dein Konto nicht mehr verwenden. Du kannst sie später erneut autorisieren.", "La aplicación se cerrará y ya no podrá usar tu cuenta. Puedes volver a autorizarla más tarde."],
    "Revoke access for all apps?": ["Отозвать доступ для всех приложений?", "すべてのアプリのアクセスを取り消しますか？", "Zugriff für alle Apps widerrufen?", "¿Revocar el acceso de todas las aplicaciones?"],
    "Every connected app will be signed out.": ["Все подключённые приложения будут отключены.", "連携中のすべてのアプリがサインアウトされます。", "Alle verbundenen Apps werden abgemeldet.", "Todas las aplicaciones conectadas se cerrarán."],
    "Access revoked.": ["Доступ отозван.", "アクセスを取り消しました。", "Zugriff widerrufen.", "Acceso revocado."],
    "Couldn't load your apps. Try again.": ["Не удалось загрузить приложения. Повторите попытку.", "アプリを読み込めませんでした。もう一度お試しください。", "Apps konnten nicht geladen werden. Versuche es erneut.", "No se pudieron cargar tus aplicaciones. Inténtalo de nuevo."],
    "Couldn't revoke access. Try again.": ["Не удалось отозвать доступ. Повторите попытку.", "アクセスを取り消せませんでした。もう一度お試しください。", "Zugriff konnte nicht widerrufen werden. Versuche es erneut.", "No se pudo revocar el acceso. Inténtalo de nuevo."],
    "Loading...": ["Загрузка...", "読み込み中...", "Wird geladen...", "Cargando..."],

    /* ---- OAuth scopes ---- */
    "View your public profile information": ["Просмотр информации вашего публичного профиля", "公開プロフィール情報の表示", "Deine öffentlichen Profilinformationen ansehen", "Ver la información de tu perfil público"],
    "Edit your public profile": ["Редактирование публичного профиля", "公開プロフィールの編集", "Dein öffentliches Profil bearbeiten", "Editar tu perfil público"],
    "View your badges and verification status": ["Просмотр значков и статуса верификации", "バッジと認証ステータスの表示", "Deine Abzeichen und deinen Verifizierungsstatus ansehen", "Ver tus insignias y estado de verificación"],
    "View and edit your biography": ["Просмотр и редактирование биографии", "自己紹介の表示と編集", "Deine Biografie ansehen und bearbeiten", "Ver y editar tu biografía"],
    "View your email address": ["Просмотр адреса электронной почты", "メールアドレスの表示", "Deine E-Mail-Adresse ansehen", "Ver tu dirección de correo electrónico"],
    "View your username": ["Просмотр имени пользователя", "ユーザー名の表示", "Deinen Benutzernamen ansehen", "Ver tu nombre de usuario"],
    "View your profile picture": ["Просмотр фото профиля", "プロフィール画像の表示", "Dein Profilbild ansehen", "Ver tu foto de perfil"],
    "Change your profile picture": ["Изменение фото профиля", "プロフィール画像の変更", "Dein Profilbild ändern", "Cambiar tu foto de perfil"],
    "View your connections list": ["Просмотр списка контактов", "つながりリストの表示", "Deine Kontaktliste ansehen", "Ver tu lista de conexiones"],
    "Manage your connections": ["Управление контактами", "つながりの管理", "Deine Kontakte verwalten", "Gestionar tus conexiones"],
    "Send connection requests": ["Отправка запросов в контакты", "つながりリクエストの送信", "Kontaktanfragen senden", "Enviar solicitudes de conexión"],
    "Block or unblock users": ["Блокировка и разблокировка пользователей", "ユーザーのブロックとブロック解除", "Nutzer blockieren oder entsperren", "Bloquear o desbloquear usuarios"],
    "Read your private messages": ["Чтение личных сообщений", "プライベートメッセージの閲覧", "Deine privaten Nachrichten lesen", "Leer tus mensajes privados"],
    "Send messages on your behalf": ["Отправка сообщений от вашего имени", "あなたの代わりにメッセージを送信", "Nachrichten in deinem Namen senden", "Enviar mensajes en tu nombre"],
    "Access your message history": ["Доступ к истории сообщений", "メッセージ履歴へのアクセス", "Auf deinen Nachrichtenverlauf zugreifen", "Acceder a tu historial de mensajes"],
    "Send typing indicators": ["Отправка индикатора набора текста", "入力中インジケーターの送信", "Tippanzeigen senden", "Enviar indicadores de escritura"],
    "Run actions with admin permissions": ["Выполнение действий с правами администратора", "管理者権限でアクションを実行", "Aktionen mit Admin-Rechten ausführen", "Ejecutar acciones con permisos de administrador"],
    "Check whether you're an admin": ["Проверка, являетесь ли вы администратором", "管理者かどうかの確認", "Prüfen, ob du Admin bist", "Comprobar si eres administrador"],
    "Act as a client to run administrative actions": ["Работа в роли клиента для выполнения административных действий", "クライアントとして管理操作を実行", "Als Client administrative Aktionen ausführen", "Actuar como cliente para ejecutar acciones administrativas"],
    "View your notifications": ["Просмотр уведомлений", "通知の表示", "Deine Benachrichtigungen ansehen", "Ver tus notificaciones"],
    "View your account settings": ["Просмотр настроек аккаунта", "アカウント設定の表示", "Deine Kontoeinstellungen ansehen", "Ver la configuración de tu cuenta"],
    "Modify your account settings": ["Изменение настроек аккаунта", "アカウント設定の変更", "Deine Kontoeinstellungen ändern", "Modificar la configuración de tu cuenta"],
    "View your posts": ["Просмотр ваших публикаций", "投稿の表示", "Deine Beiträge ansehen", "Ver tus publicaciones"],
    "Create posts on your behalf": ["Создание публикаций от вашего имени", "あなたの代わりに投稿を作成", "Beiträge in deinem Namen erstellen", "Crear publicaciones en tu nombre"],
    "Delete your posts": ["Удаление ваших публикаций", "投稿の削除", "Deine Beiträge löschen", "Eliminar tus publicaciones"],
    "View comments on your posts": ["Просмотр комментариев к вашим публикациям", "投稿へのコメントの表示", "Kommentare zu deinen Beiträgen ansehen", "Ver los comentarios de tus publicaciones"],
    "Post comments on your behalf": ["Публикация комментариев от вашего имени", "あなたの代わりにコメントを投稿", "Kommentare in deinem Namen schreiben", "Publicar comentarios en tu nombre"],
    "React to posts and comments": ["Реакции на публикации и комментарии", "投稿やコメントへのリアクション", "Auf Beiträge und Kommentare reagieren", "Reaccionar a publicaciones y comentarios"],
    "View your gifts": ["Просмотр ваших подарков", "ギフトの表示", "Deine Geschenke ansehen", "Ver tus regalos"],
    "Send gifts on your behalf": ["Отправка подарков от вашего имени", "あなたの代わりにギフトを送信", "Geschenke in deinem Namen senden", "Enviar regalos en tu nombre"],
    "Claim gifts for your account": ["Получение подарков для вашего аккаунта", "あなたのアカウントでギフトを受け取る", "Geschenke für dein Konto einlösen", "Reclamar regalos para tu cuenta"],
    "View your inventory": ["Просмотр инвентаря", "インベントリの表示", "Dein Inventar ansehen", "Ver tu inventario"],
    "Browse marketplace listings": ["Просмотр товаров на маркетплейсе", "マーケットプレイスの出品を閲覧", "Marktplatzangebote durchsuchen", "Explorar los anuncios del mercado"],
    "Purchase items on your behalf": ["Покупка товаров от вашего имени", "あなたの代わりにアイテムを購入", "Artikel in deinem Namen kaufen", "Comprar artículos en tu nombre"],
    "View your active sessions": ["Просмотр активных сеансов", "アクティブなセッションの表示", "Deine aktiven Sitzungen ansehen", "Ver tus sesiones activas"],
    "View your security settings": ["Просмотр настроек безопасности", "セキュリティ設定の表示", "Deine Sicherheitseinstellungen ansehen", "Ver tu configuración de seguridad"],
    "Access your uploaded files": ["Доступ к загруженным файлам", "アップロードしたファイルへのアクセス", "Auf deine hochgeladenen Dateien zugreifen", "Acceder a tus archivos subidos"],
    "Maintain access when you are offline": ["Сохранение доступа, когда вы не в сети", "オフライン時もアクセスを維持", "Zugriff aufrechterhalten, wenn du offline bist", "Mantener el acceso cuando estés sin conexión"],
    "Create a token to log in without your password, only once": ["Создание токена для однократного входа без пароля", "パスワードなしで一度だけログインできるトークンを作成", "Ein Token erstellen, mit dem du dich einmalig ohne Passwort anmelden kannst", "Crear un token para iniciar sesión sin contraseña, una sola vez"]
  };

  /* innerHTML blocks (contain <b>/<a>), keyed by selector: [ru, ja, de, es] */
  var H = {
    "#migrationOverlay .sheet p": [
      "Аккаунты со старой почтой больше не могут входить в подключённые приложения. Откройте <b>Настройки</b>, войдя со старой почтой, чтобы перейти на имя пользователя, и повторите попытку.",
      "レガシーのメールアカウントでは、連携アプリにサインインできなくなりました。レガシーのメールアドレスでログインした状態で<b>設定</b>を開き、ユーザー名へ移行してから、もう一度お試しください。",
      "Mit Legacy-E-Mail-Konten kann man sich nicht mehr bei verbundenen Apps anmelden. Öffne die <b>Einstellungen</b>, während du mit deiner Legacy-E-Mail angemeldet bist, migriere auf einen Benutzernamen und versuche es erneut.",
      "Las cuentas heredadas de correo ya no pueden iniciar sesión en aplicaciones conectadas. Ve a <b>Ajustes</b> con tu correo heredado para migrar a un nombre de usuario y vuelve a intentarlo."],
    "#authorizeOfficialDisclaimer > span": [
      "<b>Это официальное приложение.</b> Перед авторизацией убедитесь, что вы скачали его из надёжного источника — официальные приложения никогда не просят вводить пароль нигде, кроме этой страницы.",
      "<b>これは公式アプリです。</b>認可する前に、信頼できる提供元からダウンロードしたことを確認してください。公式アプリがこのページ以外でパスワードの入力を求めることはありません。",
      "<b>Dies ist eine offizielle App.</b> Vergewissere dich vor der Autorisierung, dass du sie aus einer vertrauenswürdigen Quelle heruntergeladen hast – offizielle Apps verlangen dein Passwort niemals an anderer Stelle als auf dieser Seite.",
      "<b>Esta es una aplicación oficial.</b> Asegúrate de haberla descargado de una fuente de confianza antes de autorizar: las aplicaciones oficiales nunca te pedirán la contraseña en ningún sitio que no sea esta página."],
    "#authorizeFootnote": [
      "Продолжая, вы разрешаете приложению использовать ваши данные в соответствии с его условиями и политикой конфиденциальности. Вы можете отозвать доступ в любой момент в <a href=\"/connected-apps.html\">настройках</a>.",
      "続行すると、このアプリが独自の利用規約とプライバシーポリシーに従ってあなたの情報を使用することを許可したことになります。アクセス権は<a href=\"/connected-apps.html\">設定</a>からいつでも取り消せます。",
      "Wenn du fortfährst, erlaubst du dieser App, deine Daten gemäß ihren eigenen Nutzungsbedingungen und ihrer Datenschutzerklärung zu verwenden. Du kannst den Zugriff jederzeit in den <a href=\"/connected-apps.html\">Einstellungen</a> widerrufen.",
      "Al continuar, permites que esta aplicación use tu información de acuerdo con sus propios términos y política de privacidad. Puedes revocar el acceso en cualquier momento desde <a href=\"/connected-apps.html\">Ajustes</a>."]
  };

  function tr(s) {
    if (idx < 0) return s;
    var a = D[s];
    return a && a[idx] ? a[idx] : s;
  }
  window.tr = tr;
  window.LANG = lang;

  var ATTRS = ["placeholder", "aria-label", "title", "alt"];

  function trNode(n) {
    var s = n.nodeValue, t = s && s.trim();
    if (!t) return;
    var r = tr(t);
    if (r !== t) n.nodeValue = s.replace(t, function () { return r; });
  }
  function trAttrs(el) {
    for (var i = 0; i < ATTRS.length; i++) {
      var v = el.getAttribute && el.getAttribute(ATTRS[i]);
      if (v) { var r = tr(v); if (r !== v) el.setAttribute(ATTRS[i], r); }
    }
  }
  function walk(n) {
    if (n.nodeType === 3) return trNode(n);
    if (n.nodeType !== 1 || /^(SCRIPT|STYLE)$/.test(n.tagName)) return;
    trAttrs(n);
    for (var c = n.firstChild; c; c = c.nextSibling) walk(c);
  }

  function init() {
    document.documentElement.lang = lang;
    if (idx < 0) return; // English: nothing to do
    document.title = tr(document.title);
    for (var sel in H) {
      var el = document.querySelector(sel);
      if (el) el.innerHTML = H[sel][idx];
    }
    walk(document.body);
    new MutationObserver(function (ms) {
      ms.forEach(function (m) {
        if (m.type === "childList") m.addedNodes.forEach(walk);
        else if (m.type === "characterData") trNode(m.target);
        else trAttrs(m.target);
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();