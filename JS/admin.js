

// ============ Main Form Builder Script ============

// ELEMENTS
const qText = document.getElementById("questionText");
const previewText = document.getElementById("previewText");
const qType = document.getElementById("questionType");
const requiredSwitch = document.getElementById("requiredSwitch");
const boldCheck = document.getElementById("boldCheck");
const italicCheck = document.getElementById("italicCheck");
const fontSelect = document.getElementById("fontSelect");
const addOptionBtn = document.getElementById("addOptionBtn");
const optionsContainer = document.getElementById("optionsContainer");
const previewAnswer = document.getElementById("previewAnswer");
const addQuestionBtn = document.getElementById("addQuestionToFormBtn");
const questionsList = document.getElementById("questionsList");
const correctAnswerInput = document.getElementById("correctAnswerInput");
const correctAnswerWrapper = document.getElementById("correctAnswerWrapper");
const saveFormBtn = document.getElementById("saveFormBtn");

// State
let styleSettings = { bold: false, italic: false, font: "Arial" };
let optionCount = 0;
let currentFormQuestions = []; // Store questions for current form being built
const MAX_OPTIONS = 4;
const CORRECT_ANSWER_NAME = "correct_answer_selector";

// Helper: apply styles to element
function applyStyles(el) {
    el.style.fontWeight = styleSettings.bold ? "bold" : "normal";
    el.style.fontStyle = styleSettings.italic ? "italic" : "normal";
    el.style.fontFamily = styleSettings.font;
}

// Update preview layout & controls
function updatePreview() {
    // Preview text
    previewText.textContent = qText.value || "Question will appear here";
    applyStyles(previewText);

    // Show/hide Short Text correct answer input
    if (qType.value === "Short Text") {
        correctAnswerWrapper.style.display = "block";
        addOptionBtn.style.display = "none";
        optionsContainer.innerHTML = "";
        optionCount = 0;
    } else {
        correctAnswerWrapper.style.display = "none";
    }

    // Show Add Option button only for Multiple Choice or Dropdown List
    if (qType.value === "Multiple Choice" || qType.value === "Dropdown List") {
        addOptionBtn.style.display = "inline-block";
        
        const currentControl = optionsContainer.querySelector('input[type="radio"], input[type="checkbox"]');
        if (currentControl && qType.value === "Multiple Choice" && currentControl.type !== "radio") {
            optionsContainer.innerHTML = "";
            optionCount = 0;
        } else if (currentControl && qType.value === "Dropdown List" && currentControl.type !== "checkbox") {
            optionsContainer.innerHTML = "";
            optionCount = 0;
        }
    } else {
        addOptionBtn.style.display = "none";
    }
}

// Add option row
function addOptionRow() {
    if (optionCount >= MAX_OPTIONS) return;
    optionCount++;

    const row = document.createElement("div");
    row.className = "d-flex align-items-center gap-2 mt-2 option-row";
    row.dataset.optionId = optionCount;

    const control = document.createElement("input");
    control.className = "correct-answer-control";
    control.type = "radio";
    control.name = CORRECT_ANSWER_NAME;

    const txt = document.createElement("input");
    txt.type = "text";
    txt.className = "form-control option-text-input";
    txt.placeholder = `Option ${optionCount}`;
    txt.style.maxWidth = "50%";

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn btn-sm btn-danger ms-2";
    delBtn.textContent = "X";
    delBtn.addEventListener("click", () => {
        row.remove();
        optionCount--;
    });

    const label = document.createElement("small");
    label.textContent = "Correct";
    label.className = "text-success fw-bold me-2";

    row.appendChild(control);
    row.appendChild(label);
    row.appendChild(txt);
    row.appendChild(delBtn);
    optionsContainer.appendChild(row);
}

// Build question object from current preview
function buildQuestionObject() {
    const type = qType.value;
    const questionText = qText.value.trim();
    const isRequired = requiredSwitch.checked;
    const correctAnswer = type === "Short Text" ? correctAnswerInput.value.trim() : "";
    let options = [];

    if (type === "Multiple Choice" || type === "Dropdown List") {
        const optionElements = optionsContainer.querySelectorAll(".option-row");
        optionElements.forEach((row, idx) => {
            const textInput = row.querySelector('.option-text-input');
            const isCorrect = row.querySelector('.correct-answer-control').checked;
            
            const optionValue = textInput.value.trim() || `Option ${idx + 1}`;
            
            // Store both the text and whether it's correct
            options.push({
                text: optionValue,
                correct: isCorrect
            });
        });
    }

    return {
        id: currentFormQuestions.length + 1,
        text: questionText,
        type: type,
        required: isRequired,
        correctAnswer: correctAnswer,
        options: options,
        styles: { ...styleSettings }
    };
}

