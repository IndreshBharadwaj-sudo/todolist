const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const Todo = require('./models/todo');
const methodOverride = require('method-override');
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

const app = express();
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.get('/', (req, res) => {
    res.send('Hello World!')
})


app.get('/todo', async(req, res) => {
    const list = await Todo.find({});
    res.render('todo/index', { list });
})
app.post('/todo', async(req, res) => {
    const { text } = req.body;

    if (text.trim() != 0) {
        const todo = new Todo({ text });
        await todo.save();
    }
    res.redirect('todo');
})

app.delete('/todo', async(req, res) => {
    await Todo.deleteMany({});
    res.redirect('/todo');
})

const port = 3000;
app.listen(port, () => {
    console.log(`Listening at port ${port}`);
})