// -------------------------------
// Load DB
// -------------------------------
let db = JSON.parse(localStorage.getItem("db")) || { forms: [] };

// Determine if we are editing
let currentFormId = Number(localStorage.getItem("currentFormId"));
let currentForm = db.forms.find(f => f.id === currentFormId);

// Elements
const formTitle = document.getElementById("formTitle");
const formDescription = document.getElementById("formDescription");
const formStatus = document.getElementById("formStatus");

const questionText = document.getElementById("questionText");
const questionType = document.getElementById("questionType");
const requiredSwitch = document.getElementById("requiredSwitch");
const boldCheck = document.getElementById("boldCheck");
const italicCheck = document.getElementById("italicCheck");
const correctAnswerInput = document.getElementById("correctAnswerInput");
const correctAnswerWrapper = document.getElementById("correctAnswerWrapper");
const optionsContainer = document.getElementById("optionsContainer");
const addOptionBtn = document.getElementById("addOptionBtn");
const questionsList = document.getElementById("questionsList");
const addQuestionToFormBtn = document.getElementById("addQuestionToFormBtn");
const saveFormBtn = document.getElementById("saveFormBtn");

// -------------------------------
// Load form data if editing
// -------------------------------
if (currentForm) {
    formTitle.value = currentForm.title;
    formDescription.value = currentForm.description;
    formStatus.value = currentForm.status || "active";

    currentForm.questions.forEach(q => renderQuestionInList(q));
}

// -------------------------------
// Add option button
// -------------------------------
addOptionBtn.addEventListener("click", () => {
    const div = document.createElement("div");
    div.className = "d-flex align-items-center gap-2 mt-2 option-row";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "form-control option-text-input";
    input.placeholder = "Option";

    const correctCheckbox = document.createElement("input");
    correctCheckbox.type = "radio";
    correctCheckbox.name = "correctOption";
    correctCheckbox.className = "ms-2";

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn btn-sm btn-danger";
    delBtn.textContent = "X";
    delBtn.addEventListener("click", () => div.remove());

    div.appendChild(correctCheckbox);
    div.appendChild(input);
    div.appendChild(delBtn);
    optionsContainer.appendChild(div);
});

// -------------------------------
// Render question in list
// -------------------------------
function renderQuestionInList(q) {
    const div = document.createElement("div");
    div.className = "p-2 mb-2 border rounded question-item";
    div.dataset.question = JSON.stringify(q);

    div.innerHTML = `<strong>${q.id}.</strong> ${q.text} 
        <small class="text-muted">(${q.type})</small>`;

    questionsList.appendChild(div);
}

// -------------------------------
// Add question to list
// -------------------------------
addQuestionToFormBtn.addEventListener("click", () => {
    const text = questionText.value.trim();
    const type = questionType.value;
    const required = requiredSwitch.checked;
    const correctAnswer = correctAnswerInput.value.trim();
    let options = [];

    if (!text) {
        Swal.fire("Error", "Question text cannot be empty", "error");
        return;
    }

    if (type !== "Short Text") {
        const optionInputs = optionsContainer.querySelectorAll(".option-text-input");
        optionInputs.forEach(o => {
            if (o.value.trim()) options.push(o.value.trim());
        });
        if (options.length < 2) {
            Swal.fire("Error", "At least 2 options required", "error");
            return;
        }
    }

    const newQuestion = {
        id: currentForm ? currentForm.questions.length + 1 : questionsList.children.length + 1,
        text,
        type,
        required,
        correctAnswer: type === "Short Text" ? correctAnswer : "",
        options: type === "Short Text" ? [] : options
    };

    renderQuestionInList(newQuestion);

    if (currentForm) {
        currentForm.questions.push(newQuestion);
        saveDB();
    }

    // Reset builder
    questionText.value = "";
    correctAnswerInput.value = "";
    optionsContainer.innerHTML = "";
});

// -------------------------------
// Save / Update Form
// -------------------------------
saveFormBtn.addEventListener("click", () => {
    const title = formTitle.value.trim();
    const description = formDescription.value.trim();
    const status = formStatus.value;

    if (!title) {
        Swal.fire("Error", "Form title cannot be empty", "error");
        return;
    }

    // Collect rendered questions
    const renderedQuestions = [];
    document.querySelectorAll("#questionsList .question-item").forEach(div => {
        renderedQuestions.push(JSON.parse(div.dataset.question));
    });

    if (currentForm) {
        // Update existing form
        currentForm.title = title;
        currentForm.description = description;
        currentForm.status = status;
        currentForm.questions = renderedQuestions;

        saveDB();
        Swal.fire("Success", "Form updated successfully!", "success").then(() => {
            localStorage.removeItem("currentFormId");
            window.location.href = "forms_table_preview.html";
        });
        return;
    }

    // New form
    const newForm = {
        id: db.forms.length + 1,
        title,
        description,
        status,
        questions: renderedQuestions
    };

    db.forms.push(newForm);
    saveDB();
    Swal.fire("Success", "New form created successfully!", "success").then(() => {
        window.location.href = "forms_table_preview.html";
    });
});

// -------------------------------
// Save DB helper
// -------------------------------
function saveDB() {
    localStorage.setItem("db", JSON.stringify(db));
}

