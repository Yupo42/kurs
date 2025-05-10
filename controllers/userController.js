const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const dbConnections = require("../utils/dbConnection");

const getDbConnection = (role) => {
    switch (role) {
        case 'admin':
            return dbConnections.admin;
        case 'worker':
            return dbConnections.worker;
        default:
            return dbConnections.guest;
    }
};

//HomePage
exports.homePage = async (req, res, next) => {
    try {
        // Выбираем подключение на основе роли пользователя
        const db = getDbConnection(req.session.role);

        const [rows] = await db.execute("SELECT * FROM `users` WHERE `ID`=?", [req.session.userID]);
        if (rows.length !== 1) {
            return res.redirect('/logout');
        }

        res.render('main', {
            user: rows[0],
            main: 0,
            title: 'Главная'
        });
    } catch (err) {
        next(err);
    }
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
        // Используем гостевое подключение для проверки логина
        const [rows] = await dbConnections.guest.execute(
            'SELECT * FROM `users` WHERE `LOGIN` = ?',
            [body._login]
        );

        if (rows.length !== 1) {
            return res.render('login', {
                error: 'Неправильный логин или пароль.'
            });
        }

        const user = rows[0];

        // Проверяем пароль
        const isPasswordValid = await bcrypt.compare(body._password, user.PASSWORD);
        if (!isPasswordValid) {
            return res.render('login', {
                error: 'Неправильный логин или пароль.'
            });
        }

        // Сохраняем данные пользователя в сессии
        req.session.userID = user.ID;
        req.session.role = user.ROLE;

        res.redirect('/');
    } catch (err) {
        next(err);
    }
}

// Admin Page
exports.adminPage = async (req, res, next) => {
    // const hashPass = await bcrypt.hash("12345678", 16);
    // console.log(hashPass);
    const [row] = await dbConnections.guest.execute("SELECT * FROM `users` WHERE `ID`=?", [req.session.userID]);
    if (row.length !== 1) {
        return res.redirect('/logout');
    }
    if (row[0].ROLE !== 'admin') {
        return res.redirect('/');
    }
    res.render('admin', {
        user: row[0],
        title: 'Админка'
    });
}

// Table1 Page
exports.table1Page = async (req, res, next) => {
    try {
        // Выбираем подключение на основе роли пользователя
        const db = getDbConnection(req.session.role);

        // Выполняем запрос к таблице warehouses
        const [rows] = await db.execute("SELECT `ID`, `NAME`, `LOCATION` FROM `warehouses`");

        // Рендерим страницу с данными
        res.render('main', {
            user: { ID: req.session.userID, ROLE: req.session.role },
            main: 1,
            title: 'Склады',
            data: rows // Передаем данные в шаблон
        });
    } catch (err) {
        next(err);
    }
}
// Table2 Page
exports.table2Page = async (req, res, next) => {
    try {
        // Выбираем подключение на основе роли пользователя
        const db = getDbConnection(req.session.role);

        // Выполняем запрос к таблице catalog
        const [rows] = await db.execute("SELECT `ID`, `NAME`, `PRICE`, `DESCRIPTION` FROM `catalog`");

        // Рендерим страницу с данными
        res.render('main', {
            user: { ID: req.session.userID, ROLE: req.session.role },
            main: 2, // Указываем, что это страница каталога
            title: 'Каталог',
            data: rows // Передаем данные в шаблон
        });
    } catch (err) {
        next(err);
    }
}
// Table3 Page
exports.table3Page = async (req, res, next) => {
    try {
        // Выбираем подключение на основе роли пользователя
        const db = getDbConnection(req.session.role);

        // Выполняем запрос с объединением таблиц
        const [rows] = await db.execute(`
            SELECT 
                stock.ID AS STOCK_ID,
                catalog.NAME AS CATALOG_NAME,
                stock.AMOUNT AS AMOUNT,
                warehouses.NAME AS WAREHOUSE_NAME
            FROM stock
            JOIN catalog ON stock.CATALOG_ID = catalog.ID
            JOIN warehouses ON stock.WAREHOUSE_ID = warehouses.ID
        `);

        // Рендерим страницу с данными
        res.render('main', {
            user: { ID: req.session.userID, ROLE: req.session.role },
            main: 3, // Указываем, что это страница наличия
            title: 'Наличие',
            data: rows // Передаем данные в шаблон
        });
    } catch (err) {
        next(err);
    }
};
// Table4 Page
exports.table4Page = async (req, res, next) => {
    try {
        // Выбираем подключение на основе роли пользователя
        const db = getDbConnection(req.session.role);

        // Выполняем запрос к таблице user, исключая LOGIN и PASSWORD
        const [rows] = await db.execute(`
            SELECT 
                ID, 
                SURNAME, 
                NAME, 
                PATRONYMIC, 
                POSITION 
            FROM users
        `);

        // Рендерим страницу с данными
        res.render('main', {
            user: { ID: req.session.userID, ROLE: req.session.role },
            main: 4, // Указываем, что это страница сотрудников
            title: 'Сотрудники',
            data: rows // Передаем данные в шаблон
        });
    } catch (err) {
        next(err);
    }
};