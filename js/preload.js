// Импортируем нужные модули
const {ipcRenderer: ipc} = require('electron')

console.log("Не вводите сюда ничего! Если кто-то попросил вас это сделать, то 11 шансов из 10 что вы стали жертвой мошенников! Ввод чего-либо сюда может нанести урон вашему компьютеру!")

window.addEventListener('init-for-profile-page', () => {
    if (document.getElementById('no-notes') !== undefined) {
        let links = document.querySelectorAll('ul>li>h4>a')
        links.forEach((item) => {
            item.addEventListener('click', function (e) {
                e.preventDefault()
                let id = this.lastElementChild.value
                ipc.send('view-note', id)
            })
        })
    }
    let new_note_button = document.getElementById('new_note_button')
    new_note_button.addEventListener('click', (e) => {
        e.preventDefault()
        ipc.send('new-note')
    })
})

window.addEventListener('init-for-note-page', () => {
    let id = document.getElementById('id-input').value
    let remove_button = document.getElementById('remove-button')
    let change_button = document.getElementById('change-button')
    let go_on_main_button = document.getElementById('go-on-main-button')
    remove_button.addEventListener('click', (e) => {
        e.preventDefault()
        ipc.send('remove-note', id)
    })
    change_button.addEventListener('click', (e) => {
        e.preventDefault()
        ipc.send('change-note', id)
    })
    go_on_main_button.addEventListener('click', (e) => {
        e.preventDefault()
        ipc.send('go-on-main')
    })
})

window.addEventListener('init-for-new-note-page', () => {
    console.log('new note')
    let form = document.getElementById('create-note-form')
    console.log(form)
    form.addEventListener('submit', (e) => {
        e.preventDefault()
        let data = new FormData(form)
        const heading = data.get('heading')
        const text = data.get('text')
        ipc.send('create-note', heading, text)
    })
    let cancel_button = document.getElementById('cancel-button')
    cancel_button.addEventListener('click', (e) => {
        e.preventDefault()
        ipc.send('go-on-main')
    })
})
