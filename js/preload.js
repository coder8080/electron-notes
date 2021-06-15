// Импортируем нужные модули
const {ipcRenderer: ipc} = require('electron')
let items_counter = 1
// Уведомляем пользователя об опасности
console.log("Не вводите сюда ничего! Если кто-то попросил вас это сделать, то 11 шансов из 10 что вы стали жертвой мошенников! Ввод чего-либо сюда может нанести урон вашему компьютеру!")

function init_add_item_button() {
    const add_item_button = document.getElementById('add-item-button')
    if (add_item_button) {
        add_item_button.addEventListener('click', (e) => {
            e.preventDefault()
            let div = document.createElement('li')
            div.classList.add('collection-item')
            items_counter += 1
            div.id = `item-${items_counter}`
            div.innerHTML = `
                <div class="textarea-field">
                    <textarea id="textarea-${items_counter}" class="item-textarea"></textarea>
                </div>
                <div class="remove-button-field">
                    <div class="rounded-btn" onclick="remove_item('item-${items_counter}')" type="button">
                        <i class="material-icons left">remove</i>
                    </div>
                </div>
            `
            const items = document.getElementById('items')
            items.append(div)
        })
    }
}

window.addEventListener('init-for-profile-page', () => {
    if (document.getElementById('no-notes') !== undefined) {
        let read_links = document.querySelectorAll('div.card-action>a.read')
        let change_links = document.querySelectorAll('div.card-action>a.change')
        read_links.forEach((item) => {
            item.addEventListener('click', function (e) {
                e.preventDefault()
                let id = this.lastElementChild.value
                ipc.send('view-note', id)
            })
        })
        change_links.forEach((item) => {
            item.addEventListener('click', function (e) {
                e.preventDefault()
                let id = this.lastElementChild.value
                ipc.send('go-on-change-note-page', id)
            })
        })
    }
    const new_note_button = document.getElementById('new_note_button')
    const sync_button = document.getElementById('sync-button')
    const theme_form = document.getElementById('theme_form')
    const menu_button = document.getElementById('menu-button')
    const menu = document.getElementById('menu')
    new_note_button.addEventListener('click', (e) => {
        e.preventDefault()
        ipc.send('new-note')
    })
    sync_button.addEventListener('click', (e) => {
        e.preventDefault()
        ipc.send('go-on-sync-page')
    })
    theme_form.addEventListener('change', function () {
        const data = new FormData(this)
        const theme = data.get('theme')
        ipc.send('change-theme', theme)
    })
    menu_button.addEventListener('click', (e) => {
        e.preventDefault()
        const menu = document.getElementById('menu')
        let dimming_div = document.createElement('div')
        dimming_div.id = 'dimming'
        document.body.appendChild(dimming_div)
        dimming_div.onclick = function () {
            menu.style.animation = 'menu-in 0.3s forwards'
            this.remove()
        }
        menu.style.animation = 'menu-out 0.3s forwards'
    })
})

window.addEventListener('init-for-note-page', () => {
    const id = document.getElementById('id-input').value
    let remove_buttons = document.querySelectorAll('.remove-button')
    let change_buttons = document.querySelectorAll('.change-button')
    let go_on_main_buttons = document.querySelectorAll('.go-on-main-button')
    for (const button of remove_buttons) {
        button.addEventListener('click', (e) => {
            e.preventDefault()
            ipc.send('remove-note', id)
        })
    }
    for (const button of change_buttons) {
        button.addEventListener('click', (e) => {
            e.preventDefault()
            ipc.send('go-on-change-note-page', id)
        })
    }
    for (const button of go_on_main_buttons) {
        button.addEventListener('click', (e) => {
            e.preventDefault()
            ipc.send('go-on-main')
        })
    }
})

window.addEventListener('init-for-new-note-page', () => {
    items_counter = 1
    const form = document.getElementById('create-note-form')
    const submit_button = document.getElementById('submit')
    submit_button.addEventListener('click', function (e) {
        e.preventDefault()
        const data = new FormData(form)
        const heading = data.get('heading')
        const type = data.get('type')
        if (type === 'text') {
            const text = data.get('text')
            ipc.send('create-note', heading, type, text)
        } else if (type === 'list') {
            let items = []
            for (let i = 1; i <= items_counter; i++) {
                let textarea = document.getElementById(`textarea-${i}`)
                if (textarea) {
                    if (textarea.value !== '') {
                        items.push(textarea.value)
                    }
                }
            }
            let json = JSON.stringify({"items": items})
            ipc.send('create-note', heading, type, json)
        }
    })
    const cancel_button = document.getElementById('cancel-button')
    cancel_button.addEventListener('click', (e) => {
        e.preventDefault()
        ipc.send('go-on-main')
    })
    const type_inputs = document.querySelectorAll('input[name="type"]')
    for (let input of type_inputs) {
        input.addEventListener('click', function () {
            if (this.value === 'text') {
                document.getElementById('text-field').style.display = 'block'
                document.getElementById('list-field').style.display = 'none'
            } else if (this.value === 'list') {
                document.getElementById('text-field').style.display = 'none'
                document.getElementById('list-field').style.display = 'block'
            }
        })
    }
    init_add_item_button()
})

window.addEventListener('init-for-change-note-page', () => {
    try {
        items_counter = Number(document.querySelector('input[name="counter"]').value)
    } catch {
    }
    const id = document.getElementById('id-input').value
    const form = document.getElementById('change-note-form')
    const cancel_button = document.getElementById('cancel-button')
    const submit_button = document.getElementById('submit')
    submit_button.addEventListener('click', function (e) {
        e.preventDefault()
        const data = new FormData(form)
        const heading = data.get('heading')
        const type = data.get('type')

        if (type === 'text') {
            const text = data.get('text')
            ipc.send('change-note', id, heading, type, text)
        } else if (type === 'list') {
            let items = []
            for (let i = 1; i <= items_counter; i++) {
                let textarea = document.getElementById(`textarea-${i}`)
                if (textarea) {
                    if (textarea.value !== '') {
                        items.push(textarea.value)
                    }
                }
            }
            let json = JSON.stringify({"items": items})
            ipc.send('change-note', id, heading, type, json)
        } else {
            alert('error! cant get type!')
        }
    })
    cancel_button.addEventListener('click', (e) => {
        e.preventDefault()
        ipc.send('view-note', id)
    })
    init_add_item_button()
})

window.addEventListener('init-for-sync-page', () => {
    const form = document.getElementById('sync-form')
    const cancel_button = document.getElementById('cancel-button')
    const submit_button = document.getElementById('submit')
    submit_button.addEventListener('click', function (e) {
        e.preventDefault()
        const form_data = new FormData(form)
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
        } else if (status === 'no server') {
            alert('Не удалось подключиться к серверу: отсутствует подключение к интернету или адрес сервера указан неверно.')
        } else if (status === 'required') {
            alert('Необходимо заполнить все поля.')
        }
    })
    cancel_button.addEventListener('click', (e) => {
        e.preventDefault()
        ipc.send('go-on-main')
    })
})
