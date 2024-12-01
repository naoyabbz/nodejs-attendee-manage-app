const mongoose = require("mongoose");

const ListSchema = new mongoose.Schema({
    ID: {
        type: Number,
        required: true,
    },
    Affiliation: {
        type: String,
        required: true,
    },
    Name: {
        type: String,
        required: true,
    },
    Status: {
        type: String,
        required: true,
    },
});


module.exports = mongoose.model("List", ListSchema);