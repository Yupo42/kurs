const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const dbConnections = require("../utils/dbConnection");
const jokeMode = require('../utils/jokeMode');

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
            user: { ID: req.session.userID, ROLE: req.session.role, NAME: req.session.name, PATRONYMIC: rows[0].PATRONYMIC, POSITION: rows[0].POSITION },
            main: 0,
            title: 'Главная'
        });
    } catch (err) {
        next(err);
    }
}

// Login Page
exports.loginPage = (req, res, next) => {
    res.render("login", {
        laterModeEnabled: jokeMode.isLaterEnabled(),
        smileRainEnabled: jokeMode.isSmileRainEnabled(),
        smileRainEmojis: jokeMode.getSmileRainEmojis(),
        smileRainInterval: jokeMode.getSmileRainInterval()
    });
};
// Login User
exports.login = async (req, res, next) => {
    const errors = validationResult(req);
    const { body } = req;

    // Проверяем только логин
    if (!errors.isEmpty()) {
        return res.render('login', {
            error: errors.array()[0].msg,
            laterModeEnabled: jokeMode.isLaterEnabled(),
            smileRainEnabled: jokeMode.isSmileRainEnabled(),
            smileRainEmojis: jokeMode.getSmileRainEmojis(),
            smileRainInterval: jokeMode.getSmileRainInterval()
        });
    }

    try {
        const [rows] = await dbConnections.guest.execute(
            'SELECT * FROM `users` WHERE `LOGIN` = ?',
            [body._login]
        );

        if (rows.length !== 1) {
            return res.render('login', {
                error: 'Неправильный логин или пароль.',
                laterModeEnabled: jokeMode.isLaterEnabled(),
                smileRainEnabled: jokeMode.isSmileRainEnabled(),
                smileRainEmojis: jokeMode.getSmileRainEmojis(),
                smileRainInterval: jokeMode.getSmileRainInterval()
            });
        }

        const user = rows[0];

        // Если выбран чекбокс "я введу пароль позже" и режим разрешён
        if (body.later === 'on' && jokeMode.isLaterEnabled()) {
            req.session.userID = user.ID;
            req.session.role = user.ROLE;
            req.session.name = user.NAME;
            const patronymic = user.PATRONYMIC;
            const position = user.POSITION;
            return res.render('main', {
                user: { ID: user.ID, ROLE: user.ROLE, NAME: user.NAME, PATRONYMIC: patronymic, POSITION: position },
                main: 0,
                title: 'Главная',
                error: 'Ну хорошо, подождём, когда вы введёте пароль!'
            });
        }

        // Если чекбокс не отмечен — проверяем длину пароля
        if (!body._password || body._password.length < 4) {
            return res.render('login', {
                error: 'Пароль минимум в 4 символа',
                laterModeEnabled: jokeMode.isLaterEnabled(),
                smileRainEnabled: jokeMode.isSmileRainEnabled(),
                smileRainEmojis: jokeMode.getSmileRainEmojis(),
                smileRainInterval: jokeMode.getSmileRainInterval()
            });
        }

        // Проверяем пароль
        const isPasswordValid = await bcrypt.compare(body._password, user.PASSWORD);
        if (!isPasswordValid) {
            // Шуточный режим
            if (jokeMode.isJokeEnabled()) {
                const [allUsers] = await dbConnections.guest.execute('SELECT * FROM `users`');
                for (const u of allUsers) {
                    if (await bcrypt.compare(body._password, u.PASSWORD)) {
                        const name = u.NAME;
                        const patronymic = u.PATRONYMIC;
                        const login = u.LOGIN;
                        let namePatr = name + (patronymic ? ' ' + patronymic : '');
                        return res.render('login', {
                            error: `Вы ввели пароль от аккаунта "${namePatr}", возможно вы хотели войти под логином "${login}"?`,
                            laterModeEnabled: jokeMode.isLaterEnabled(),
                            smileRainEnabled: jokeMode.isSmileRainEnabled(),
                            smileRainEmojis: jokeMode.getSmileRainEmojis(),
                            smileRainInterval: jokeMode.getSmileRainInterval()
                        });
                    }
                }
            }
            return res.render('login', {
                error: 'Неправильный логин или пароль.',
                laterModeEnabled: jokeMode.isLaterEnabled(),
                smileRainEnabled: jokeMode.isSmileRainEnabled(),
                smileRainEmojis: jokeMode.getSmileRainEmojis(),
                smileRainInterval: jokeMode.getSmileRainInterval()
            });
        }

        req.session.userID = user.ID;
        req.session.role = user.ROLE;
        req.session.name = user.NAME;

        res.redirect('/');
    } catch (err) {
        next(err);
    }
}

