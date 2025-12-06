

//.....................
// SweetAlert Helpers ------------------------------------------------
function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message
    });
}

function showSuccess(message) {
    Swal.fire({
        icon: 'success',
        title: 'Success',
        text: message,
        timer: 1500,
        showConfirmButton: false
    });
}

// Database Loading ---------------------------------------------------
let currentEditingUserId = null;
let currentEditingFormId = null;

const database = {};

fetch('JS/db.json')
    .then(response => response.json())
    .then(jsonData => {
        if (!localStorage.getItem('db')) {
            localStorage.setItem('db', JSON.stringify(jsonData));
        }
        loadDatabase();
        renderUsers();
        renderForms();
    });

function loadDatabase() {
    const raw = localStorage.getItem('db');
    if (raw) Object.assign(database, JSON.parse(raw));
}

function saveDatabase() {
    localStorage.setItem('db', JSON.stringify(database));
}

// USERS SECTION -------------------------------------------------------
function renderUsers() {
    loadDatabase();
   const container = document.getElementById("users-container");
            container.innerHTML = "";

            database.users.forEach((user, index) => {
                container.innerHTML += `
                    <div class="col-lg-6">
                        <div class="user-card">
                            <div class="user-info">
                                <i class="fa-solid fa-user user-icon"></i>
                                <h3 class="user-name">${user.username}</h3>
                            </div>
                            <div>
                                <button class="btn btn-custom btn-edit" data-id="${user.id}">Edit</button>
                                <button class="btn btn-custom btn-delete" data-id="${user.id}">Delete</button>
                            </div>
                        </div>
                    </div>
                `;
            });
    }
    renderUsers();


function openAddUser() {
    document.getElementById('addUserModal').style.display = 'block';
}

function addUser(username, email, password, role) {
    const newUser = {
        id: database.users.length + 1,
        username,
        email,
        password,
        role
    };

    database.users.push(newUser);
    saveDatabase();
    renderUsers();
}






 //create form events

 