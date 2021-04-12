/* Заметки на electron js. Похожим проектом является express-notes(принадлежащий мне же(я coder8080)).
В будущем планируется возможность синхронизации приложения и сервера */

// Получаем зависимости
const {app, BrowserWindow, ipcMain} = require('electron')
const ejs = require('ejs-electron')
const path = require('path')
const sqlite = require('sqlite3')
const db = new sqlite.Database('db.sqlite3')
const fetch = require('node-fetch')

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
    go_on_main()
    win.removeMenu()
    // win.openDevTools()
}

/* Функция переадресации на главную страницу */
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

/**
 * Переадресация на страницу записи
 * @param {number} id - номер записи, на страницу которой нужно перейти
 * */
function go_on_note_page(id) {
    // Выполняем запрос к базе данных
    db.get(`select * from notes where id = ${id};`, (err, data) => {
        // Обрабатываем ошибку
        if (err) {
            console.log('app crashed when getting information from database with error:')
            throw err
        }
        if (data) {
            // Отправляем пользователю страницу
            ejs.data('note', data)
            win.loadFile(path.join(__dirname, 'pages/note.ejs')).then(err => {
                if (err) {
                    console.log('app crashed when showing first page with error:')
                    throw err
                }
            })
        } else {
            console.log('error: no note with this id')
        }
    })
}

// Открываем окно
app.whenReady().then(() => {
    createWindow()
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

ipcMain.on('view-note', (e, id) => {
    go_on_note_page(id)
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
        go_on_main()
    })
})

ipcMain.on('go-on-change-note-page', (e, id) => {
    db.get(`select * from notes where id = ${id};`, (err, data) => {
        if (err) {
            console.log('app crashed when getting info about note from db with error:')
            throw err
        }
        ejs.data('note', data)
        win.loadFile(path.join(__dirname, 'pages', 'change-note.ejs')).then(err => {
            if (err) {
                console.log('app crashed when showing new note page with error:')
                throw err
            }
        })
    })
})

ipcMain.on('change-note', (e, id, heading, text) => {
    db.run(`update notes set heading = '${heading}', text = '${text}' where id = ${id};`, (err) => {
        if (err) {
            console.log('app crashed when updating info in database with error:')
            throw err
        }
        go_on_note_page(id)
    })
})

ipcMain.on('go-on-sync-page', () => {
    win.loadFile(path.join(__dirname, 'pages', 'sync.ejs')).then((err) => {
        if (err) {
            console.log('app crashed when showing sync page with error:')
            throw err
        }
    })
})

ipcMain.on('sync', (e, address, login, password, type) => {
    db.all('select heading, text from notes;', (err, data) => {
        if (err) {
            console.log('app crashed when getting notes to sync')
            throw err
        }
        if (data.length === 1) {
            data = [data]
        }
        data.forEach((item, index) => {
            data[index] = JSON.stringify(item)
        })
        const notes_text = data.join(';')
        fetch(`${address}/sync`, {
            method: 'POST',
            body: JSON.stringify({"login": login, "password": password, "notes": notes_text, "type": type}),
            headers: {"Content-Type": "application/json"}
        }).then(response => {
            if (response.ok) {
                if (response.status === 200) {
                    e.returnValue = 'success'
                    if (type === 'hard-download' || type === 'download' || type === 'upload-and-download') {
                        return response.text()
                    }
                } else if (response.status === 201) {
                    e.returnValue = 'incorrect password'
                } else if (response.status === 202) {
                    e.returnValue = 'no user'
                }
            } else {
                console.log('Ошибка при синхронизации')
            }
        }).then((data) => {
            if (data) {
                data = data.split(';')
                for (let i = 0; i < data.length; i++) {
                    data[i] = JSON.parse(data[i])
                }
                if (type === 'hard-download') {
                    db.run(`delete from notes`, (err) => {
                        if (err) {
                            console.log('error when clearing db')
                            throw err
                        }
                        for (const note of data) {
                            db.run(`insert into notes (heading, text) values ('${note.heading}', '${note.text}')`)
                        }
                    })
                }
                if (type === 'download' || type === 'upload-and-download') {
                    for (const note of data) {
                        db.run(`insert into notes (heading, text) values ('${note.heading}', '${note.text}')`)
                    }
                }
            }
        })
    })
})

app.on('window-all-closed', () => {
    app.quit()
})
