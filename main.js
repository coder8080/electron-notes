/* Заметки на electron js. Похожим проектом является express-notes(принадлежащий мне же(я coder8080)).
В будущем планируется возможность синхронизации приложения и сервера */

// Получаем зависимости
const {app, BrowserWindow, ipcMain} = require('electron')
const ejs = require('ejs-electron')
const path = require('path')
const sqlite = require('sqlite3')
const db = new sqlite.Database('db.sqlite3')

// Объявляем переменную окна
let win

/* Функция создания окна */
function createWindow() {
    // Задаём значение переменной
    win = new BrowserWindow({
        width: 600,
        height: 400,
        center: true,
        webPreferences: {
            preload: path.join(__dirname, 'js', 'preload.js')
        }
    })
    go_on_main(win)
}

function go_on_main() {
    db.all(`select * from notes`, (err, data) => {
        // Если произошла ошибка, то выкидываем её
        if (err) {
            console.log('app crashed with error:')
            throw err
        }
        // Объявляем переменные
        let notes
        let are_notes
        // Проверяем, вернула ли база данных какую-либо информацию
        if (data.length > 0) {
            are_notes = true
            // Если была получена одна запись, то превращаем её в массив
            if (data [0] === undefined) {
                notes = [data]
            } else {
                notes = data
            }
        } else {
            are_notes = false
            notes = []
        }
        // Показываем пользователю страницу
        ejs.data('are_notes', are_notes)
        ejs.data('notes', notes)
        win.loadFile(path.join(__dirname, 'pages/profile.ejs')).then(err => {
            if (err) {
                console.log('app crashed when showing first page with error:')
                throw err
            }
        })
    })
}

app.whenReady().then(() => {
    createWindow()
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

ipcMain.on('view-note', (e, id) => {
    db.get(`select * from notes where id = ${id};`, (err, data) => {
        if (err) {
            console.log('app crashed when getting information from database with error:')
            throw err
        }
        if (data) {
            ejs.data('note', data)
            win.loadFile(path.join(__dirname, 'pages/note.ejs')).then(err => {
                if (err) {
                    console.log('app crashed when showing first page with error:')
                    throw err
                }
            })
        } else {
        }
    })
})

ipcMain.on('remove-note', (e, id) => {
    db.run(`delete from notes where id = ${id};`, (err) => {
        if (err) {
            console.log('app crashed when removing note with error:')
            throw err
        }
        go_on_main()
    })
})

ipcMain.on('go-on-main', () => {
    go_on_main()
})

ipcMain.on('new-note', () => {
    win.loadFile(path.join(__dirname, 'pages', 'new-note.ejs')).then(err => {
        if (err) {
            console.log('app crashed when showing first page with error:')
            throw err
        }
    })
})

ipcMain.on('create-note', (e, heading, text) => {
    db.run(`insert into notes (heading, text) values ('${heading}', '${text}');`, (err) => {
        if (err) {
            console.log('app crashed when creating note with error:')
            throw err
        }
    })
    go_on_main()
})

app.on('window-all-closed', () => {
    app.quit()
})
