const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 8000;

const List = require("./models/List");
require("dotenv").config();

app.use(express.static("public"));
app.use(express.json());

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("DB connected"))
    .catch((err) => console.log(err));

app.get("/api/v1/lists", async (req, res) => {
    try {
        const allList = await List.find({}).sort({ID:1});
        res.status(200).json(allList);
    } catch (err) {
        res.status(500).json({message: "Server Error"});
    }
});

app.post("/api/v1/lists/updateStatus", async(req, res)=>{
    try{
        const {ID, Affiliation, Name} = req.body;
        if (!ID || !Affiliation || !Name){
            return res.status(400).json({message: "Missing required fields"});
        }
        const updatedList = await List.findOneAndUpdate(
            {ID: ID, Affiliation: Affiliation, Name: Name},
            {Status: "〇"},
            {new: true}
        );
        if(!updatedList){
            return res.status(404).json({message: "List entry not found"});
        }
        res.status(200).json(updatedList);
    } catch (err){
        console.error(err);
        res.status(500).json({message: "Server error"});
    }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

app.post("/api/v1/lists/resetStatus", async (req, res) => {
    try {
        // すべてのドキュメントのstatusを"-"に更新
        const result = await List.updateMany({}, { $set: { Status: "-" } });

        res.status(200).json({
            message: "All statuses reset to '-'",
            modifiedCount: result.modifiedCount, // 更新されたドキュメントの数
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to reset statuses" });
    }
});