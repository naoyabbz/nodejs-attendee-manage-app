
const tableDOM = document.querySelector(".table-section");
const qrReaderDiv = document.getElementById("qr-reader");
const resultDiv = document.getElementById("result");

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
                </tr>
            `;
        })
        .join("");
        tableDOM.innerHTML = rows;
    } catch (err) {
        console.log("Error fetching lists:", err);
    }
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
        resultDiv.textContent = `QR Code Result: ${decodedText}`;

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
            alert("No matching entry found for the scanned QR code.");
        }

        qrReaderDiv.style.display = "none"; // Hide QR reader
        html5QrcodeScanner.clear(); // Stop scanning
    };

    const qrCodeErrorCallback = (errorMessage) => {
        console.error(`QR Code Error: ${errorMessage}`);
    };

    const html5QrcodeScanner = new Html5Qrcode("qr-reader");
    html5QrcodeScanner.start(
        { facingMode: "environment" }, // Use back camera
        { fps: 10, qrbox: 250 }, // Optional settings
        qrCodeSuccessCallback,
        qrCodeErrorCallback
    ).catch((err) => {
        console.error(`Unable to start QR code scanner: ${err}`);
    });
};

// Event listener for QR scanner
startButton.addEventListener("click", () => {
    qrReaderDiv.style.display = "block";
    startQrScanner();
});

// Initial table fetch
getAllLists();