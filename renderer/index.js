const ipcRenderer = require('electron').ipcRenderer;

ipcRenderer.send('pageload');

ipcRenderer.on('pageload:reply', function (event, items) {
    renderItemsTable(items);
})

ipcRenderer.on('items:delete:reply', function (event, id) {
    const deleteBtn = document.getElementById('delete:' + id);
    const row = deleteBtn.parentNode.parentNode;
    const tableBody = document.getElementById('allItemsBody');

    tableBody.removeChild(row);
})

function renderItemsTable(array) {
    const tableBody = document.getElementById('allItemsBody');
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < array.length; i++) {
        const element = array[i];
        const row = document.createElement('tr');
        const title = document.createElement('td');
        const location = document.createElement('td');
        const actions = document.createElement('td');
        const deleteBtn = document.createElement('button');

        title.innerHTML = element.title;
        location.innerHTML = element.location;
        deleteBtn.innerHTML = 'Remove'
        deleteBtn.id = 'delete:' + element._id
        deleteBtn.classList.add('deleteBtn');
        deleteBtn.addEventListener('click', function () {
            removeItem(element._id);
        });
        actions.appendChild(deleteBtn);

        row.appendChild(title);
        row.appendChild(location);
        row.appendChild(actions);

        fragment.appendChild(row);
    }
    tableBody.appendChild(fragment);
}

function removeItem(id) {
    ipcRenderer.send('items:delete', id);
}

function sortTable(index) {
    const table = document.getElementById("allItemsBody");
    let i, shouldSwitch, switchcount = 0;
    let switching = true;
    let dir = "asc";
    while (switching) {
        switching = false;
        const rows = table.rows;
        for (i = 0; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            const x = rows[i].getElementsByTagName("td")[index];
            const y = rows[i + 1].getElementsByTagName("td")[index];
            
            if (dir === "asc") {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            } else if (dir === "desc") {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount++;
        } else {
            if (switchcount === 0 && dir === "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}

function search() {
    const tableBody = document.getElementById('allItemsBody');
    const input = document.getElementById("searchInput");
    const filter = input.value.toLowerCase();
    const rows = tableBody.getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {
        const tds = rows[i].getElementsByTagName("td");
        let matched = false;
        for (let j = 0; j < tds.length; j++) {
            const td = tds[j];
            if (td.cellIndex === 2) { continue; }
            if (td.innerHTML.toLowerCase().indexOf(filter) > -1) {
                matched = true;
                break;
            }
        }

        const display = matched ? '' : 'none';
        rows[i].style.display = display;
    }
}
