import { auth, db } from "../js/firebase-config.js";
import { collection, getDocs, query, where, addDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
// Load EV Bunks into Dropdown
async function loadBunksDropdown() {
    const bunkSelect = document.getElementById("bunkSelect");
    bunkSelect.innerHTML = "<option value=''>Select EV Bunk</option>";

    try {
        const snapshot = await getDocs(collection(db, "ev_bunks"));
        snapshot.forEach(doc => {
            const data = doc.data();
            bunkSelect.innerHTML += `<option value="${doc.id}">${data.name}</option>`;
        });
    } catch (error) {
        console.error("Error loading bunks:", error);
    }
}
// Load EV Bunks into Table
async function loadBunks() {
    const bunkList = document.getElementById("bunkList");
    bunkList.innerHTML = "";

    try {
        const snapshot = await getDocs(collection(db, "ev_bunks"));
        
        if (snapshot.empty) {
            bunkList.innerHTML = "<tr><td colspan='4'>No EV Bunks found.</td></tr>";
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            bunkList.innerHTML += `
                <tr>
                    <td>${data.name}</td>
                    <td>${data.address}</td>
                    <td>${data.contact}</td>
                    <td><a href="${data.map}" target="_blank">View Map</a></td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error loading EV Bunks:", error);
        bunkList.innerHTML = `<tr><td colspan='4'>Error loading EV Bunks.</td></tr>`;
    }
}

// Load Bunks on Page Load
document.addEventListener("DOMContentLoaded", loadBunks);

// Load Slots for Selected Bunk
document.addEventListener("DOMContentLoaded", () => {
    loadBunksDropdown();

    const viewSlotsBtn = document.getElementById("viewSlotsBtn");
    if (viewSlotsBtn) {
        viewSlotsBtn.addEventListener("click", async () => {
            const bunkId = document.getElementById("bunkSelect").value;
            const slotList = document.getElementById("slotList");
            slotList.innerHTML = "";

            if (!bunkId) {
                alert("Please select an EV Bunk.");
                return;
            }

            try {
                const q = query(collection(db, "bunk_slots"), where("bunkId", "==", bunkId));
                const snapshot = await getDocs(q);

                if (snapshot.empty) {
                    slotList.innerHTML = "<tr><td colspan='3'>No slots available.</td></tr>";
                    return;
                }

                snapshot.forEach(doc => {
                    const data = doc.data();
                    slotList.innerHTML += `
                        <tr>
                            <td>${data.date}</td>
                            <td>${data.time}</td>
                            <td><button onclick="bookSlot('${doc.id}', '${data.date}', '${data.time}', '${bunkId}')">Book</button></td>
                        </tr>
                    `;
                });
            } catch (error) {
                console.error("Error loading slots:", error);
            }
        });
    }
});

// Book Slot Function
window.bookSlot = async (slotId, date, time, bunkId) => {
    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to book a slot.");
        return;
    }

    try {
        // Save Booking in Firestore
        const bookingRef = await addDoc(collection(db, "booked_slots"), {
            userId: user.uid,
            userEmail: user.email,
            bunkId,
            date,
            time,
            status: "Booked"
        });

        window.location.href = `booking-receipt.html?bookingId=${bookingRef.id}`;
    } catch (error) {
        console.error("Error booking slot:", error);
    }
};
// Load Booking Details for Receipt Page
document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get("bookingId");

    if (bookingId) {
        document.getElementById("bookingId").innerText = bookingId;

        try {
            
            const bookingRef = doc(db, "booked_slots", bookingId);
            const bookingDoc = await getDoc(bookingRef);

            if (bookingDoc.exists()) {
                const data = bookingDoc.data();
                document.getElementById("bookingDate").innerText = data.date || "N/A";
                document.getElementById("bookingTime").innerText = data.time || "N/A";
                document.getElementById("userEmail").innerText = data.userEmail || "N/A";

                
                if (data.bunkId) {
                    const bunkRef = doc(db, "ev_bunks", data.bunkId);
                    const bunkDoc = await getDoc(bunkRef);
                    if (bunkDoc.exists()) {
                        document.getElementById("bunkName").innerText = bunkDoc.data().name || "N/A";
                    } else {
                        document.getElementById("bunkName").innerText = "Bunk Not Found";
                    }
                } else {
                    document.getElementById("bunkName").innerText = "Bunk ID Missing";
                }
            } else {
                document.body.innerHTML = "<h2>Booking Not Found</h2>";
            }
        } catch (error) {
            console.error("Error loading booking:", error);
        }
    }
});
