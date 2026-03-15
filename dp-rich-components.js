/* RichText & RichMarkdown Web Components — FIXED
   - Fixes: emoji/tags parsing anywhere in text (not just at start), emojis render as <img> when map points to images,
     CSS typo fixed, reading raw text via textContent (not innerHTML), default text color set to white.
   - Usage unchanged: drop this module file in place of the old one and import as before.
*/

const DEFAULT_EMOJI_MAP = {
  verified: '/assets/verified.png',
  bughunter: '/assets/bughunt.png',
  admin: '/assets/ic_admin.webp',
  panel: '/assets/ic_owner.webp',
  member: '/org-owner.jpg',
  tester: '/assets/test.png',
  furry: '/assets/boykisser.png'
};

function escapeHtml(s) {
  return s.replace(/[&<>\"]+/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

// Simple URL / email regexes (not perfect but fine for chat content)
const urlRegex = /https?:\/\/[^\n\s)]+/i;
const urlFindRegex = /https?:\/\/[^\s)]+/ig;
const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

function buildLinkNode(url, textContent, component) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.textContent = textContent || url;
  a.addEventListener('click', (ev) => {
    const e = new CustomEvent('linkclick', {detail: {url}, bubbles: true, cancelable: true});
    component.dispatchEvent(e);
    if (e.defaultPrevented) ev.preventDefault();
  });
  return a;
}

