/*
authorUGCList.js
Reusable vanilla JS component that renders a card with two tabs (Store / Development)
Each UGC is shown as a smaller card inside. Clicking an item opens:
  /ugc/viewugc?id=(id)&author=(authoremail)&type=(type)

Usage:
  1) Include this file as a module in your page: <script type="module" src="authorUGCList.js"></script>
  2) Call createAuthorUGCList(containerElement, options)

Options:
  - authorEmail (required)
  - container (required) DOM element or selector string
  - firestore (optional) Firestore instance (modular or namespaced). If not provided, you must provide a fetchItems function.
  - auth (optional) Firebase Auth instance or object with currentUser?.email
  - fetchItems (optional) function(authorEmail, collectionName, onUpdate) for custom fetch logic

This file injects its needed CSS automatically once.
*/

// Ensure this file can be imported as a module in browsers
function createAuthorUGCList(container, options = {}) {
  // Resolve container element if needed
  const root = typeof container === 'string' ? document.querySelector(container) : container;
  if (!root) throw new Error('Container element not found');

  // Options
  const authorEmail = options.authorEmail;
  if (!authorEmail) throw new Error('authorEmail is required');

  const firestore = options.firestore || null;
  const auth = options.auth || (window.firebase && (window.firebase.auth ? window.firebase.auth() : null)) || null;
  const fetchItems = options.fetchItems || null; // fallback custom fetch

  // Internal state
  let unsubscribe = null;
  let currentTab = options.initialTab === 'development' ? 'development' : 'store';

  // Inject CSS once
  if (!document.getElementById('author-ugc-list-styles')) {
    const style = document.createElement('style');
    style.id = 'author-ugc-list-styles';
    style.textContent = `
:root{
  --bg: #1f1f1f;
  --card: #1f1f1f;
  --muted: #a8a8a8;
  --accent: #6b21a881;
  --accent-strong: #6b21a868;
  --text: #eaeaea;
  --border: rgba(255,255,255,0.04);
}

.author-ugc-wrapper{
  background: var(--bg);
  color: var(--text);
  max-width: 920px;
  margin: 12px auto;
  border-radius: 12px;
  padding: 16px;
  box-sizing: border-box;
  border: 1px solid var(--border);
  box-shadow: 0 6px 18px rgba(0,0,0,0.5);
  overflow: hidden;
}

.author-ugc-header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  margin-bottom:12px;
}

.author-ugc-title{
  font-size:18px;
  font-weight:600;
}

.author-ugc-tabs{
  display:flex;
  gap:8px;
}

.author-ugc-tab{
  background: transparent;
  border: 1px solid var(--border);
  color:var(--muted);
  padding:6px 10px;
  border-radius:8px;
  cursor:pointer;
  font-size:13px;
}

.author-ugc-tab.active{
  background: linear-gradient(180deg,var(--accent), var(--accent-strong));
  color: white;
  border: none;
}

.author-ugc-list{
  display:grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap:12px;
}

.ugc-card{
  background: linear-gradient(180deg, rgba(255,255,255,0.02), transparent);
  border-radius:10px;
  padding:10px;
  display:flex;
  gap:10px;
  align-items:flex-start;
  border: 1px solid var(--border);
  cursor:pointer;
  transition: transform .12s ease, box-shadow .12s ease, opacity .12s ease;
}

.ugc-thumb{ width:56px; height:56px; border-radius:8px; object-fit:cover; background:var(--card); flex:0 0 56px; }
.ugc-body{ flex: 1 1 auto; min-width:0; }
.ugc-title{ font-size:14px; font-weight:600; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ugc-meta{ font-size:12px; color:var(--muted); margin-top:4px; }
.ugc-verified{ width:16px; height:16px; margin-left:6px; vertical-align:middle; }
.ugc-hidden-badge{ width:18px; height:18px; opacity:0.8 }

.author-ugc-empty{ color:var(--muted); padding:30px 12px; text-align:center }
.author-ugc-loading{ color:var(--muted); padding:30px 12px; text-align:center }

@media (max-width:520px){
  .author-ugc-wrapper{ padding:10px }
  .author-ugc-title{ font-size:16px }
}
    `;
    document.head.appendChild(style);
  }

  // Root markup
  root.classList.add('author-ugc-root');
  root.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'author-ugc-wrapper';

  const header = document.createElement('div');
  header.className = 'author-ugc-header';

  const title = document.createElement('div');
  title.className = 'author-ugc-title';
  title.textContent = `Items`;

  const tabs = document.createElement('div');
  tabs.className = 'author-ugc-tabs';

  const tabStore = document.createElement('button');
  tabStore.className = 'author-ugc-tab';
  tabStore.textContent = 'Store Items';
  tabStore.dataset.tab = 'store';

  const tabDev = document.createElement('button');
  tabDev.className = 'author-ugc-tab';
  tabDev.textContent = 'Development Items';
  tabDev.dataset.tab = 'development';

  tabs.appendChild(tabStore);
  tabs.appendChild(tabDev);

  header.appendChild(title);
  header.appendChild(tabs);

  const content = document.createElement('div');
  content.className = 'author-ugc-content';

  const list = document.createElement('div');
  list.className = 'author-ugc-list';

  const empty = document.createElement('div');
  empty.className = 'author-ugc-empty';
  empty.textContent = "Nothing to see here.";

  const loading = document.createElement('div');
  loading.className = 'author-ugc-loading';
  loading.textContent = 'Loading...';

  content.appendChild(loading);
  content.appendChild(list);
  content.appendChild(empty);

  wrapper.appendChild(header);
  wrapper.appendChild(content);
  root.appendChild(wrapper);

  // Helper mappings
  function collectionNameFor(tab) {
    return tab === 'development' ? 'development-items' : 'store-items';
  }

  function typeFallback(metaTypeField) {
    switch (metaTypeField) {
      case 'Sticker Pack': return 'assets/default_sticker.png';
      case 'Profile Frame': return 'assets/default_frame.png';
      case 'Package': return 'assets/default_code.png';
      case 'File': return 'assets/default_file.png';
      case 'Plugin': return 'assets/default_plugin.png';
      case 'Sample': return 'assets/default_sample.png';
      case 'Role': return 'assets/default_role.png';
      case 'Bundle': return 'assets/default_bundle.png';
      case 'Lua': return 'assets/default_code.png';
      case 'Command': return 'assets/default_command.png';
      case 'Decal': return 'assets/default_image.png';
      case 'Built-In Content': return 'assets/default_gift.png';
      case 'Asset': return 'assets/default_unknown.png';
      default: return 'assets/default_unknown.png';
    }
  }

  function clearList() {
    list.innerHTML = '';
  }

  function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
  }
  function showEmpty(show) { empty.style.display = show ? 'block' : 'none'; }

  function setActiveTab(tab) {
    currentTab = tab;
    [tabStore, tabDev].forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    // re-subscribe
    subscribeToFirestore();
  }

  tabStore.addEventListener('click', () => setActiveTab('store'));
  tabDev.addEventListener('click', () => setActiveTab('development'));

  // Create UGC card element
  function createUGCCard(item, onSale, hidden) {
    const card = document.createElement('div');
    card.className = 'ugc-card';
    if (!onSale || hidden) card.style.opacity = '0.6';

    const thumb = document.createElement('img');
    thumb.className = 'ugc-thumb';
    thumb.alt = '';
    thumb.src = item.image || typeFallback(item.metaType || '');
    thumb.onerror = () => { thumb.src = typeFallback(item.metaType || ''); };

    const body = document.createElement('div');
    body.className = 'ugc-body';

    const titleRow = document.createElement('div');
    titleRow.style.display = 'flex';
    titleRow.style.alignItems = 'center';

    const title = document.createElement('div');
    title.className = 'ugc-title';
    title.textContent = item.name || item.id || 'Unnamed';

    titleRow.appendChild(title);

    if (item.verified) {
      const ver = document.createElement('img');
      ver.className = 'ugc-verified';
      ver.alt = 'Verified';
      ver.src = '/assets/verified.png';
      titleRow.appendChild(ver);
    }

    const meta = document.createElement('div');
    meta.className = 'ugc-meta';
    if (item.metaType) meta.textContent = item.metaType;

    body.appendChild(titleRow);
    body.appendChild(meta);

    // Hidden badge for owner
    let hiddenBadge = null;
    if (hidden) {
      hiddenBadge = document.createElement('img');
      hiddenBadge.className = 'ugc-hidden-badge';
      hiddenBadge.alt = 'Hidden';
      hiddenBadge.src = '/assets/hidden.png';
    }

    card.appendChild(thumb);
    card.appendChild(body);
    if (hiddenBadge) card.appendChild(hiddenBadge);

    // Click behavior
    card.addEventListener('click', () => {
      const typeParam = currentTab === 'development' ? 1 : 0;
      const url = `/ugc/viewugc?id=${encodeURIComponent(item.id)}&author=${encodeURIComponent(authorEmail)}&type=${encodeURIComponent(typeParam)}`;
      // open in same tab
      window.location.href = url;
    });

    return card;
  }

  // Firestore subscription
  function subscribeToFirestore() {
    // cleanup old
    if (unsubscribe) {
      try { unsubscribe(); } catch(e){}
      unsubscribe = null;
    }

    clearList();
    showEmpty(false);
    showLoading(true);

    const collectionName = collectionNameFor(currentTab);

    // If custom fetchItems provided, use it
    if (typeof fetchItems === 'function') {
      fetchItems(authorEmail, collectionName, (docs) => {
        renderDocs(docs);
      });
      return;
    }

    // If firestore instance provided try to use it
    if (firestore) {
      // Support both modular and namespaced SDKs
      // Modular: firestore.collection doesn't exist; we expect options.firestore to be a modular Firestore instance
      try {
        if (typeof firestore.collection === 'function') {
          // namespaced / compat SDK
          const q = firestore.collection('ugc').doc(authorEmail).collection(collectionName);
          unsubscribe = q.onSnapshot(snapshot => {
            const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            renderDocs(docs);
          }, err => {
            console.error('Firestore error', err);
            showLoading(false);
            showEmpty(true);
          });
          return;
        } else {
          // modular SDK (v9+): we expect the caller to pass functions or the instance; try to import necessary helpers from options
          const { getFirestore, doc, collection, onSnapshot } = options.firestoreHelpers || window.__authorUGC_firestoreHelpers || {};
          if (!onSnapshot) throw new Error('No onSnapshot helper provided for modular Firestore. Pass fetchItems or firestoreHelpers in options.');

          const docRef = doc(firestore, 'ugc', authorEmail);
          const collRef = collection(docRef, collectionName);
          unsubscribe = onSnapshot(collRef, (snapshot) => {
            const docs = [];
            snapshot.forEach(d => docs.push({ id: d.id, ...(d.data ? d.data() : {}) }));
            renderDocs(docs);
          }, (err) => {
            console.error('Firestore modular error', err);
            showLoading(false);
            showEmpty(true);
          });
          return;
        }
      } catch (err) {
        console.error('Error subscribing to Firestore', err);
      }
    }

    // If we reach here, we cannot subscribe automatically
    console.warn('No firestore or fetchItems provided. The component will show empty state.');
    showLoading(false);
    showEmpty(true);
    clearList();
  }

  function renderDocs(docs) {
    showLoading(false);
    clearList();

    // Determine ownership
    const currentUserEmail = (auth && auth.currentUser && auth.currentUser.email) || (auth && auth.currentUserEmail) || (auth && auth.currentUser?.email) || null;
    const isOwner = currentUserEmail === authorEmail;

    const processed = docs.map(doc => {
      const hidden = !!doc.hidden;
      if (hidden && !isOwner) return null;
      const onSale = doc.on_sale !== false; // default true
      // map type string
      const metaTypeField = doc.type || '';
      const metaType = metaTypeField;
      return { item: { id: doc.id, name: doc.name || doc.id, image: doc.image || '', verified: !!doc.verified, metaType }, onSale, hidden };
    }).filter(Boolean);

    if (processed.length === 0) {
      showEmpty(true);
      return;
    }

    showEmpty(false);
    processed.forEach(({ item, onSale, hidden }) => {
      const card = createUGCCard(item, onSale, hidden);
      list.appendChild(card);
    });
  }

  // initial setup
  setActiveTab(currentTab);

  // return an API
  return {
    destroy() {
      if (unsubscribe) { try { unsubscribe(); } catch(e){} }
      root.innerHTML = '';
    },
    refresh() { subscribeToFirestore(); },
    setAuthor(email) { options.authorEmail = email; /* not reactive for now */ }
  };
}

// default export for convenience
