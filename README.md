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
npm start
```

Если вы уже скачали проект, и вам надо лишь его настроить и запустить, то не нужны первые две команды.
То есть нужно выполнить лишь:
```bash
npm install
npm start
```

# Синхронизация
Этот проект — часть набора проектов notes, то есть поддерживает синхронизацию с веб сервером (https://github.com/coder8080/express-notes).
Чтобы синхронизировать записи, необходимо сначала зарегистрироваться на сайте express-notes, затем указать адрес сервера, логин и пароль в приложении.

Внимание! Чтобы избежать ошибок, необходимо использовать последнюю версию как electron-notes, так и express-notes.
Разные версии могут быть не совместимы!

# Проблемы
Обо всех проблемах сообщать тут: https://github.com/coder8080/electron-notes/issues

# Скриншоты
![Светлая тема](https://raw.githubusercontent.com/coder8080/electron-notes/master/screenshots/light_theme.png)

![Тёмная тема](https://raw.githubusercontent.com/coder8080/electron-notes/master/screenshots/dark_theme.png)