function replaceInlineRich(text, options) {
  // options: {primaryColor, emojiMap, component}
  const fragment = document.createDocumentFragment();
  let remaining = text;

  // Patterns without start anchors — we will search for earliest match anywhere in the remaining string
  const patterns = [
    {type: 'link_md', re: /\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/i},
    {type: 'bold', re: /\*(.*?)\*/s},
    {type: 'italic', re: /_(.*?)_/s},
    {type: 'code', re: /`(.*?)`/s},
    {type: 'color', re: /<(red|cyan|green|blue|yellow)>(.*?)<\/\1>/s},
    {type: 'emoji', re: /:([a-zA-Z0-9_]+):/},
    {type: 'strike', re: /~~(.*?)~~/s},
    {type: 'sub', re: /~(.*?)~/s},
    {type: 'super', re: /\^(.*?)\^/s}
  ];

  while (remaining.length > 0) {
    // find earliest match among patterns anywhere in string
    let earliest = null;
    let earliestIndex = Infinity;
    let earliestMatch = null;

    for (const p of patterns) {
      // reset lastIndex just in case
      if (p.re.global) p.re.lastIndex = 0;
      const m = p.re.exec(remaining);
      if (m && typeof m.index === 'number' && m.index >= 0 && m.index < earliestIndex) {
        earliest = p; earliestMatch = m; earliestIndex = m.index;
      }
    }

    if (!earliest) {
      // No special patterns at all (but still detect raw URLs/emails anywhere)
      // If there is a URL or email somewhere, split before it so it can be processed on next loop
      const nextUrl = remaining.search(/https?:\/\//i);
      const nextEmail = remaining.search(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      let nextPos = -1;
      if (nextUrl >= 0 && nextEmail >= 0) nextPos = Math.min(nextUrl, nextEmail);
      else if (nextUrl >= 0) nextPos = nextUrl;
      else if (nextEmail >= 0) nextPos = nextEmail;

      if (nextPos > 0) {
        fragment.appendChild(document.createTextNode(remaining.slice(0, nextPos)));
        remaining = remaining.slice(nextPos);
        continue;
      }

      // nothing else, append remaining as text and break
      fragment.appendChild(document.createTextNode(remaining));
      break;
    }

    // If there's plain text before the earliest match, append it first
    if (earliestIndex > 0) {
      fragment.appendChild(document.createTextNode(remaining.slice(0, earliestIndex)));
    }

    const type = earliest.type; const m = earliestMatch;
    // process the matched token
    switch (type) {
      case 'link_md': {
        const title = m[1]; const url = m[2];
        fragment.appendChild(buildLinkNode(url, title, options.component));
        remaining = remaining.slice(earliestIndex + m[0].length);
        break;
      }
      case 'bold': {
        const sp = document.createElement('span'); sp.style.fontWeight = '700'; sp.textContent = m[1]; fragment.appendChild(sp);
        remaining = remaining.slice(earliestIndex + m[0].length);
        break;
      }
      case 'italic': {
        const sp = document.createElement('span'); sp.style.fontStyle = 'italic'; sp.textContent = m[1]; fragment.appendChild(sp);
        remaining = remaining.slice(earliestIndex + m[0].length);
        break;
      }
      case 'code': {
        const code = document.createElement('code'); code.textContent = m[1]; code.style.background = '#eee'; code.style.fontFamily = 'monospace'; code.style.padding = '0 4px'; fragment.appendChild(code);
        remaining = remaining.slice(earliestIndex + m[0].length);
        break;
      }
      case 'color': {
        const colorName = m[1]; const content = m[2];
        const sp = document.createElement('span');
        const col = ({red:'#d32f2f', cyan:'#00bcd4', green:'#388e3c', blue:'#1976d2', yellow:'#fbc02d'})[colorName] || 'inherit';
        sp.style.color = col; sp.textContent = content; fragment.appendChild(sp);
        remaining = remaining.slice(earliestIndex + m[0].length);
        break;
      }
      case 'emoji': {
        const id = m[1];
        const emojiMap = options.emojiMap || DEFAULT_EMOJI_MAP;
        const val = emojiMap[id];
        if (val && (val.startsWith('/') || val.startsWith('http') || /\.(png|jpe?g|webp|svg)$/i.test(val))) {
          const img = document.createElement('img');
          img.src = val;
          img.alt = ':' + id + ':';
          img.className = 'emoji-inline';
          img.width = 16; img.height = 16;
          img.style.verticalAlign = 'middle';
          img.style.objectFit = 'contain';
          fragment.appendChild(img);
        } else {
          const node = document.createElement('span'); node.className = 'emoji-inline';
          node.textContent = val || (':' + id + ':');
          fragment.appendChild(node);
        }
        remaining = remaining.slice(earliestIndex + m[0].length);
        break;
      }
      case 'strike': {
        const sp = document.createElement('span'); sp.style.textDecoration = 'line-through'; sp.textContent = m[1]; fragment.appendChild(sp);
        remaining = remaining.slice(earliestIndex + m[0].length);
        break;
      }
      case 'sub': {
        const sp = document.createElement('sub'); sp.textContent = m[1]; fragment.appendChild(sp);
        remaining = remaining.slice(earliestIndex + m[0].length);
        break;
      }
      case 'super': {
        const sp = document.createElement('sup'); sp.textContent = m[1]; fragment.appendChild(sp);
        remaining = remaining.slice(earliestIndex + m[0].length);
        break;
      }
      default:
        fragment.appendChild(document.createTextNode(m[0]));
        remaining = remaining.slice(earliestIndex + m[0].length);
    }
  }

  // After building the fragment, do a final pass to convert raw URLs/emails into links if they remain
  // (this handles URLs/emails that weren't matched by patterns above)
  const outFrag = document.createDocumentFragment();
  fragment.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      let txt = node.textContent;
      let cursor = 0;
      urlFindRegex.lastIndex = 0;
      while (true) {
        urlFindRegex.lastIndex = cursor;
        const u = urlFindRegex.exec(txt);
        if (!u) break;
        const idx = u.index;
        if (idx > cursor) outFrag.appendChild(document.createTextNode(txt.slice(cursor, idx)));
        outFrag.appendChild(buildLinkNode(u[0], u[0], options.component));
        cursor = idx + u[0].length;
      }
      if (cursor < txt.length) {
        // also check emails in the remainder
        let rem = txt.slice(cursor);
        const parts = rem.split(emailRegex);
        // split doesn't preserve matches; simpler approach: find emails via exec
        let emailCursor = 0; const eRe = new RegExp(emailRegex);
        while (true) {
          const em = eRe.exec(rem);
          if (!em) break;
          const eIdx = em.index;
          if (eIdx > emailCursor) outFrag.appendChild(document.createTextNode(rem.slice(emailCursor, eIdx)));
          outFrag.appendChild(buildLinkNode('mailto:' + em[0], em[0], options.component));
          emailCursor = eIdx + em[0].length;
          rem = rem.slice(emailCursor);
          emailCursor = 0;
        }
        if (rem.length) outFrag.appendChild(document.createTextNode(rem));
      }
    } else {
      outFrag.appendChild(node.cloneNode(true));
    }
  });

  return outFrag;
}

