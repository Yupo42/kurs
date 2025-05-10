const express = require('express');
const { body } = require("express-validator");
const userController = require('./controllers/userController');

const router = express.Router();

const {
    homePage,
    login,
    loginPage,
    adminPage,
    table1Page,
    table2Page,
    table3Page,
    table4Page,
} = userController;

const ifNotLoggedin = (req, res, next) => {
    if (!req.session.userID) {
        return res.redirect('/login');
    }
    next();
}
const ifLoggedin = (req, res, next) => {
    if (req.session.userID) {
        return res.redirect('/');
    }
    next();
}
router.get('/', ifNotLoggedin, homePage);
router.get('/table1', ifNotLoggedin, table1Page);
router.get('/table2', ifNotLoggedin, table2Page);
router.get('/table3', ifNotLoggedin, table3Page);
router.get('/table4', ifNotLoggedin, table4Page);
router.get("/login", ifLoggedin, loginPage);
router.get("/admin", ifNotLoggedin, adminPage);

router.post("/login",
    ifLoggedin,
    [
        body("_login", "Неправильный логин")
            .notEmpty()
            .escape()
            .trim(),
        body("_password", "Пароль минимум в 4 символа")
            .notEmpty()
            .trim()
            .isLength({ min: 4 }),
    ],
    login
);
router.get('/logout', (req, res, next) => {
    req.session.destroy((err) => {
        next(err);
    });
    res.redirect('/login');
});

// Post request for tables & admin
// TODO

module.exports = router;