const express = require('express');
const session = require('express-session');
const path = require('path');
const routes = require('./routes');
const app = express();

const hostname = '127.0.0.1';
const port = 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(session({
    name: 'session',
    secret: 'my_secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 3600 * 1000,//1hr
    }
}));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
app.use('/icons', express.static(path.join(__dirname, 'node_modules/bootstrap-icons/font')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(routes);
app.use((err, req, res, next) => {
    console.log(err);
    return res.send('InternalServerError');
});

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});