function parseMarkdownToFragment(md, options) {
  const container = document.createDocumentFragment();
  const lines = md.split(/\r?\n/);
  let i = 0;
  let inCodeFence = false; let codeAccum = [];

  while (i < lines.length) {
    const raw = lines[i];
    // fenced code
    if (raw.trim().startsWith('```')) {
      if (!inCodeFence) { inCodeFence = true; codeAccum = []; i++; continue; }
      else { // closing
        const pre = document.createElement('pre'); const code = document.createElement('code'); code.textContent = codeAccum.join('\n'); pre.appendChild(code); container.appendChild(pre);
        inCodeFence = false; i++; continue;
      }
    }
    if (inCodeFence) { codeAccum.push(raw); i++; continue; }

    // hr
    if (/^(---|\*\*\*|___)\s*$/.test(raw)) { const hr = document.createElement('div'); hr.className='hr-line'; hr.textContent='────────────────────'; container.appendChild(hr); i++; continue; }

    // heading
    const hm = /^(#{1,6})\s+(.*)$/.exec(raw);
    if (hm) {
      const level = hm[1].length; const text = hm[2];
      const h = document.createElement('div'); h.className = 'md-heading md-h' + level; h.appendChild(replaceInlineRich(text, options)); container.appendChild(h); i++; continue;
    }

    // blockquote
    const bqm = /^\s*>\s?(.*)$/.exec(raw);
    if (bqm) { const p = document.createElement('div'); p.className='md-blockquote'; p.appendChild(replaceInlineRich(bqm[1], options)); container.appendChild(p); i++; continue; }

    // unordered list
    const ulm = /^\s*[-*+]\s+(.*)$/.exec(raw);
    if (ulm) {
      const ul = document.createElement('ul');
      let j = i; while (j < lines.length) {
        const lm = /^\s*[-*+]\s+(.*)$/.exec(lines[j]); if (!lm) break; const li = document.createElement('li'); li.appendChild(replaceInlineRich(lm[1], options)); ul.appendChild(li); j++; }
      container.appendChild(ul); i = j; continue;
    }

    // ordered list
    const olm = /^\s*(\d+)\.\s+(.*)$/.exec(raw);
    if (olm) {
      const ol = document.createElement('ol'); let j = i; while (j < lines.length) { const lm = /^\s*(\d+)\.\s+(.*)$/.exec(lines[j]); if (!lm) break; const li = document.createElement('li'); li.appendChild(replaceInlineRich(lm[2], options)); ol.appendChild(li); j++; } container.appendChild(ol); i = j; continue;
    }

    if (raw.trim() === '') { container.appendChild(document.createElement('br')); i++; continue; }
    const p = document.createElement('p'); p.appendChild(replaceInlineRich(raw, options)); container.appendChild(p); i++;
  }

  return container;
}

class RichTextElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    // default emoji map and theme variables
    this.emojiMap = DEFAULT_EMOJI_MAP;
    this.primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--dp-primary') || '#0b5cff';
  }

  static get observedAttributes() { return ['text','mode','chat-components']; }

  attributeChangedCallback() { this.render(); }
  connectedCallback() { this.render(); }

  preprocessForChatComponents(raw) {
    let out = raw;
    // remove bubble color tags
    out = out.replace(/<(red|cyan|green|blue|yellow)message>([\s\S]*?)<\/\1message>/gi, (_, __, inner) => inner);

    const fullTag = (tag) => new RegExp('^\\s*<' + tag + '>([\\s\\S]*?)<\\/' + tag + '>\\s*$', 'i');

    // stickers
    if (fullTag('sticker').test(out)) return this.getString('sticker');
    out = out.replace(/<sticker>([\s\S]*?)<\/sticker>/gi, '🪧:');

    // images
    if (fullTag('image').test(out)) return this.getString('photo');
    out = out.replace(/<image>([\s\S]*?)<\/image>/gi, '📷:');

    // files
    if (fullTag('file').test(out)) {
      const m = fullTag('file').exec(out);
      const url = (m && m[1]) || ''; const filename = url.split('/').pop() || '';
      return (filename ? (this.getString('file') + ', ' + filename) : this.getString('file'));
    }
    out = out.replace(/<file>([\s\S]*?)<\/file>/gi, '📎:');

    return out;
  }

  getString(kind) {
    const s = {
      photo: this.getAttribute('photo-str') || 'Photo',
      sticker: this.getAttribute('sticker-str') || 'Sticker',
      file: this.getAttribute('file-str') || 'File'
    };
    return s[kind];
  }

  render() {
    // prefer explicit "text" attribute; otherwise use textContent so we operate on raw text (not innerHTML)
    const rawText = this.getAttribute('text');
    const contentSource = (typeof rawText === 'string') ? rawText : (this.textContent ?? '');

    const chatComponents = this.hasAttribute('chat-components');
    const modeAttr = (this.getAttribute('mode') || 'rich').toLowerCase();
    const mode = modeAttr === 'markdown' ? 'markdown' : 'rich';
    const text = chatComponents ? this.preprocessForChatComponents(contentSource) : contentSource;

    // build contents
    const wrapper = document.createElement('div'); wrapper.className = 'dp-richtext-root';
    const options = {emojiMap: this.emojiMap, primaryColor: this.primaryColor, component: this};

    if (mode === 'markdown') {
      wrapper.appendChild(parseMarkdownToFragment(text, options));
    } else {
      wrapper.appendChild(replaceInlineRich(text, options));
    }

    // attach styles and content
    const style = document.createElement('style');
    style.textContent = `
      :host { --dp-primary: ${this.primaryColor}; display:block; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color: var(--dp-on-surface, #ffffff); }
      .dp-richtext-root a { color: var(--accent, #6b21a8); text-decoration: underline; cursor: pointer; }
      .dp-richtext-root code { background:#f3f3f3; padding:0 4px; border-radius:3px; }
      .md-heading { font-weight:700; margin:6px 0; }
      .md-h1 { font-size:22px; }
      .md-h2 { font-size:18px; }
      .md-h3 { font-size:16px; }
      .md-blockquote { font-style:italic; color: #555; }
      .hr-line { color: #888; opacity:0.6; }
      ul, ol { margin:6px 0 6px 20px; }
      p { margin:6px 0; }
      .emoji-inline { display:inline-block; width:1em; height:1em; vertical-align:middle; }
    `;

    const sr = this.shadowRoot;
    sr.innerHTML = '';
    sr.appendChild(style);
    sr.appendChild(wrapper);
  }
}

const TAGS = [
  'rich-text',
  'rich-markdown',
  'rich-markdown-text',
  'dp-text',
  'dp-richtext',
  'text-element'
];
for (const t of TAGS) {
  if (!customElements.get(t)) customElements.define(t, RichTextElement);
}

export function createRichTextNode({text='', mode='rich', chatComponents=false}) {
  const el = document.createElement('div');
  el.innerHTML = `<${mode === 'markdown' ? 'rich-markdown' : 'rich-text'}${chatComponents ? ' chat-components' : ''}>${escapeHtml(text)}</${mode === 'markdown' ? 'rich-markdown' : 'rich-text'}>`;
  return el.firstElementChild;
}

window.DPRichText = { create: createRichTextNode };
