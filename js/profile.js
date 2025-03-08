import { auth, db } from "../js/firebase-config.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";


onAuthStateChanged(auth, async (user) => {
    if (!user) {
        alert("You must be logged in to view your profile.");
        window.location.href = "../auth/login.html";
        return;
    }

    try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const data = userDoc.data();
            const name = data.name || "Not Set";

        
            if (document.getElementById("adminName")) {
                document.getElementById("adminName").innerText = name;
                document.getElementById("adminEmail").innerText = data.email;
                document.getElementById("adminRole").innerText = data.role;
            } else {
                document.getElementById("userName").innerText = name;
                document.getElementById("userEmail").innerText = data.email;
                document.getElementById("userRole").innerText = data.role;
            }
        } else {
            alert("User profile not found.");
        }
    } catch (error) {
        console.error("Error loading profile:", error);
    }
});

// Update Profile
document.addEventListener("DOMContentLoaded", () => {
    const updateProfileBtn = document.getElementById("updateProfileBtn");
    if (updateProfileBtn) {
        updateProfileBtn.addEventListener("click", async () => {
            const user = auth.currentUser;
            const newName = document.getElementById("updateName").value.trim();
            const statusMessage = document.getElementById("statusMessage");

            if (!newName) {
                statusMessage.innerText = "Please enter a new name.";
                statusMessage.style.color = "red";
                return;
            }

            try {
                await updateDoc(doc(db, "users", user.uid), { name: newName });

                statusMessage.innerText = "Profile updated successfully!";
                statusMessage.style.color = "green";

              
                window.location.reload();
            } catch (error) {
                statusMessage.innerText = "Error: " + error.message;
                statusMessage.style.color = "red";
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
                window.location.href = "../index.html";
            } catch (error) {
                alert("Error: " + error.message);
            }
        });
    }
});