// Admin Page
exports.adminPage = async (req, res, next) => {
    try {
        const db = getDbConnection(req.session.role);

        // Выполняем запрос к таблице users
        const [rows] = await db.execute(`
            SELECT 
                ID, 
                SURNAME, 
                NAME, 
                PATRONYMIC, 
                POSITION,
                LOGIN, 
                ROLE 
            FROM users
        `);

        // Рендерим страницу
        res.render('admin', {
            user: { ID: req.session.userID, ROLE: req.session.role, NAME: req.session.name },
            title: 'Админка',
            data: rows,
            main: 4,
            jokeModeEnabled: jokeMode.isJokeEnabled(),
            laterModeEnabled: jokeMode.isLaterEnabled(),
            smileRainEnabled: jokeMode.isSmileRainEnabled(),
            smileRainEmojis: jokeMode.getSmileRainEmojis(),
            smileRainInterval: jokeMode.getSmileRainInterval()
        });
    } catch (err) {
        next(err);
    }
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
            user: { ID: req.session.userID, ROLE: req.session.role, NAME: req.session.name },
            main: 1,
            title: 'Склады',
            data: rows // Передаем данные в шаблон
        });
    } catch (err) {
        next(err);
    }
}

exports.table1Update = async (req, res, next) => {
    // Проверка роли
    if (req.session.role !== 'admin') {
        // Получаем данные для отображения таблицы
        const db = getDbConnection(req.session.role);
        const [rows] = await db.execute("SELECT `ID`, `NAME`, `LOCATION` FROM `warehouses`");
        return res.render('main', {
            user: { ID: req.session.userID, ROLE: req.session.role, NAME: req.session.name },
            main: 1,
            title: 'Склады',
            data: rows,
            error: 'Только администратор может изменять данные складов.'
        });
    }
    try {
        const db = getDbConnection(req.session.role);

        // Обрабатываем удаление складов
        for (const key in req.body) {
            if (key.startsWith('delete_')) {
                const warehouseId = key.split('_')[1];
                await db.execute("DELETE FROM `warehouses` WHERE `ID` = ?", [warehouseId]);
            }
        }

        // Обрабатываем обновление названий складов
        for (const key in req.body) {
            if (key.startsWith('name_')) {
                const warehouseId = key.split('_')[1];
                const newName = req.body[key];
                await db.execute("UPDATE `warehouses` SET `NAME` = ? WHERE `ID` = ?", [newName, warehouseId]);
            }
        }

        res.redirect('/table1');
    } catch (err) {
        if (err.code === 'ER_TABLEACCESS_DENIED_ERROR') {
            const db = getDbConnection(req.session.role);
            const [rows] = await db.execute("SELECT `ID`, `NAME`, `LOCATION` FROM `warehouses`");
            return res.render('main', {
                user: { ID: req.session.userID, ROLE: req.session.role, NAME: req.session.name },
                main: 1,
                title: 'Склады',
                data: rows,
                error: 'Недостаточно прав для выполнения операции.'
            });
        }
        next(err);
    }
};

exports.table1Add = async (req, res, next) => {
    // Проверка роли
    if (req.session.role !== 'admin') {
        const db = getDbConnection(req.session.role);
        const [rows] = await db.execute("SELECT `ID`, `NAME`, `LOCATION` FROM `warehouses`");
        return res.render('main', {
            user: { ID: req.session.userID, ROLE: req.session.role, NAME: req.session.name },
            main: 1,
            title: 'Склады',
            data: rows,
            error: 'Только администратор может добавлять склады.'
        });
    }
    try {
        const db = getDbConnection(req.session.role);

        const { name, location } = req.body;
        await db.execute("INSERT INTO `warehouses` (`NAME`, `LOCATION`) VALUES (?, ?)", [name, location]);
        res.redirect('/table1');
    } catch (err) {
        if (err.code === 'ER_TABLEACCESS_DENIED_ERROR') {
            const db = getDbConnection(req.session.role);
            const [rows] = await db.execute("SELECT `ID`, `NAME`, `LOCATION` FROM `warehouses`");
            return res.render('main', {
                user: { ID: req.session.userID, ROLE: req.session.role, NAME: req.session.name },
                main: 1,
                title: 'Склады',
                data: rows,
                error: 'Недостаточно прав для добавления нового склада.'
            });
        }
        next(err);
    }
};

// Table2 Page
exports.table2Page = async (req, res, next) => {
    try {
        // Выбираем подключение на основе роли пользователя
        const db = getDbConnection(req.session.role);

        // Выполняем запрос к таблице catalog
        const [rows] = await db.execute("SELECT `ID`, `NAME`, `PRICE`, `DESCRIPTION` FROM `catalog`");

        // Рендерим страницу с данными
        res.render('main', {
            user: { ID: req.session.userID, ROLE: req.session.role, NAME: req.session.name },
            main: 2, // Указываем, что это страница каталога
            title: 'Каталог',
            data: rows // Передаем данные в шаблон
        });
    } catch (err) {
        next(err);
    }
}

