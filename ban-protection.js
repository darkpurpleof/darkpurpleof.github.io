import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCAPZF2zwU6z5rhikrIVZ4TVxf1tS5aTbA",
    authDomain: "darkpurpleof-s-website.firebaseapp.com",
    projectId: "darkpurpleof-s-website",
    storageBucket: "darkpurpleof-s-website.firebasestorage.app",
    messagingSenderId: "520651082420",
    appId: "1:520651082420:web:bb05c0c3fd64517952e5e1",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Function to check if the user is banned by email or IP
async function checkIfBanned(user) {
    let bannedByEmail = false;
    let bannedByIP = false;

    try {
        if (user) {
            const email = user.email;

            // Check if the user is banned by email (document name)
            const emailDoc = await getDoc(doc(db, "banned_users", email));
            if (emailDoc.exists()) {
                console.warn(`User ${email} is banned.`);
                bannedByEmail = true;
            }
        }

        // Fetch user's IP address
        const response = await fetch('https://ipinfo.io/json');
        const data = await response.json();
        const ip = data.ip;

        // Check if the user's IP is banned (document name)
        const ipDoc = await getDoc(doc(db, "banned_ips", ip));
        if (ipDoc.exists()) {
            console.warn(`IP ${ip} is banned.`);
            bannedByIP = true;
        }

        // If banned by either email or IP, redirect to /not-approved
        if (bannedByEmail || bannedByIP) {
            console.warn("Banned detected. Redirecting to /not-approved.");
            window.location.href = "https://darkpurpleof.github.io/not-approved";
        } else if (!user) {
            // Only redirect to login if the user is NOT banned and NOT logged in
            window.location.href = "https://darkpurpleof.github.io/login.html";
        }

    } catch (error) {
        console.error("Error checking ban status:", error);
    }
}

// Wait for authentication state to change before checking bans
onAuthStateChanged(auth, (user) => {
    checkIfBanned(user);
});
