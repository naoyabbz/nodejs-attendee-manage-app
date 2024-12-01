
const tableDOM = document.querySelector(".table-section");
const inputContentDOM = document.getElementById("inputContent");
const formDOM = document.querySelector(".form-section");

let inputContentText = "";

const getAllLists = async ()=>{
    try{
        let allLists = await axios.get("/api/v1/lists");
        console.log(allLists);
        let {data} = allLists;
        console.log(data);

        allLists = data.map((list) => {
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
        tableDOM.innerHTML = allLists;
    } catch (err) {
        console.log(err);
    }
};

getAllLists();

formDOM.addEventListener("change", (e) => {
    inputContentText = e.target.value;
    console.log(inputContentText);
});

formDOM.addEventListener("submit", async (e) => {
    e.preventDefault();

    const [ID, Affiliation, Name] = inputContentText.split(",").map((item) => item.trim());

    if (ID && Affiliation && Name) {
        try {
            const res = await axios.post("/api/v1/lists/updateStatus", {
                ID: Number(ID),
                Affiliation,
                Name,
            });

            console.log("Updated Entry:", res.data);
            alert("Status updated successfully!");

            getAllLists();
        } catch (err) {
            console.error(err);
            alert("Failed to update status. Please check the input or try again.");
        }
    } else {
        alert("Please provide valid input: ID, Affiliation, Name");
    }
});