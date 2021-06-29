const express = require("express");
const app = express();
const TodoTask = require("./models/task");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const flash=require('connect-flash');
const path=require('path');
const catchAsync=require('./views/utils/catchasync');
const ExpressError = require("./views/utils/expressError");


// to set e ejs as template engine
app.set("view engine", "ejs");

app.set('views',path.join(__dirname,'views'));
// for access public folder below cmd
app.use("/static", express.static("public"));
// Urlencoded will allow us to extract the data from the form by adding her to the body property of the request.


app.use(express.urlencoded({ extended: true }));

const sessionConfig={
    secret:'thisshouldbeasecret',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true, 
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(flash());
app.use(session(sessionConfig));
app.use(cookieParser('thisismysecret'));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})

app.get('/',(req,res)=>{
    res.render('todo/home');
})

// to fetch all todos from the db
app.get("/todo", catchAsync(async (req, res) => {
    if(!req.isAuthenticated())
    {
        res.redirect('/login');
    }
    let total_todos = 0;
    await TodoTask.countDocuments({}, function (err, count) {
        if (err) {
            console.log(err);
            total_todos = 0;
        } else {
            total_todos = count;
        }
    });
    await TodoTask.find({}, (err, tasks) => {
        if (err) return res.status(500).send(err);
        res.render("todo/todo.ejs", { todoTasks: tasks, total_todos });
    });
}));

//create a new todo
app.post("/new", catchAsync(async (req, res) => {
    const content=req.body.content;
    if(content.trim()!=0)
    {
        const todoTask = new TodoTask({
            content
        });
        try {
            await todoTask.save();
            res.redirect("/todo");
        } catch (err) {
            return res.status(500).send(err);
            res.redirect("/todo");
        }
    }
    
}));

//update the existing todo
app.post("/edit/:id", catchAsync(async (req, res) => {
    const id = req.params.id;
    await TodoTask.findByIdAndUpdate(
        id,
        { content: req.body.content },
        (err) => {
            if (err) return res.status(500).send(err);
            res.redirect("/todo");
        }
    );
}));

//remove a todo if exists
app.get("/remove/:id", catchAsync(async (req, res) => {
    const id = req.params.id;
    await TodoTask.findByIdAndRemove(id, (err) => {
        if (err) return res.status(500).send(err);
        res.redirect("/todo");
    });
}));

//remove all todos
app.post("/removeall",catchAsync( async (req, res) => {
    await TodoTask.deleteMany({});
    res.redirect("/todo");
}));

app.get('/login', (req, res) => {
    const { username = 'Rahul' } = req.query;
    req.session.username = username;
    res.render('user/login');
})
app.post('/login',passport.authenticate('local',{failureFlash:true, failureRedirect:'/login'}) ,(req,res)=>{
    res.redirect('/todo');
})

app.get('/register',(req,res)=>{
    res.render('user/register');
})

app.post('/register',catchAsync(async(req,res)=>{
    try{
        const {email,username,password}=req.body;
        const user=new User({email,username});
        const regUser= await User.register(user,password); 
        res.redirect('/todo');
    }
    catch(e){
        req.flash('error',e.message);
        res.redirect('/register');
    }
}))

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
