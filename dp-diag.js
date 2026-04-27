// dp-diag.js
// Reusable dialog utility for terms, alerts, confirms, custom actions, etc.
// Usage:
//   const result = await DPDiag.open({
//     title: 'Updated Terms of Service',
//     description: 'The Terms of Service have changed.',
//     text: 'By accepting, you confirm that you agree to the current terms.',
//     link: { label: 'Read the full Terms', href: 'https://example.com', target: '_blank' },
//     buttons: [
//       { id: 'decline', label: 'Decline', variant: 'secondary', value: false },
//       { id: 'accept', label: 'Accept', variant: 'primary', value: true, autofocus: true }
//     ]
//   });
//
// Optional quick helpers:
//   await DPDiag.alert({ title, text });
//   const ok = await DPDiag.confirm({ title, text });

(function () {
  const STYLE_ID = 'dp-diag-styles';
  const ROOT_ID = 'dp-diag-overlay';

  const defaults = {
    title: 'Dialog',
    description: '',
    text: '',
    html: '',
    link: null,
    buttons: [],
    maxWidth: 720,
    closeOnBackdrop: true,
    closeOnEscape: true,
    showCloseButton: false,
    preserveScroll: true,
    autofocus: true,
  };

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${ROOT_ID} {
        position: fixed;
        inset: 0;
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        box-sizing: border-box;
        background: rgba(0, 0, 0, 0.72);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial;
      }

      #${ROOT_ID} .dp-diag-shell {
        width: min(var(--dp-diag-maxw, 720px), 100%);
        max-height: min(86vh, 860px);
        overflow: hidden;
        border-radius: 22px;
        border: 1px solid var(--dp-diag-border, rgba(255,255,255,0.08));
        background:
          radial-gradient(1200px 300px at 50% 0%, rgba(168, 85, 247, 0.12), transparent 55%),
          linear-gradient(180deg, var(--dp-diag-bg-top, rgba(28,28,30,0.98)), var(--dp-diag-bg-bottom, rgba(18,18,20,0.98)));
        color: var(--dp-diag-text, #f3f4f6);
        box-shadow:
          0 30px 90px rgba(0, 0, 0, 0.5),
          inset 0 1px 0 rgba(255,255,255,0.05);
        transform: translateY(8px) scale(0.985);
        opacity: 0;
        animation: dpDiagIn 180ms ease forwards;
      }

      @keyframes dpDiagIn {
        to {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
      }

      #${ROOT_ID} .dp-diag-card {
        display: flex;
        flex-direction: column;
        max-height: min(86vh, 860px);
      }

      #${ROOT_ID} .dp-diag-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        padding: 22px 22px 0 22px;
      }

      #${ROOT_ID} .dp-diag-title-wrap {
        min-width: 0;
      }

      #${ROOT_ID} .dp-diag-kicker {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
        padding: 6px 10px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.04);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.02em;
        color: rgba(255,255,255,0.82);
        user-select: none;
      }

      #${ROOT_ID} .dp-diag-title {
        margin: 0;
        font-size: 22px;
        line-height: 1.15;
        font-weight: 800;
        letter-spacing: -0.02em;
        word-break: break-word;
      }

      #${ROOT_ID} .dp-diag-close {
        appearance: none;
        border: none;
        background: rgba(255,255,255,0.06);
        color: inherit;
        width: 38px;
        height: 38px;
        border-radius: 12px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        transition: transform 140ms ease, background-color 140ms ease, border-color 140ms ease;
        border: 1px solid rgba(255,255,255,0.06);
      }

      #${ROOT_ID} .dp-diag-close:hover {
        background: rgba(255,255,255,0.09);
      }

      #${ROOT_ID} .dp-diag-close:active {
        transform: translateY(1px);
      }

      #${ROOT_ID} .dp-diag-close:focus-visible,
      #${ROOT_ID} .dp-diag-action:focus-visible,
      #${ROOT_ID} a:focus-visible {
        outline: 2px solid var(--dp-diag-ring, rgba(168, 85, 247, 0.45));
        outline-offset: 2px;
      }

      #${ROOT_ID} .dp-diag-body {
        padding: 18px 22px 0 22px;
        overflow: auto;
        overscroll-behavior: contain;
      }

      #${ROOT_ID} .dp-diag-copy {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      #${ROOT_ID} .dp-diag-description {
        margin: 0;
        font-size: 14px;
        line-height: 1.65;
        color: var(--dp-diag-muted, rgba(255,255,255,0.82));
      }

      #${ROOT_ID} .dp-diag-text {
        margin: 0;
        font-size: 14px;
        line-height: 1.7;
        color: var(--dp-diag-text, #f3f4f6);
        white-space: pre-wrap;
        word-break: break-word;
      }

      #${ROOT_ID} .dp-diag-html {
        font-size: 14px;
        line-height: 1.7;
        color: var(--dp-diag-text, #f3f4f6);
      }

      #${ROOT_ID} .dp-diag-html a,
      #${ROOT_ID} .dp-diag-link {
        color: var(--dp-diag-link, #c4b5fd);
        text-decoration: underline;
        text-underline-offset: 2px;
      }

      #${ROOT_ID} .dp-diag-link-row {
        margin-top: 2px;
      }

      #${ROOT_ID} .dp-diag-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding: 18px 22px 22px 22px;
        margin-top: 18px;
        border-top: 1px solid rgba(255,255,255,0.08);
        flex-wrap: wrap;
      }

      #${ROOT_ID} .dp-diag-action {
        appearance: none;
        border: 1px solid transparent;
        border-radius: 14px;
        padding: 11px 15px;
        min-height: 42px;
        font: inherit;
        font-weight: 700;
        letter-spacing: 0.01em;
        cursor: pointer;
        transition: transform 140ms ease, background-color 140ms ease, border-color 140ms ease, opacity 140ms ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        user-select: none;
      }

      #${ROOT_ID} .dp-diag-action:hover {
        transform: translateY(-1px);
      }

      #${ROOT_ID} .dp-diag-action:active {
        transform: translateY(1px);
      }

      #${ROOT_ID} .dp-diag-primary {
        background: linear-gradient(180deg, #8b5cf6, #6d28d9);
        color: white;
        box-shadow: 0 8px 24px rgba(109, 40, 217, 0.22);
      }

      #${ROOT_ID} .dp-diag-secondary {
        background: rgba(255,255,255,0.06);
        color: inherit;
        border-color: rgba(255,255,255,0.08);
      }

      #${ROOT_ID} .dp-diag-danger {
        background: linear-gradient(180deg, rgba(239, 68, 68, 0.95), rgba(185, 28, 28, 0.95));
        color: white;
      }

      #${ROOT_ID} .dp-diag-ghost {
        background: transparent;
        color: inherit;
        border-color: rgba(255,255,255,0.08);
      }

      #${ROOT_ID} .dp-diag-subtle {
        background: rgba(255,255,255,0.04);
        color: inherit;
        border-color: rgba(255,255,255,0.06);
      }

      #${ROOT_ID} .dp-diag-action[disabled] {
        opacity: 0.55;
        cursor: not-allowed;
        transform: none !important;
      }

      @media (max-width: 640px) {
        #${ROOT_ID} {
          padding: 12px;
        }

        #${ROOT_ID} .dp-diag-shell {
          max-height: 90vh;
          border-radius: 18px;
        }

        #${ROOT_ID} .dp-diag-head,
        #${ROOT_ID} .dp-diag-body,
        #${ROOT_ID} .dp-diag-footer {
          padding-left: 16px;
          padding-right: 16px;
        }

        #${ROOT_ID} .dp-diag-title {
          font-size: 20px;
        }

        #${ROOT_ID} .dp-diag-footer {
          justify-content: stretch;
        }

        #${ROOT_ID} .dp-diag-action {
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function normalizeButtons(buttons) {
    if (!Array.isArray(buttons) || !buttons.length) {
      return [
        { id: 'ok', label: 'OK', variant: 'primary', value: true, autofocus: true },
      ];
    }

    return buttons.map((btn, index) => {
      if (typeof btn === 'string') {
        return {
          id: `btn-${index}`,
          label: btn,
          variant: index === buttons.length - 1 ? 'primary' : 'secondary',
          value: btn,
          autofocus: index === buttons.length - 1,
        };
      }

      return {
        id: btn.id || `btn-${index}`,
        label: btn.label ?? `Button ${index + 1}`,
        variant: btn.variant || (index === buttons.length - 1 ? 'primary' : 'secondary'),
        value: Object.prototype.hasOwnProperty.call(btn, 'value') ? btn.value : (btn.id || btn.label || index),
        autofocus: !!btn.autofocus,
        disabled: !!btn.disabled,
        icon: btn.icon || '',
      };
    });
  }

  function closeExisting() {
    const existing = document.getElementById(ROOT_ID);
    if (existing) existing.remove();
  }

  function open(opts = {}) {
    ensureStyles();
    closeExisting();

    const config = {
      ...defaults,
      ...opts,
    };

    const buttons = normalizeButtons(config.buttons);

    return new Promise((resolve) => {
      const previousActive = document.activeElement;
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const root = document.createElement('div');
      root.id = ROOT_ID;
      root.setAttribute('role', 'presentation');

      root.style.setProperty('--dp-diag-maxw', `${Number(config.maxWidth) || 720}px`);

      const shell = document.createElement('div');
      shell.className = 'dp-diag-shell';
      shell.setAttribute('role', 'dialog');
      shell.setAttribute('aria-modal', 'true');
      shell.setAttribute('aria-labelledby', 'dp-diag-title');

      const card = document.createElement('div');
      card.className = 'dp-diag-card';

      const head = document.createElement('div');
      head.className = 'dp-diag-head';

      const titleWrap = document.createElement('div');
      titleWrap.className = 'dp-diag-title-wrap';

      const kicker = document.createElement('div');
      kicker.className = 'dp-diag-kicker';
      kicker.textContent = config.kicker || 'Notice';

      const title = document.createElement('h2');
      title.className = 'dp-diag-title';
      title.id = 'dp-diag-title';
      title.textContent = config.title;

      titleWrap.appendChild(kicker);
      titleWrap.appendChild(title);

      head.appendChild(titleWrap);

      if (config.showCloseButton) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'dp-diag-close';
        closeBtn.type = 'button';
        closeBtn.setAttribute('aria-label', 'Close dialog');
        closeBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"/>
          </svg>
        `;
        closeBtn.addEventListener('click', () => finish(config.onCloseValue ?? null));
        head.appendChild(closeBtn);
      }

      const body = document.createElement('div');
      body.className = 'dp-diag-body';

      const copy = document.createElement('div');
      copy.className = 'dp-diag-copy';

      if (config.description) {
        const desc = document.createElement('p');
        desc.className = 'dp-diag-description';
        desc.textContent = config.description;
        copy.appendChild(desc);
      }

      if (config.text) {
        const text = document.createElement('p');
        text.className = 'dp-diag-text';
        text.textContent = config.text;
        copy.appendChild(text);
      }

      if (config.html) {
        const htmlWrap = document.createElement('div');
        htmlWrap.className = 'dp-diag-html';
        htmlWrap.innerHTML = config.html;
        copy.appendChild(htmlWrap);
      }

      if (config.link && config.link.href) {
        const linkRow = document.createElement('div');
        linkRow.className = 'dp-diag-link-row';
        const a = document.createElement('a');
        a.className = 'dp-diag-link';
        a.href = config.link.href;
        a.textContent = config.link.label || config.link.href;
        a.target = config.link.target || '_blank';
        a.rel = config.link.rel || 'noopener noreferrer';
        linkRow.appendChild(a);
        copy.appendChild(linkRow);
      }

      body.appendChild(copy);

      const footer = document.createElement('div');
      footer.className = 'dp-diag-footer';

      const cleanup = () => {
        document.removeEventListener('keydown', onKeydown, true);
        document.removeEventListener('focus', onFocus, true);
        if (config.preserveScroll) window.scrollTo(0, scrollY);
        root.remove();
        if (previousActive && typeof previousActive.focus === 'function') {
          try { previousActive.focus(); } catch (_) {}
        }
      };

      const finish = (value) => {
        cleanup();
        resolve(value);
      };

      const onKeydown = (e) => {
        if (e.key === 'Escape' && config.closeOnEscape) {
          e.preventDefault();
          finish(false);
          return;
        }

        if (e.key !== 'Tab') return;

        const focusable = root.querySelectorAll('button, a, input, textarea, select, [tabindex]:not([tabindex="-1"])');
        const list = Array.from(focusable).filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
        if (!list.length) return;

        const first = list[0];
        const last = list[list.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };

      const onFocus = (e) => {
        if (!root.contains(e.target)) {
          const firstFocusable = root.querySelector('button:not([disabled]), a, [tabindex]:not([tabindex="-1"])');
          if (firstFocusable && typeof firstFocusable.focus === 'function') {
            firstFocusable.focus();
          }
        }
      };

      root.addEventListener('click', (e) => {
        const clickedBackdrop = e.target === root;
        if (clickedBackdrop && config.closeOnBackdrop) {
          finish(false);
        }
      });

      buttons.forEach((btn, index) => {
        const action = document.createElement('button');
        action.type = 'button';
        action.className = `dp-diag-action dp-diag-${btn.variant || 'secondary'}`;
        action.dataset.buttonId = btn.id;
        action.textContent = btn.label;
        action.disabled = !!btn.disabled;

        if (btn.icon) {
          const icon = document.createElement('span');
          icon.innerHTML = btn.icon;
          action.prepend(icon);
        }

        action.addEventListener('click', () => {
          if (btn.onClick && typeof btn.onClick === 'function') {
            const maybe = btn.onClick({ close: finish, root, button: btn });
            if (maybe === false) return;
            if (maybe && typeof maybe.then === 'function') {
              maybe.then(result => {
                if (result !== undefined) finish(result);
                else finish(btn.value);
              }).catch(() => finish(btn.value));
              return;
            }
          }
          finish(btn.value);
        });

        footer.appendChild(action);

        if (config.autofocus && (btn.autofocus || (!buttons.some(b => b.autofocus) && index === buttons.length - 1))) {
          requestAnimationFrame(() => action.focus());
        }
      });

      card.appendChild(head);
      card.appendChild(body);
      card.appendChild(footer);
      shell.appendChild(card);
      root.appendChild(shell);
      document.body.appendChild(root);

      if (config.closeOnEscape) {
        document.addEventListener('keydown', onKeydown, true);
      } else {
        document.addEventListener('keydown', onKeydown, true);
      }

      document.addEventListener('focus', onFocus, true);

      if (!config.autofocus) {
        shell.setAttribute('tabindex', '-1');
        shell.focus();
      }
    });
  }

  function alert(options = {}) {
    return open({
      ...options,
      buttons: options.buttons || [
        { id: 'ok', label: 'OK', variant: 'primary', value: true, autofocus: true },
      ],
      closeOnBackdrop: options.closeOnBackdrop ?? true,
      closeOnEscape: options.closeOnEscape ?? true,
    });
  }

  function confirm(options = {}) {
    return open({
      ...options,
      buttons: options.buttons || [
        { id: 'cancel', label: options.cancelText || 'Cancel', variant: 'secondary', value: false },
        { id: 'ok', label: options.okText || 'Accept', variant: 'primary', value: true, autofocus: true },
      ],
    });
  }

  function promptLike(options = {}) {
    return open(options);
  }

  window.DPDiag = {
    open,
    alert,
    confirm,
    promptLike,
    close: closeExisting,
  };
})();
