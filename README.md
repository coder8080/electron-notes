# electron-notes
Настольный блокнот, написанный на node.js с использованием библиотеки electron

# Системные требования
- Компьютер с рабочим окружением/оконным менеджером
- рабочий терминал (gnome terminal, cmd, powershell, etc.)
- node и npm актуальной версии
- git актуальной версии

# Запуск
Чтобы скачать и запустить проект, вам необходимо выполнить следующие команды:
```bash
git clone https://github.com/coder8080/electron-notes
cd electron-notes
npm install
node ./database_deploy.js
npm start
```

Если вы уже скачали проект, и вам надо лишь его настроить и запустить, то не нужны первые две команды.
То есть нужно выполнить лишь:
```bash
npm install
node ./database_deploy.js
npm start
```

# Синхронизация
Этот проект — часть набора проектов notes, то есть поддерживает синхронизацию с веб сервером (https://github.com/coder8080/express-notes).
Чтобы синхронизировать записи, необходимо сначала зарегистрироваться на сайте express-notes, затем указать адрес сервера, логин и пароль в приложении.

# Проблемы
Обо всех проблемах сообщать тут: https://github.com/coder8080/electron-notes/issues

# Скриншоты
![Главная страница](https://raw.githubusercontent.com/coder8080/electron-notes/master/screenshots/1.png)

![Страница создания записи](https://raw.githubusercontent.com/coder8080/electron-notes/master/screenshots/2.png)
