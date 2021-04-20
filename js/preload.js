// Импортируем нужные модули
const {ipcRenderer: ipc} = require('electron')

// Уведомляем пользователя об опасности
console.log("Не вводите сюда ничего! Если кто-то попросил вас это сделать, то 11 шансов из 10 что вы стали жертвой мошенников! Ввод чего-либо сюда может нанести урон вашему компьютеру!")

window.addEventListener('init-for-profile-page', () => {
    if (document.getElementById('no-notes') !== undefined) {
        let links = document.querySelectorAll('div.card-action>a')
        links.forEach((item) => {
            item.addEventListener('click', function (e) {
                e.preventDefault()
                let id = this.lastElementChild.value
                ipc.send('view-note', id)
            })
        })
    }
    const new_note_button = document.getElementById('new_note_button')
    const sync_button = document.getElementById('sync-button')
    const change_theme_button = document.getElementById('change-theme-button')
    new_note_button.addEventListener('click', (e) => {
        e.preventDefault()
        ipc.send('new-note')
    })
    sync_button.addEventListener('click', (e) => {
        e.preventDefault()
        ipc.send('go-on-sync-page')
    })
    change_theme_button.addEventListener('click', (e) => {
        e.preventDefault()
        ipc.send('change-theme')
    })
})

window.addEventListener('init-for-note-page', () => {
    const id = document.getElementById('id-input').value
    let remove_button = document.getElementById('remove-button')
    let change_button = document.getElementById('change-button')
    let go_on_main_button = document.getElementById('go-on-main-button')
    remove_button.addEventListener('click', (e) => {
        e.preventDefault()
        ipc.send('remove-note', id)
    })
    change_button.addEventListener('click', (e) => {
        e.preventDefault()
        ipc.send('go-on-change-note-page', id)
    })
    go_on_main_button.addEventListener('click', (e) => {
        e.preventDefault()
        ipc.send('go-on-main')
    })
})

window.addEventListener('init-for-new-note-page', () => {
    const form = document.getElementById('create-note-form')
    form.addEventListener('submit', function (e) {
        e.preventDefault()
        const data = new FormData(this)
        const heading = data.get('heading')
        const text = data.get('text')
        if (text.search('%*%') === -1) {
            ipc.send('create-note', heading, text)
        }
        else {
            alert('Заметка не может содержать набор символов %*%. Удалите его, а затем повторите попытку.')
        }
    })
    let cancel_button = document.getElementById('cancel-button')
    cancel_button.addEventListener('click', (e) => {
        e.preventDefault()
        ipc.send('go-on-main')
    })
})

window.addEventListener('init-for-change-note-page', () => {
    const id = document.getElementById('id-input').value
    const form = document.getElementById('change-note-form')
    const cancel_button = document.getElementById('cancel-button')
    form.addEventListener('submit', function (e) {
        e.preventDefault()
        const data = new FormData(this)
        const heading = data.get('heading')
        const text = data.get('text')
        if (text.search('%*%') === -1) {
            ipc.send('change-note', id, heading, text)
        }
        else {
            alert('Заметка не может содержать набор символов %*%. Удалите его, а затем повторите попытку.')
        }
    })
    cancel_button.addEventListener('click', (e) => {
        e.preventDefault()
        ipc.send('view-note', id)
    })
})

window.addEventListener('init-for-sync-page', () => {
    const form = document.getElementById('sync-form')
    const cancel_button = document.getElementById('cancel-button')
    form.addEventListener('submit', function (e) {
        e.preventDefault()
        const form_data = new FormData(this)
        const address = form_data.get('address')
        const login = form_data.get('login')
        const password = form_data.get('password')
        const type = form_data.get('type')
        status = ipc.sendSync('sync', address, login, password, type)
        if (status === 'success') {
            alert('Успешно синхронизировано')
            ipc.send('go-on-main')
        } else if (status === 'incorrect password') {
            alert("Неверный пароль")
        } else if (status === 'no user') {
            alert('Нет пользователя с таким логином')
        }
        else if (status === 'no server') {
            alert('Не удалось подключиться к серверу: отсутствует подключение к интернету или адрес сервера указан неверно.')
        }
    })
    cancel_button.addEventListener('click', (e) => {
        e.preventDefault()
        ipc.send('go-on-main')
    })
})