// Add question to form
function addQuestionToForm() {
    // Validation
    if (!qText.value.trim()) {
    showError("Please enter the question text.");
    return;
}

if (qType.value === "Short Text" && !correctAnswerInput.value.trim()) {
    showError("Please enter the correct answer for the Short Text question.");
    return;
}

if (qType.value !== "Short Text") {
    const rows = optionsContainer.querySelectorAll(".option-row");
    const isCorrectSelected = optionsContainer.querySelector('.correct-answer-control:checked');

    if (rows.length === 0) {
        showError("Please add at least one option.");
        return;
    }
    if (!isCorrectSelected) {
        showError("Please select the correct option.");
        return;
    }

    }

    // Create question object
    const questionObj = buildQuestionObject();
    currentFormQuestions.push(questionObj);
    
    // Create visual card for display
    const card = document.createElement("div");
    card.className = "card p-3 mb-2 saved-question-card";
    card.style.borderRadius = "10px";
    card.dataset.questionId = questionObj.id;

    // Question title with styling
    const q = document.createElement("p");
    q.textContent = questionObj.text;
    q.style.marginBottom = "8px";
    q.style.fontWeight = questionObj.styles.bold ? "bold" : "normal";
    q.style.fontStyle = questionObj.styles.italic ? "italic" : "normal";
    q.style.fontFamily = questionObj.styles.font;
    card.appendChild(q);

    // Metadata bar
    const meta = document.createElement("div");
    meta.className = "d-flex justify-content-between align-items-center mb-2";
    
    const metaLeft = document.createElement("small");
    metaLeft.innerHTML = `Type: <strong>${questionObj.type}</strong> ${questionObj.required ? '<span class="text-danger">* Req</span>' : ''}`;
    
    // Determine correct answer for display
    let correctAnswerDisplay = "";
    if (questionObj.type === "Short Text") {
        correctAnswerDisplay = questionObj.correctAnswer;
    } else if (questionObj.options.length > 0) {
        const correctOption = questionObj.options.find(opt => opt.correct);
        correctAnswerDisplay = correctOption ? correctOption.text : "Not Set";
    }
    
    const metaRight = document.createElement("small");
    metaRight.innerHTML = `Correct: <strong class="text-success">${correctAnswerDisplay || "Not Set"}</strong>`;
    
    meta.appendChild(metaLeft);
    meta.appendChild(metaRight);
    card.appendChild(meta);
    
    // Add to questions list
    questionsList.appendChild(card);

    // Reset builder
    qText.value = "";
    correctAnswerInput.value = "";
    optionsContainer.innerHTML = "";
    optionCount = 0;
    updatePreview();
}

// Save form to database
function saveFormToDatabase() {
    const title = document.getElementById('formTitle').value.trim();
    const description = document.getElementById('formDescription').value.trim();
    const status = document.getElementById('formStatus').value;

  if (!title) {
    showError("Please enter a form title.");
    return;
}

if (currentFormQuestions.length === 0) {
    showError("Please add at least one question to the form.");
    return;
}

    // Prepare questions for database
    const formattedQuestions = currentFormQuestions.map(q => {
        const baseQuestion = {
            id: q.id,
            text: q.text,
            type: q.type,
            required: q.required,
            correctAnswer: q.correctAnswer
        };

        if (q.type === "Multiple Choice" || q.type === "Dropdown List") {
            baseQuestion.options = q.options.map(opt => opt.text);
            // For database, we might want to store which option is correct
            const correctIndex = q.options.findIndex(opt => opt.correct);
            if (correctIndex !== -1) {
                baseQuestion.correctOption = q.options[correctIndex].text;
            }
        }

        return baseQuestion;
    });

    // Create form object
    const now = new Date();
    const newForm = {
        id: database.forms.length + 1,
        title: title,
        description: description,
        status: status,
        createdAt: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
        questionsNumber: currentFormQuestions.length,
        questions: formattedQuestions
    };

    // Add to database
    database.forms.push(newForm);
    saveDatabase();
    
    // Show success message
    showSuccess(`Form "${title}" saved successfully with ${currentFormQuestions.length} questions!`);
    
    // Reset form builder
    currentFormQuestions = [];
    questionsList.innerHTML = "";
    document.getElementById('formTitle').value = '';
    document.getElementById('formDescription').value = '';
    document.getElementById('formStatus').value = 'active';
    
    // You might want to redirect or update UI here
    console.log("Form saved:", newForm);
}

// Event Listeners
qText.addEventListener("input", updatePreview);
qType.addEventListener("change", updatePreview);
boldCheck.addEventListener("change", () => {
    styleSettings.bold = boldCheck.checked;
    applyStyles(previewText);
});
italicCheck.addEventListener("change", () => {
    styleSettings.italic = italicCheck.checked;
    applyStyles(previewText);
});
fontSelect.addEventListener("change", () => {
    styleSettings.font = fontSelect.value;
    applyStyles(previewText);
});
addOptionBtn.addEventListener("click", addOptionRow);
addQuestionBtn.addEventListener("click", addQuestionToForm);
saveFormBtn.addEventListener("click", saveFormToDatabase);

// Initialize
updatePreview();

















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
<<<<<<< HEAD

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
         
=======
>>>>>>> 96dd978 (Add new pages, update styles, and JS scripts)
    database.users = database.users.filter(user => user.id !== id);
    saveDatabase();
    renderUsers();
    showSuccess("User deleted successfully");
<<<<<<< HEAD
        }
    });




}
document.getElementById('users-container').addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-delete')) {
        const userId = Number(e.target.dataset.id);
        deleteUser(userId);
    } else if (e.target.classList.contains('btn-edit')) {
        const userId = Number(e.target.dataset.id);
        openEditUser(userId);
    }
});
=======
}
>>>>>>> 96dd978 (Add new pages, update styles, and JS scripts)

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

<<<<<<< HEAD
function addForm() { 
=======
function addForm() {
>>>>>>> 96dd978 (Add new pages, update styles, and JS scripts)
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

<<<<<<< HEAD

    database.forms.push(newForm);
    saveDatabase();
    renderForms();

    document.getElementById('addFormModal').style.display = 'none';
    showSuccess("Form added successfully!");
   
}
document.getElementById('saveFormBtn').addEventListener('click',(e)=>
{ 
 e.preventDefault();
addForm();

})

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

=======
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

>>>>>>> 96dd978 (Add new pages, update styles, and JS scripts)
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

<<<<<<< HEAD
 //create form events

 
=======
 console.log(database);
>>>>>>> 96dd978 (Add new pages, update styles, and JS scripts)
