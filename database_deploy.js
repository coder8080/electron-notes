/* Этот скрипт автоматически создаст базу данных и таблицу в ней */

const sqlite = require('sqlite3')
const fs = require('fs')
const path = require('path')

fs.writeFileSync(path.join(__dirname, 'db.sqlite3'), '')

const db = new sqlite.Database(path.join(__dirname, 'db.sqlite3'))
db.run('create table notes (id integer primary key, heading text, text text);', (err) => {
    if (err) {
        console.log('Не удалось создать базу данных. Ошибка:')
        throw err
    }
    db.run('create table theme (id integer primary key, value varchar(10));', err => {
        if (err) {
            console.log('Не удалось создать базу данных. Ошибка:')
            throw err
        }
        db.run(`insert into theme (value) values ('light');`, err => {
            if (err) {
                console.log('Не удалось настроить тему. Ошибка:')
                throw err
            }
            console.log('База данных успешно создана и настроена.')
        })
    })
})
