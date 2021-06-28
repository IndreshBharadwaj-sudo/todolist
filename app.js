const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const Todo = require('./models/todo');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
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
app.use(session({ secret: 'thisisasecret', resave: false.valueOf, saveUninitialized: false }));
app.use(cookieParser('thisismysecret'));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', (req, res) => {
    console.log(req.session);
    res.render('todo/home')
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

app.post('/todo/:id', async(req, res) => {
    const id = req.params.id;
    console.log(id);
    if (id) {
        const t = await Todo.findByIdAndDelete(id);
    }
    res.redirect('/todo');
})
app.get('/register', async(req, res) => {
    res.render('user/register');
})

app.post('/register', async(req, res) => {
    res.send(req.body);
})

app.get('/login', (req, res) => {
    const { username = 'Rahul' } = req.query;
    req.session.username = username;
    res.send('user/login');
})

const port = 3000;
app.listen(port, () => {
    console.log(`Listening at port ${port}`);
})