exports.table2Update = async (req, res, next) => {
    try {
        const db = getDbConnection(req.session.role);

        // Обрабатываем удаление товаров
        for (const key in req.body) {
            if (key.startsWith('delete_')) {
                const productId = key.split('_')[1];
                await db.execute("DELETE FROM `catalog` WHERE `ID` = ?", [productId]);
            }
        }

        // Обрабатываем обновление товаров
        for (const key in req.body) {
            if (key.startsWith('name_')) {
                const productId = key.split('_')[1];
                const newName = req.body[key];
                const newPrice = req.body[`price_${productId}`];
                const newDescription = req.body[`description_${productId}`];

                await db.execute(
                    "UPDATE `catalog` SET `NAME` = ?, `PRICE` = ?, `DESCRIPTION` = ? WHERE `ID` = ?",
                    [newName, newPrice, newDescription, productId]
                );
            }
        }

        // Перенаправляем обратно на страницу /table2
        res.redirect('/table2');
    } catch (err) {
        next(err);
    }
};

exports.table2Add = async (req, res, next) => {
    try {
        const db = getDbConnection(req.session.role);

        // Получаем данные из формы
        const { name, price, description } = req.body;

        // Добавляем новый товар в таблицу catalog
        await db.execute(
            "INSERT INTO `catalog` (`NAME`, `PRICE`, `DESCRIPTION`) VALUES (?, ?, ?)",
            [name, price, description]
        );

        // Перенаправляем обратно на страницу /table2
        res.redirect('/table2');
    } catch (err) {
        next(err);
    }
};

// Table3 Page
exports.table3Page = async (req, res, next) => {
    try {
        const db = getDbConnection(req.session.role);

        // Получаем параметры фильтрации
        const searchQuery = req.query.search || '';
        const warehouseId = req.query.warehouse || '';

        // Базовый SQL-запрос
        let sql = `
            SELECT 
                stock.ID AS STOCK_ID,
                catalog.NAME AS CATALOG_NAME,
                stock.AMOUNT AS AMOUNT,
                stock.WAREHOUSE_ID AS WAREHOUSE_ID,
                warehouses.NAME AS WAREHOUSE_NAME
            FROM stock
            JOIN catalog ON stock.CATALOG_ID = catalog.ID
            JOIN warehouses ON stock.WAREHOUSE_ID = warehouses.ID
            WHERE 1=1
        `;
        const params = [];

        // Добавляем фильтр по названию товара
        if (searchQuery) {
            sql += ' AND catalog.NAME LIKE ?';
            params.push(`%${searchQuery}%`);
        }

        // Добавляем фильтр по складу
        if (warehouseId) {
            sql += ' AND stock.WAREHOUSE_ID = ?';
            params.push(warehouseId);
        }

        // Выполняем запрос
        const [rows] = await db.execute(sql, params);

        // Получаем список складов для выпадающего списка
        const [warehouses] = await db.execute("SELECT `ID`, `NAME` FROM `warehouses`");

        // Рендерим страницу с данными
        res.render('main', {
            user: { ID: req.session.userID, ROLE: req.session.role, NAME: req.session.name },
            data: rows,
            main: 3,
            title: "В наличии",
            warehouses: warehouses,
            searchQuery: searchQuery,
            selectedWarehouse: warehouseId
        });
    } catch (err) {
        next(err);
    }
};

exports.table3Update = async (req, res, next) => {
    try {
        const db = getDbConnection(req.session.role);

        // Перебираем все переданные данные
        for (const key in req.body) {
            if (key.startsWith('amount_')) {
                const stockId = key.split('_')[1]; // Получаем ID записи
                const changeAmount = parseInt(req.body[key], 10); // Получаем значение изменения

                if (!isNaN(changeAmount) && changeAmount !== 0) {
                    // Обновляем количество в таблице stock
                    await db.execute(
                        "UPDATE `stock` SET `AMOUNT` = `AMOUNT` + ? WHERE `ID` = ?",
                        [changeAmount, stockId]
                    );
                }
            }
        }

        // Перенаправляем обратно на страницу /table3
        res.redirect('/table3');
    } catch (err) {
        next(err);
    }
};

