const mongoose = require('mongoose');
const Todo = require('../models/todo');
mongoose.connect('mongodb://localhost:27017/todo', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Db connected");
})

Todo.deleteMany({});
Todo.insertMany([{ text: "Coding" }, { text: "sleeping" }, { text: "Cooking" }], { text: "Playing" })
    .then(function() {
        console.log("Data inserted");
    })
    .catch((e) => {
        console.log(e);
    })