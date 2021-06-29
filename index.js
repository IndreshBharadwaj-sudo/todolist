const express = require("express");
const app = express();
const TodoTask = require("./models/task");
const mongoose = require("mongoose");

// Urlencoded will allow us to extract the data from the form by adding her to the body property of the request.
app.use(express.urlencoded({ extended: true }));
// for access public folder below cmd
app.use("/static", express.static("public"));
// to set e ejs as template engine
app.set("view engine", "ejs");

// to fetch all todos from the db
app.get("/", async (req, res) => {
    await TodoTask.find({}, (err, tasks) => {
        if (err) return res.status(500).send(err);
        res.render("todo.ejs", { todoTasks: tasks });
    });
});

//create a new todo
app.post("/new", async (req, res) => {
    const todoTask = new TodoTask({
        content: req.body.content,
    });
    try {
        await todoTask.save();
        res.redirect("/");
    } catch (err) {
        return res.status(500).send(err);
        res.redirect("/");
    }
});

//update the existing todo
app.post("/edit/:id", async (req, res) => {
    const id = req.params.id;
    await TodoTask.findByIdAndUpdate(
        id,
        { content: req.body.content },
        (err) => {
            if (err) return res.status(500).send(err);
            res.redirect("/");
        }
    );
});

//remove a todo if exists
app.get("/remove/:id", async (req, res) => {
    const id = req.params.id;
    await TodoTask.findByIdAndRemove(id, (err) => {
        if (err) return res.status(500).send(err);
        res.redirect("/");
    });
});

//remove all todos
app.post("/removeall", async (req, res) => {
    await TodoTask.deleteMany({});
    res.redirect("/");
});

//connection to db
mongoose.set("useFindAndModify", false);
mongoose.set("useUnifiedTopology", true);
mongoose.connect(
    "mongodb://localhost:27017/todo",
    { useNewUrlParser: true },
    () => {
        console.log("Connected to db!");
        const port = 3000;
        app.listen(port, () => console.log(`Server Up and running on ${port}`));
    }
);
