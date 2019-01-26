"use strict";
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(express.static('static'));
app.set('views', './views');
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: false, uploadDir: './upload' }));
app.use( session({
        secret : 's3Cur3',
        name : 'sessionId',
        cookie: { maxAge: 6000000}
    })
);
const users={};
const messenge=[];
function logger(req, res, next) {
    if(req.session.user){
        next()
    }
    else {
        res.render('index', {error: 'Нужна авторизация'})
    }}



app.get('/', logger, function(req, res){
    res.render('index', {user:req.session.user, messenge: messenge})
});

app.post('/login', (req, res)=>{


    if (req.body.email in users){

        if (users[req.body.email] === req.body.password){
            req.session.user=req.body.email;
            res.redirect('/')
        }
        else {
            res.render('index', {error: 'Не правильный пароль'})
        }
    }
    else {
        res.redirect('/')
    }

});
app.post('/register', (req, res)=>{
    users[req.body.email]=req.body.password;
    req.session.user=req.body.email;
    res.redirect('/')
});
app.post('/logout', (req, res)=>{
    console.log('+');
    req.session.destroy(function(err) {
        res.redirect('/')
    })
})

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
        messenge.push(msg);
        io.emit('chat message', msg);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
