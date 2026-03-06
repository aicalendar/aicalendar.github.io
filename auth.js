import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup,
    GoogleAuthProvider, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA7I4hOdQkGlOCoYipZmiIXpbW7r2TwEZA",
  authDomain: "ai-calendar-332ea.firebaseapp.com",
  projectId: "ai-calendar-332ea",
  storageBucket: "ai-calendar-332ea.firebasestorage.app",
  messagingSenderId: "287212034262",
  appId: "1:287212034262:web:6f6ad3d7d351c1939ed177",
  measurementId: "G-GJP502Y7C2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

let isRegisterMode = false;

// Auth state
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in — hide modal, show content
        document.getElementById('authModal').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';

        const userInfo = document.getElementById('userInfo');
        const userProfilePic = document.getElementById('userProfilePic'); // Find the profile picture

        if (userInfo) {
            userInfo.innerText = `${user.displayName || user.email}`;
        }

        // If there is picture show it.
        if (userProfilePic && user.photoURL) {
            userProfilePic.src = user.photoURL;
            userProfilePic.style.display = 'block';
        }

    } else {
        // Not signed in — show modal, hide content
        document.getElementById('authModal').style.display = 'flex';
        document.getElementById('mainContent').style.display = 'none';
        
        // Hide the picture if sign out
        const userProfilePic = document.getElementById('userProfilePic');
        if (userProfilePic) userProfilePic.style.display = 'none';
    }
});

// Google Sign-In
document.getElementById('googleSignIn').addEventListener('click', () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("Successfull Sign-in!", result.user);
        })
        .catch((err) => {
            showError(err.message);
        });
});

// Email Sign-In or Register
document.getElementById('emailSignIn').addEventListener('click', () => {
    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value;

    if (!email || !password) return showError("Please fill in all fields.");

    if (isRegisterMode) {
        createUserWithEmailAndPassword(auth, email, password)
            .catch((err) => showError(err.message));
    } else {
        signInWithEmailAndPassword(auth, email, password)
            .catch((err) => showError(err.message));
    }
});

// Switch between Login / Register
document.getElementById('switchToRegister').addEventListener('click', () => {
    isRegisterMode = !isRegisterMode;
    document.getElementById('emailSignIn').innerText = isRegisterMode ? 'Register' : 'Continue';
    document.getElementById('switchToRegister').innerText = isRegisterMode ? 'Login instead' : 'Register';
    document.querySelector('.auth-switch').firstChild.textContent = isRegisterMode
        ? 'Already have an account? '
        : "Don't have an account? ";
    showError('');
});

// Sign Out
document.getElementById('signOutBtn')?.addEventListener('click', () => signOut(auth));

function showError(msg) {
    document.getElementById('authError').innerText = msg;
}