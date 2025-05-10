-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1:3306
-- Время создания: Май 10 2025 г., 21:28
-- Версия сервера: 8.0.30
-- Версия PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `furnitureBD`
--

-- --------------------------------------------------------

--
-- Структура таблицы `catalog`
--

CREATE TABLE `catalog` (
  `ID` int UNSIGNED NOT NULL,
  `NAME` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `PRICE` int NOT NULL,
  `DESCRIPTION` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `catalog`
--

INSERT INTO `catalog` (`ID`, `NAME`, `PRICE`, `DESCRIPTION`) VALUES
(1, 'Стол компьютерный белый', 3500, 'Стол компьютерный Aceline Rush 01 в белом цвете с черной окантовкой создан для геймеров. Он обеспечивает создание комфортной зоны для проведения увлекательного досуга за играми.'),
(2, 'Компьютерное кресло черное', 1200, 'Кресло офисное Бюрократ CH-1201NX/BLACK – облегченная модель с тканевой обивкой, идеально подходящая для оборудования офисов. Кресло установлено на подставку с вращающимися на 360° колесами.'),
(3, 'Компьютерное кресло бирюзовое', 3000, 'Кресло игровое DEXP Gritt 20W обшито бело-бирюзовой сетчатой тканью с высокой воздухопроницаемостью, благодаря которой достигается хорошая вентиляция и комфорт пользования в летний период.'),
(4, 'Столик для ноутбука черный', 1000, 'Столик для ноутбука BRABIX отлично подойдет для работы с ноутбуком лежа, для занятия творчеством, для завтрака в постели. Столик можно использовать в качестве полки. Также он станет полезным подарком для друзей, родственников и коллег. '),
(5, 'Палка', 9999, 'Обычная палка.');

-- --------------------------------------------------------

--
-- Структура таблицы `stock`
--

CREATE TABLE `stock` (
  `ID` int UNSIGNED NOT NULL,
  `CATALOG_ID` int NOT NULL,
  `AMOUNT` int NOT NULL,
  `WAREHOUSE_ID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `stock`
--

INSERT INTO `stock` (`ID`, `CATALOG_ID`, `AMOUNT`, `WAREHOUSE_ID`) VALUES
(2, 1, 50, 2),
(3, 2, 200, 2),
(4, 2, 150, 1),
(5, 3, 430, 1),
(6, 3, 140, 2),
(11, 1, 170, 1),
(13, 4, 100, 1),
(14, 4, 50, 2),
(17, 3, 500, 5),
(18, 3, 420, 6),
(19, 2, 310, 5),
(20, 2, 190, 6),
(21, 1, 630, 5),
(22, 1, 120, 6),
(23, 4, 130, 5),
(24, 4, 60, 6),
(25, 3, 30, 7),
(26, 2, 20, 7),
(27, 1, 40, 7),
(28, 4, 10, 7),
(29, 5, 0, 1),
(30, 5, 0, 7),
(31, 5, 0, 2),
(32, 5, 9999, 5),
(33, 5, 0, 6);

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `ID` int UNSIGNED NOT NULL,
  `SURNAME` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `NAME` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `PATRONYMIC` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `POSITION` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `LOGIN` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `PASSWORD` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ROLE` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'worker'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`ID`, `SURNAME`, `NAME`, `PATRONYMIC`, `POSITION`, `LOGIN`, `PASSWORD`, `ROLE`) VALUES
(1, 'Гусельников', 'Юрий', 'Александрович', 'Программист-администратор', 'admin', '$2b$16$vnizpzGDF3i7XHsV2H28Ce63r1a9IDGhGJlkvD89UAu.p7ppTwb4m', 'admin'),
(3, 'Каплан', 'Эдуард', 'Николаевич', 'Кладовщик', 'eduard0', '$2b$16$6dw1/mRXk5PIPW6mTiqEk.Kb/8a89TOf5eVAI35jKzNy56fS9NANG', 'worker'),
(4, 'Парняков', 'Игорь', 'Германович', 'Криптоинвестор', 'igOryao', '$2b$16$DDvSE8qv.t87Geh9Q078R.rkmPBsYpt3rxrw50pqx.9weAosbHgWu', 'worker'),
(5, 'Бритенко', 'Петр', 'Вадимович', 'Администратор БД', 'pocolocoX3000Pro', '$2b$16$K0kpQkvQ00XC6553JkKujugeXpPTY86Y15YikkcMH.d8jRnlxj0W.', 'admin'),
(6, 'Артемьев', 'Геннадий', 'Петрович', 'Администратор БД', 'admin2', '$2b$16$Aj8UZ6.xlfg2ehrJCKtONOSczxBEiE.LhrQH69UtoV7Osqh9U9mPu', 'admin');

-- --------------------------------------------------------

--
-- Структура таблицы `warehouses`
--

CREATE TABLE `warehouses` (
  `ID` int UNSIGNED NOT NULL,
  `NAME` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `LOCATION` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `warehouses`
--

INSERT INTO `warehouses` (`ID`, `NAME`, `LOCATION`) VALUES
(1, 'ЕкбСклад им. Святой Беброчки', 'Екатеринбург'),
(2, 'МосКладБизнес', 'Москва'),
(5, 'Сказочный', 'Гари'),
(6, 'Тридцать Склад', 'Нижний Тагил'),
(7, 'Зеленый', 'Владивосток');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `catalog`
--
ALTER TABLE `catalog`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `NAME` (`NAME`);

--
-- Индексы таблицы `stock`
--
ALTER TABLE `stock`
  ADD PRIMARY KEY (`ID`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `LOGIN` (`LOGIN`);

--
-- Индексы таблицы `warehouses`
--
ALTER TABLE `warehouses`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `NAME` (`NAME`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `catalog`
--
ALTER TABLE `catalog`
  MODIFY `ID` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT для таблицы `stock`
--
ALTER TABLE `stock`
  MODIFY `ID` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `ID` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT для таблицы `warehouses`
--
ALTER TABLE `warehouses`
  MODIFY `ID` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