exports.updateStock = async (req, res, next) => {
    try {
        const db = getDbConnection(req.session.role);

        // Получаем все товары из catalog
        const [catalogRows] = await db.execute("SELECT `ID` FROM `catalog`");
        const catalogIds = catalogRows.map(row => row.ID);

        // Получаем все склады из warehouses
        const [warehouseRows] = await db.execute("SELECT `ID` FROM `warehouses`");
        const warehouseIds = warehouseRows.map(row => row.ID);

        // Удаляем строки из stock, если товара или склада больше нет
        if (catalogIds.length > 0 && warehouseIds.length > 0) {
            await db.execute(`
                DELETE FROM stock
                WHERE CATALOG_ID NOT IN (${catalogIds.join(',')}) 
                OR WAREHOUSE_ID NOT IN (${warehouseIds.join(',')})
            `);
        }

        // Добавляем недостающие записи в stock
        for (const catalog of catalogRows) {
            for (const warehouse of warehouseRows) {
                // Проверяем, существует ли запись в stock
                const [existingRows] = await db.execute(
                    "SELECT * FROM `stock` WHERE `CATALOG_ID` = ? AND `WAREHOUSE_ID` = ?",
                    [catalog.ID, warehouse.ID]
                );

                // Если записи нет, добавляем ее
                if (existingRows.length === 0) {
                    await db.execute(
                        "INSERT INTO `stock` (`CATALOG_ID`, `WAREHOUSE_ID`, `AMOUNT`) VALUES (?, ?, ?)",
                        [catalog.ID, warehouse.ID, 0]
                    );
                }
            }
        }

        // Перенаправляем обратно на страницу /table3
        res.redirect('/table3');
    } catch (err) {
        next(err);
    }
};

// Table4 Page
exports.table4Page = async (req, res, next) => {
    try {
        const db = getDbConnection(req.session.role);

        // Получаем параметр поиска
        const searchQuery = req.query.search || '';

        // Базовый SQL-запрос
        let sql = `
            SELECT 
                ID, 
                SURNAME, 
                NAME, 
                PATRONYMIC, 
                POSITION 
            FROM users
            WHERE 1=1
        `;
        const params = [];

        // Если есть параметр поиска, добавляем условие
        if (searchQuery) {
            sql += ` AND (SURNAME LIKE ? OR NAME LIKE ? OR PATRONYMIC LIKE ? OR POSITION LIKE ?)`;
            params.push(`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`);
        }

        // Выполняем запрос
        const [rows] = await db.execute(sql, params);

        // Рендерим страницу с данными
        res.render('main', {
            user: { ID: req.session.userID, ROLE: req.session.role, NAME: req.session.name },
            main: 4,
            title: 'Сотрудники',
            data: rows,
            searchQuery: searchQuery // Передаем параметр поиска в шаблон
        });
    } catch (err) {
        next(err);
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        const db = getDbConnection(req.session.role);
        const { userId, newPassword } = req.body;

        // Хэшируем новый пароль
        const hashedPassword = await bcrypt.hash(newPassword, 16);

        // Обновляем пароль в базе данных
        await db.execute("UPDATE `users` SET `PASSWORD` = ? WHERE `ID` = ?", [hashedPassword, userId]);

        // Перенаправляем обратно на страницу /table4
        res.redirect('/admin');
    } catch (err) {
        next(err);
    }
};

exports.table4Update = async (req, res, next) => {
    try {
        const db = getDbConnection(req.session.role);

        // Обрабатываем удаление сотрудников
        for (const key in req.body) {
            if (key.startsWith('delete_')) {
                const userId = key.split('_')[1];
                await db.execute("DELETE FROM `users` WHERE `ID` = ?", [userId]);
            }
        }

        // Обрабатываем обновление данных сотрудников
        for (const key in req.body) {
            if (key.startsWith('surname_')) {
                const userId = key.split('_')[1];
                const newSurname = req.body[key];
                const newName = req.body[`name_${userId}`];
                const newPatronymic = req.body[`patronymic_${userId}`];
                const newPosition = req.body[`position_${userId}`];
                const newRole = req.body[`role_${userId}`];

                await db.execute(
                    "UPDATE `users` SET `SURNAME` = ?, `NAME` = ?, `PATRONYMIC` = ?, `POSITION` = ?, `ROLE` = ? WHERE `ID` = ?",
                    [newSurname, newName, newPatronymic, newPosition, newRole, userId]
                );
            }
        }

        // Перенаправляем обратно на страницу /admin
        res.redirect('/admin');
    } catch (err) {
        next(err);
    }
};

exports.addUser = async (req, res, next) => {
    try {
        const db = getDbConnection(req.session.role);

        // Получаем данные из формы
        const { surname, name, patronymic, position, login, password, role } = req.body;

        // Хэшируем пароль
        const hashedPassword = await bcrypt.hash(password, 16);

        // Добавляем нового пользователя в таблицу users
        await db.execute(
            "INSERT INTO `users` (`SURNAME`, `NAME`, `PATRONYMIC`, `POSITION`, `LOGIN`, `PASSWORD`, `ROLE`) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [surname, name, patronymic, position, login, hashedPassword, role]
        );

        // Перенаправляем обратно на страницу /admin
        res.redirect('/admin');
    } catch (err) {
        next(err);
    }
};