const tableDOM = document.querySelector(".table-section");
const qrReaderDiv = document.getElementById("qr-reader");
const resultDiv = document.getElementById("result");
const startButton = document.getElementById("startButton");
const qrModal = document.getElementById("qr-modal");
const closeModal = document.getElementById("close-modal");
const qrReaderModalDiv = document.getElementById("qr-reader-modal");
const resetButton = document.getElementById("resetButton");


const getAllLists = async ()=>{
    try{
        let response = await axios.get("/api/v1/lists");
        console.log(response);
        let {data} = response;
        console.log(data);

        const rows = data.map((list) => {
            const {ID, Affiliation, Name, Status} = list;
            console.log(ID, Affiliation, Name, Status);
            return `
                <tr class="single-row">
                    <td>${ID}</td>
                    <td>${Affiliation}</td>
                    <td>${Name}</td>
                    <td>${Status}</td>
                </tr>`
            ;
        })
        .join("");
        tableDOM.innerHTML = rows;
    } catch (err) {
        console.log("Error fetching lists:", err);
    }
};

const showNotification = (message, isError = false) => {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.className = `notification ${isError ? "error" : ""}`;
    notification.style.display = "block";

    setTimeout(() => {
        notification.style.display = "none";
    }, 3000); // 3秒後に自動的に非表示
};

const updateStatus = async (id, affiliation, name) => {
    try {
        const res = await axios.post("/api/v1/lists/updateStatus", { 
            ID: id,
            Affiliation: affiliation,
            Name: name
        });
        console.log("Updated Entry:", res.data);
        alert("Status updated successfully!");
        await getAllLists();
    } catch (err) {
        console.error(err);
        alert("Failed to update status. Please try again.");
    }
};

const startQrScanner = () => {
    const qrCodeSuccessCallback = async (decodedText) => {
        resultDiv.textContent = `${decodedText}`;

        const [decodedID, decodedAffiliation, decodedName] = decodedText.split("_");

        // Check if the scanned QR code matches any list entry
        const tableRows = document.querySelectorAll(".single-row");
        let found = false;

        tableRows.forEach((row) => {
            const cells = row.querySelectorAll("td");
            const id = cells[0].textContent;
            const affiliation = cells[1].textContent;
            const name = cells[2].textContent;
            if (decodedID === id && decodedAffiliation === affiliation && decodedName === name) {
                cells[3].textContent = "〇"; // Update UI
                updateStatus(id, affiliation, name); // Update backend
                found = true;
            }
        });

        if (!found) {
            showNotification("No matching entry found for the scanned QR code.", true);
        }

        try {
            await html5QrcodeScanner.stop(); // スキャンを停止
            html5QrcodeScanner.clear(); // スキャナをクリーンアップ
        } catch (err) {
            console.error("Error stopping the scanner:", err);
        }

        qrModal.style.display = "none"; // Hide QR modal
    };

    const qrCodeErrorCallback = (errorMessage) => {
        console.error(`QR Code Error: ${errorMessage}`);
    };

    const html5QrcodeScanner = new Html5Qrcode("qr-reader-modal");
    html5QrcodeScanner.start(
        { facingMode: "environment" }, // Use back camera
        { fps: 10, qrbox: 250 }, // Optional settings
        qrCodeSuccessCallback,
        qrCodeErrorCallback
    ).catch((err) => {
        console.error(`Unable to start QR code scanner: ${err}`);
    });
};

// Event listener for the start button to show the modal and start QR scanning
startButton.addEventListener("click", () => {
    qrModal.style.display = "block"; // Show the modal
    startQrScanner(); // Start QR scanner
});

// Close modal when the close button is clicked
closeModal.addEventListener("click", () => {
    qrModal.style.display = "none"; // Close the modal
});

resetButton.addEventListener("click", async () => {
    if (confirm("Are you sure you want to reset all statuses to '-'?")) {
        try {
            const response = await axios.post("/api/v1/lists/resetStatus");
            alert(response.data.message);
            getAllLists(); // 更新後にリストを再取得
        } catch (err) {
            console.error(err);
            alert("Failed to reset statuses. Please try again.");
        }
    }
});

// Initial table fetch
getAllLists()