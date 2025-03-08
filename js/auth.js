import { auth, db } from "./firebase-config.js";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
    doc, 
    setDoc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    // Signup Function
    const signupBtn = document.getElementById("signupBtn");
    if (signupBtn) {
        signupBtn.addEventListener("click", async () => {
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const role = document.getElementById("role").value;

            if (!email || !password) {
                alert("Please fill in all fields.");
                return;
            }

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const userId = userCredential.user.uid;

                // Store user details in Firestore
                await setDoc(doc(db, "users", userId), { email, role });

                alert("Signup Successful! Redirecting to Login...");
                window.location.href = "login.html";
            } catch (error) {
                alert("Error: " + error.message);
            }
        });
    }

    // Login Function
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
        loginBtn.addEventListener("click", async () => {
            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;

            if (!email || !password) {
                alert("Please enter both email and password.");
                return;
            }

            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const userId = userCredential.user.uid;

                
                const userDoc = await getDoc(doc(db, "users", userId));
                if (userDoc.exists()) {
                    const role = userDoc.data().role;
                    alert("Login Successful!");

                    
                    if (role === "admin") {
                        window.location.href = "../admin/first_page.html";
                    } else {
                        window.location.href = "../user/first_page.html";
                    }
                } else {
                    alert("User role not found. Please try again.");
                }
            } catch (error) {
                alert("Error: " + error.message);
            }
        });
    }

    // Logout Function
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try {
                await signOut(auth);
                alert("Logged out successfully!");
                window.location.href = "../auth/login.html";
            } catch (error) {
                alert("Error: " + error.message);
            }
        });
    }
});
