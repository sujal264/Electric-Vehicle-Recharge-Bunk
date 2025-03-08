import { db } from "../js/firebase-config.js";
import { collection, addDoc, getDocs, deleteDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// 📌 Load EV Bunks into Table
async function loadBunks() {
    const bunkList = document.getElementById("bunkList");
    if (!bunkList) return;

    bunkList.innerHTML = "";

    try {
        const snapshot = await getDocs(collection(db, "ev_bunks"));
        if (snapshot.empty) {
            bunkList.innerHTML = "<tr><td colspan='5'>No EV Bunks found.</td></tr>";
            return;
        }

        snapshot.forEach(docSnapshot => {
            const data = docSnapshot.data();
            bunkList.innerHTML += `
                <tr>
                    <td>${data.name}</td>
                    <td>${data.address}</td>
                    <td>${data.contact}</td>
                    <td><a href="${data.map}" target="_blank">View Map</a></td>
                    <td><button onclick="deleteBunk('${docSnapshot.id}')">Delete</button></td>
                </tr>
            `;
        });

        loadBunksDropdown();
    } catch (error) {
        console.error("Error loading EV Bunks:", error);
    }
}

// 📌 Add EV Bunk
document.addEventListener("DOMContentLoaded", () => {
    const addBunkBtn = document.getElementById("addBunkBtn");
    if (addBunkBtn) {
        addBunkBtn.addEventListener("click", async () => {
            const name = document.getElementById("bunkName").value.trim();
            const address = document.getElementById("bunkAddress").value.trim();
            const contact = document.getElementById("bunkContact").value.trim();
            const map = document.getElementById("bunkMap").value.trim();
            const statusMessage = document.getElementById("statusMessage");

            if (!name || !address || !contact || !map) {
                statusMessage.innerText = "Please fill in all fields.";
                statusMessage.style.color = "red";
                return;
            }

            try {
                await addDoc(collection(db, "ev_bunks"), { name, address, contact, map });
                statusMessage.innerText = "Bunk created successfully!";
                statusMessage.style.color = "green";
                loadBunks();
            } catch (error) {
                statusMessage.innerText = "Error: " + error.message;
                statusMessage.style.color = "red";
            }
        });
    }
});

// 📌 Delete EV Bunk
window.deleteBunk = async (bunkId) => {
    try {
        await deleteDoc(doc(db, "ev_bunks", bunkId));
        alert("Bunk deleted successfully!");
        loadBunks();
    } catch (error) {
        console.error("Error deleting bunk:", error);
    }
};
// 📌 Load Bunks in Dropdown for Adding Slots
async function loadBunksDropdown() {
    const bunkSelect = document.getElementById("bunkSelect");
    if (!bunkSelect) return;

    bunkSelect.innerHTML = "<option value=''>Select EV Bunk</option>";

    try {
        const snapshot = await getDocs(collection(db, "ev_bunks"));
        snapshot.forEach(docSnapshot => {
            const data = docSnapshot.data();
            bunkSelect.innerHTML += `<option value="${docSnapshot.id}">${data.name}</option>`;
        });
    } catch (error) {
        console.error("Error loading bunks:", error);
    }
}

// 📌 Add Slot
document.addEventListener("DOMContentLoaded", () => {
    const setSlotBtn = document.getElementById("setSlotBtn");
    if (setSlotBtn) {
        setSlotBtn.addEventListener("click", async () => {
            const bunkId = document.getElementById("bunkSelect").value;
            const date = document.getElementById("slotDate").value;
            const time = document.getElementById("slotTime").value;
            const statusMessage = document.getElementById("statusMessage");

            if (!bunkId || !date || !time) {
                statusMessage.innerText = "Please select an EV Bunk, Date, and Time.";
                statusMessage.style.color = "red";
                return;
            }

            try {
                const bunkRef = doc(db, "ev_bunks", bunkId);
                const bunkDoc = await getDoc(bunkRef);
                if (!bunkDoc.exists()) {
                    statusMessage.innerText = "Bunk not found!";
                    statusMessage.style.color = "red";
                    return;
                }

                const bunkName = bunkDoc.data().name;

                await addDoc(collection(db, "bunk_slots"), { bunkId, bunkName, date, time });

                statusMessage.innerText = "Slot added successfully!";
                statusMessage.style.color = "green";

                loadSlots();
            } catch (error) {
                statusMessage.innerText = "Error: " + error.message;
                statusMessage.style.color = "red";
            }
        });
    }
});
// 📌 Load Booked Slots for Admin
async function loadBookedSlots() {
    const bookedSlotsList = document.getElementById("bookedSlotsList");
    bookedSlotsList.innerHTML = "";

    try {
        const snapshot = await getDocs(collection(db, "booked_slots"));
        if (snapshot.empty) {
            bookedSlotsList.innerHTML = "<tr><td colspan='5'>No bookings found.</td></tr>";
            return;
        }

        snapshot.forEach(async (docSnapshot) => {
            const data = docSnapshot.data();
            const bunkName = await getBunkName(data.bunkId);

            bookedSlotsList.innerHTML += `
                <tr>
                    <td>${data.userEmail}</td>
                    <td>${bunkName}</td>
                    <td>${data.date}</td>
                    <td>${data.time}</td>
                    <td><button onclick="cancelBooking('${docSnapshot.id}', '${data.bunkId}', '${data.date}', '${data.time}')">Cancel</button></td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error loading booked slots:", error);
    }
}

window.onload = () => {
    loadBunks();
    loadBunksDropdown();
    loadSlots();
    loadBookedSlots();
};
