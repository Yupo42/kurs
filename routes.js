const router = require("express").Router();
const { body } = require("express-validator");

const {
    homePage,
    login,
    loginPage,
} = require("./controllers/userController");

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
router.get("/login", ifLoggedin, loginPage);
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
module.exports = router;