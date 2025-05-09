const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const dbConnection = require("../utils/dbConnection");
//const { console } = require("inspector");

//HomePage
exports.homePage = async (req, res, next) => {
    const [row] = await dbConnection.execute("SELECT * FROM `users` WHERE `ID`=?", [req.session.userID]);
    if (row.length !== 1) {
        return res.redirect('/logout');
    }
    res.render('main', {
        user: row[0]
    });
}

// Login Page
exports.loginPage = (req, res, next) => {
    res.render("login");
};
// Login User
exports.login = async (req, res, next) => {
    const errors = validationResult(req);
    const { body } = req;

    if (!errors.isEmpty()) {
        return res.render('login', {
            error: errors.array()[0].msg
        });
    }
    try {
        const [row] = await dbConnection.execute('SELECT * FROM `users` WHERE `LOGIN` =? ', [body._login]);
        if (row.length != 1) {
            return res.render('login', {
                error: 'Неправильный логин или пароль.'
            });
        }
        const checkPass = await bcrypt.compare(body._password,
            row[0].PASSWORD);
        if (checkPass === true) {
            req.session.userID = row[0].ID;
            return res.redirect('/');
        }
        res.render('login', {
            error: 'Неправильный логин или пароль..'
        });
    }
    catch (e) {
        next(e);
    }
}
