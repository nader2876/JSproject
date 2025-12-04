
//load database
let currentEditingUserId = null;
let currentEditingUserFormId = null;
const database = {};
fetch('db.json')
  .then(response => response.json())
  .then(jsonData => {
   
     localStorage.setItem('db', JSON.stringify(jsonData));
     loadDatabase();
     renderUsers();
  })
function loadDatabase() {
  const raw = localStorage.getItem('db');
  if(raw) Object.assign(database, JSON.parse(raw));
}
console.log(database);
//save database
function saveDatabase() {
    
  localStorage.setItem('db', JSON.stringify(database));
}
// users management
function renderUsers() {
    loadDatabase();
  const usersTable = document.getElementById('usersTable');
  usersTable.innerHTML = '';
  database.users.forEach(element => {
    usersTable.innerHTML += `
      <tr>
      
        <td>${element.username}</td>
        <td>${element.email}</td>
        <td>${element.password}</td>
        <td>${element.role}</td>
        <button> edit </button>
        <button > delete </button>
      </tr>
    `;
  });}
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
  addUser('admin', 'na', 'admin', 'admin');
  function deleteUser(id) {
    database.users = database.users.filter(user => user.id !== id);
    saveDatabase();
    renderUsers();
        alert("The user was deleted successfully!");
  }
  function openEditUser(id) {
    const user = database.users.find(user => user.id === id);
    document.getElementById('editUsername').value = user.username;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editPassword').value = user.password;
    document.getElementById('editRole').value = user.role;
    document.getElementById('editUserModal').style.display = 'block';
     
currentEditingUserId = id;



  }
    function saveEditingUser() {
const user = database.users.find(user => user.id === currentEditingUserId);
const newUsername = document.getElementById('editUsername').value;
const newEmail = document.getElementById('editEmail').value;
const newPassword = document.getElementById('editPassword').value;
const newRole = document.getElementById('editRole').value;
user.username = newUsername;
user.email = newEmail;
user.password = newPassword;
user.role = newRole;
document.getElementById('editUserModal').style.display = 'none';
saveDatabase();
renderUsers();
alert("User details updated successfully!");


    }
    // manage forms
    function renderForms() {

loadDatabase();
  const usersTable = document.getElementById('formsTable');
  usersTable.innerHTML = '';
  database.forms.forEach(element => {
    usersTable.innerHTML += `
      <tr>
      
        <td>${element.title}</td>
        <td>${element.description}</td>
        <td>${element.status}</td>
        <td>${element.createdAt}</td>
         <td>${element.questionsNumber}</td>

        <button> edit </button>
        <button > delete </button>
      </tr>
    `;
  });

    }
  
    function deleteForm(id) {
      database.forms = database.forms.filter(form => form.id !== id);
      saveDatabase();
      renderForms();
          alert("The form was deleted successfully!"); 
    }

    function openAddForm() {
     
        document.getElementById('addFormModal').style.display = 'block';
    }

        function addForm() {
            let title= document.getElementById('formTitle').value;
            let description= document.getElementById('formDescription').value;
            let status= "inactive";
            const now = new Date();
let createdAt = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
            let questionsNumber= 0;
      const newForm = {
        id: database.forms.length + 1,
        title,
        description,
        status,
        createdAt,
        questionsNumber};
        database.forms.push(newForm);
        saveDatabase();
        renderForms();
        document.getElementById('addFormModal').style.display = 'none';
            alert("Form added successfully!"); 

      }

      function openEditForm(id) {
        
        document.getElementById('editFormModal').style.display = 'block';
        currentEditingFormId = id;
    }
        function saveEditingForm() {
   const form = database.forms.find(f => f.id === currentEditingFormId);
    form.title = document.getElementById('editFormTitle').value;
    form.description = document.getElementById('editFormDescription').value;
    form.status = document.getElementById('editFormStatus').value;

    document.getElementById('editFormModal').style.display = 'none';
    saveDatabase();
    renderForms();
    alert("Form details updated successfully!");
    }
        