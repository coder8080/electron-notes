// Получаем зависимости
const {app, BrowserWindow, ipcMain} = require('electron')
const ejs = require('ejs-electron')
const path = require('path')
const sqlite = require('sqlite3')
const fs = require('fs')
const fetch = require('node-fetch')
let exists = false
let db
if (fs.existsSync('notes_db.sqlite3'))
{
    exists = true
    db = new sqlite.Database('notes_db.sqlite3')
}

// Объявляем переменную окна
let win

/* Функция создания окна */
function createWindow() {
    // Задаём значение переменной
    win = new BrowserWindow({
        width: 600,
        height: 400,
        minHeight: 400,
        minWidth: 600,
        center: true,
        webPreferences: {
            preload: path.join(__dirname, 'js', 'preload.js')
        },
        icon: path.join(__dirname, 'build', 'icon.png')
    })
    go_on_main()
    win.removeMenu()
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
        db.get(`select value from theme where id = 1;`, (err, data) => {
            if (err) {
                console.log('error when getting theme')
                throw err
            }
            ejs.data('theme', data.value)
            win.loadFile(path.join(__dirname, 'pages/profile.ejs')).then(err => {
                if (err) {
                    console.log('app crashed when showing first page with error:')
                    throw err
                }
            })
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

if (exists)
{
    app.whenReady().then(() => {
        createWindow()
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
}
else {
    fs.writeFileSync('notes_db.sqlite3', '')
    db = new sqlite.Database('notes_db.sqlite3')
    db.run('create table notes (id integer primary key, heading text, text text);', (err) => {
        if (err) {
            throw err
        }
        db.run('create table theme (id integer primary key, value varchar(10));', err => {
            if (err) {
                throw err
            }
            db.run(`insert into theme (value) values ('light');`, err => {
                if (err) {
                    throw err
                }

                exists = true
                app.whenReady().then(() => {
                    createWindow()
                    if (BrowserWindow.getAllWindows().length === 0) {
                        createWindow()
                    }
                })
            })
        })
    })
}

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

/* Синхронизация */
ipcMain.on('sync', (e, address, login, password, type) => {
    // Получаем записи из базы данных
    db.all('select heading, text from notes;', (err, data) => {
        if (err) {
            console.log('app crashed when getting notes to sync')
            throw err
        }
        // Отправляем запрос
        fetch(`${address}/sync`, {
            method: 'POST',
            body: JSON.stringify({"login": login, "password": password, "notes": data, "type": type}),
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
        }).catch(() => {
            e.returnValue = 'no server'
        }).then((data) => {
            // Добавление в базу данных полученных записей
            if (data) {
                data = JSON.parse(data).notes
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

/* Смена темы */
ipcMain.on('change-theme', (e, theme) => {
    db.run(`update theme set value = '${theme}' where id = 1;`, (err) => {
        if (err) {
            throw err
        }
        go_on_main()
    })
})

app.on('window-all-closed', () => {
    app.quit()
})
