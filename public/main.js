const socket = io();

let username = '';
let userList = [];

let loginPage = document.querySelector('#login-page');
let chatPage = document.querySelector('#chat-page');
let loginInput = document.querySelector('#login-name-input');
let textInput = document.querySelector('#chat-text-input');

loginPage.style.display = 'flex';
chatPage.style.display = 'none';

loginInput.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) { //Pressed enter key
        let name = loginInput.value.trim();

        if (name !== '') {
            username = name;
            document.title = `Chat (${username})`;

            socket.emit('join-request', username);
        }
    }
});

textInput.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        let text = textInput.value.trim();
        textInput.value = '';

        if (text != '') {
            addMessage('msg', username, text);
            socket.emit('send-msg', text);
        }
    }
});

function renderUserList() {
    let ul = document.querySelector('.user-list');
    ul.innerHTML = '';

    userList.forEach(i => {
        ul.innerHTML += `<li>${i}</li>`;
    });
}

function addMessage(type, user, msg) {
    let ul = document.querySelector('.chat-list');

    switch (type) {
        case 'status':
            ul.innerHTML += `<li class="m-status">${msg}</li>`;
            break;
        case 'msg':
            if (username == user) {
                ul.innerHTML += `<li class="m-txt"><span class="me">${user}</span> ${msg}</li>`;
            } else {
                ul.innerHTML += `<li class="m-txt"><span>${user}</span> ${msg}</li>`;
            }
    
            break;
    }

    ul.scrollTop = ul.scrollHeight;
}

socket.on('user-ok', (list) => {
    loginPage.style.display = 'none';
    chatPage.style.display = 'flex';
    textInput.focus();

    addMessage('status', null, 'Connected!');

    userList = list;
    renderUserList();
});

socket.on('list-update', (data) => {
    if (data.joined) {
        addMessage('status', null, `${data.joined} joined the chat.`);
    }

    if (data.left) {
        addMessage('status', null, `${data.left} left the chat.`);
    }

    userList = data.list;
    renderUserList();
});

socket.on('show-msg', (data) => {
    addMessage('msg', data.username, data.message);
});

socket.on('disconnect', () => { //Some problem with the connection
    addMessage('status', null, 'You have been disconnected');
    userList = [];
    renderUserList();
});

socket.on('reconnect_error', () => {
    addMessage('status', null, 'Trying to reconnect');
});

socket.on('reconnect', () => {
    addMessage('status', null, 'Reconnected');

    if (username != '') {
        socket.emit('join-request', username);
    }
});