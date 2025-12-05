

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
    const table = document.getElementById('usersTable');
    table.innerHTML = '';

    database.users.forEach(user => {
        table.innerHTML += `
        <tr>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.password}</td>
            <td>${user.role}</td>
            <td><button onclick="openEditUser(${user.id})">Edit</button></td>
            <td><button onclick="deleteUser(${user.id})">Delete</button></td>
        </tr>`;
    });
}

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

function deleteUser(id) {
    database.users = database.users.filter(user => user.id !== id);
    saveDatabase();
    renderUsers();
    showSuccess("User deleted successfully");
}

function openEditUser(id) {
    const user = database.users.find(u => u.id === id);

    document.getElementById('editUsername').value = user.username;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editPassword').value = user.password;
    document.getElementById('editRole').value = user.role;

    currentEditingUserId = id;
    document.getElementById('editUserModal').style.display = 'block';
}

function saveEditingUser() {
    const user = database.users.find(u => u.id === currentEditingUserId);

    user.username = document.getElementById('editUsername').value;
    user.email = document.getElementById('editEmail').value;
    user.password = document.getElementById('editPassword').value;
    user.role = document.getElementById('editRole').value;

    saveDatabase();
    renderUsers();

    document.getElementById('editUserModal').style.display = 'none';
    showSuccess("User updated successfully");
}

// FORMS SECTION -------------------------------------------------------
function renderForms() {
    loadDatabase();
    const table = document.getElementById('formsTable');
    table.innerHTML = '';

    database.forms.forEach(form => {
        table.innerHTML += `
         <div class="form-card">
            <div class="form-left">
                <h2>#1 &nbsp; ${form.title}</h2><br>
                <div class="all-buttons">
                    <button class="btn btn-edit btn-sm me-2 ">Edit</button>
                    <button class="btn btn-scores btn-sm me-2">Scores</button>
                    <button class="btn btn-delete btn-sm me-2" onclick="deleteForm(${form.id});">Delete</button>

                    <select class="form-select d-inline-block w-auto btn-sm" onchange="changeFormStatus(${form.id}, this.value)">
                        <option value="active" ${form.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="inactive" ${form.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
            </div>

            <div class="text-end">
                <div>${form.questions.length} Questions</div>
                <div class="mt-1 status" id="status-${form.id}">
                    <i class="bi bi-check-circle-fill"></i> ${form.status}
                </div>
            </div>
        </div>`;

        
        const statusElement = document.getElementById(`status-${form.id}`);
        if (form.status === "active") {
            statusElement.classList.add('status-active');
            statusElement.classList.remove('status-inactive');
        } else {
            statusElement.classList.add('status-inactive');
            statusElement.classList.remove('status-active');
        }
    });
}

renderForms();
function changeFormStatus(formId, newStatus) {
    const form = database.forms.find(f => f.id === formId);
    if (!form) return;

    form.status = newStatus;
    saveDatabase();
    renderForms(); // re-render to update the card style

    showSuccess(`Form status changed to ${newStatus}`);
}


function openAddForm() {
    document.getElementById('addFormModal').style.display = 'block';
}

function addForm() {
    const title = document.getElementById('formTitle').value;
    const description = document.getElementById('formDescription').value;
    const status = document.getElementById('formStatus').value;

    const now = new Date();
    const createdAt = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

    const newForm = {
        id: database.forms.length + 1,
        title,
        description,
        status,
        createdAt,
        questionsNumber: 0,
        questions: []
    };

    database.forms.push(newForm);
    saveDatabase();
    renderForms();

    document.getElementById('addFormModal').style.display = 'none';
    showSuccess("Form added successfully!");
}

function openEditForm(id) {
    const form = database.forms.find(f => f.id === id);

    document.getElementById('editFormTitle').value = form.title;
    document.getElementById('editFormDescription').value = form.description;
    document.getElementById('editFormStatus').value = form.status;

    currentEditingFormId = id;
    document.getElementById('editFormModal').style.display = 'block';
}

function saveEditingForm() {
    const form = database.forms.find(f => f.id === currentEditingFormId);

    form.title = document.getElementById('editFormTitle').value;
    form.description = document.getElementById('editFormDescription').value;
    form.status = document.getElementById('editFormStatus').value;

    saveDatabase();
    renderForms();

    document.getElementById('editFormModal').style.display = 'none';
    showSuccess("Form updated successfully!");
}

function toggleFormStatus(id) {
    const form = database.forms.find(f => f.id === id);

    form.status = form.status === "active" ? "inactive" : "active";

    saveDatabase();
    renderForms();

    showSuccess("Status changed");
}

function deleteForm(id) {
      Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to permanently delete this form?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
           database.forms = database.forms.filter(f => f.id !== id);
    saveDatabase();
    renderForms();
    showSuccess("Form deleted successfully!");
        }
    });

   
}

// QUESTIONS SECTION ---------------------------------------------------
function renderQuestions() {
    const table = document.getElementById('questionsTable');
    const form = database.forms.find(f => f.id === currentEditingFormId);

    table.innerHTML = '';

    form.questions.forEach(q => {
        table.innerHTML += `
        <tr>
            <td>${q.text}</td>
            <td>${q.type}</td>
            <td>${q.options ? q.options.join(", ") : ""}</td>
            <td><button>Edit</button></td>
            <td><button onclick="deleteQuestion(${q.id})">Delete</button></td>
        </tr>`;
    });
}

function openAddQuestion() {
    document.getElementById('addQuestionModal').style.display = 'block';

}

function deleteQuestion(id) {
    const form = database.forms.find(f => f.id === currentEditingFormId);

    form.questions = form.questions.filter(q => q.id !== id);
    form.questionsNumber = form.questions.length;

    saveDatabase();
    renderQuestions();

    showSuccess("Question deleted successfully!");
}

 //create form events
 document.getElementById("saveFormBtn").addEventListener('click',(e)=>{
addForm();

 })


 