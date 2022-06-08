const ipcRenderer = require('electron').ipcRenderer;

function addItemFromForm(event) {
    event.preventDefault() // stop the form from submitting
    const form = document.getElementById('addItemForm');
    const title = document.getElementById("title"); 
    const location = document.getElementById("location");

    const item = {
        title: title.value,
        location: location.value
    };
    ipcRenderer.send('items:add', item);
    form.reset();
    title.focus();
}