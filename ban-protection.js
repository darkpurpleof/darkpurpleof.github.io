import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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
function checkIfBanned() {
    const user = auth.currentUser;

    if (user) {
        // Logged-in user
        const email = user.email;

        // Fetch user's IP address using ipinfo.io
        fetch('https://ipinfo.io/json')
            .then(response => response.json())
            .then(data => {
                const ip = data.ip;

                // Check if the user is banned by email
                getDoc(doc(db, "bannedUsers", email)).then((docSnapshot) => {
                    if (docSnapshot.exists()) {
                        // User banned by email, redirect to "not-approved" page
                        window.location.href = "https://darkpurpleof.github.io/not-approved";
                    } else {
                        // Check if the user's IP is banned
                        getDoc(doc(db, "bannedIPs", ip)).then((docSnapshot) => {
                            if (docSnapshot.exists()) {
                                // User banned by IP, redirect to "not-approved" page
                                window.location.href = "https://darkpurpleof.github.io/not-approved";
                            }
                        }).catch((error) => {
                            console.error("Error checking IP ban status:", error);
                        });
                    }
                }).catch((error) => {
                    console.error("Error checking ban status:", error);
                });
            }).catch((error) => {
            console.error("Error fetching IP:", error);
        });
    } else {
        // If the user is not logged in, redirect to the login page
        window.location.href = "https://darkpurpleof.github.io/login.html";
    }
}

// Run the check as soon as the script loads
checkIfBanned();
