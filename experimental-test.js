// modern-firebase-auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCAPZF2zwU6z5rhikrIVZ4TVxf1tS5aTbA",
  authDomain: "darkpurpleof-s-website.firebaseapp.com",
  projectId: "darkpurpleof-s-website",
  storageBucket: "darkpurpleof-s-website.firebasestorage.app",
  messagingSenderId: "520651082420",
  appId: "1:520651082420:web:bb05c0c3fd64517952e5e1",
};

// Initialize Firebase with a custom name "check perms"
const app = initializeApp(firebaseConfig, "check perms");
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/login";
  } else {
    const email = user.email || "";
    if (!email.endsWith("@darkpurpleof.github.io")) {
      document.body.innerHTML = `
        <div style="text-align:center;font-family:sans-serif;margin-top:10%">
          <h1 style="font-size:3em;color:#d00;">403 Forbidden</h1>
          <p>This page is restricted to internal experimental users only.</p>
          <p><strong>${email}</strong> is not authorized to access this content.</p>
        </div>
      `;
      document.title = "403 Forbidden";
    } else {
      console.log("OK");
    }
  }
});
