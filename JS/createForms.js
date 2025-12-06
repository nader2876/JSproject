// ============ Form Builder Create Page Script ============

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Only run if we're on the form builder create page
    if (!document.getElementById('questionText')) return;
    
    initializeFormBuilder();
});

function initializeFormBuilder() {
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
    const addQuestionBtn = document.getElementById("addQuestionToFormBtn");
    const questionsList = document.getElementById("questionsList");
    const correctAnswerInput = document.getElementById("correctAnswerInput");
    const correctAnswerWrapper = document.getElementById("correctAnswerWrapper");
    const saveFormBtn = document.getElementById("saveFormBtn");

    // State
    let styleSettings = { bold: false, italic: false, font: "Arial" };
    let optionCount = 0;
    let currentFormQuestions = [];
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
        previewText.textContent = qText.value || "Question will appear here";
        applyStyles(previewText);

        if (qType.value === "Short Text") {
            correctAnswerWrapper.style.display = "block";
            addOptionBtn.style.display = "none";
            optionsContainer.innerHTML = "";
            optionCount = 0;
        } else {
            correctAnswerWrapper.style.display = "none";
        }

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
        
        // Show success message
        showSuccess("Question added successfully!");
    }

    // Save form to database - SPECIFIC TO FORM BUILDER
       // Save form to database - SPECIFIC TO FORM BUILDER
    function saveFormBuilder() {
        const title = document.getElementById('formTitle').value.trim();
        const description = document.getElementById('formDescription').value.trim();
        const status = document.getElementById('formStatus').value;
loadDatabase();
        if (!title) {
            showError("Please enter a form title.");
            return;
        }

        if (currentFormQuestions.length === 0) {
            showError("Please add at least one question to the form.");
            return;
        }

        // Simple confirmation dialog
        Swal.fire({
            title: 'Save Form?',
            text: `Are you sure you want to save "${title}" with ${currentFormQuestions.length} questions?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
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
                    id: window.database.forms.length + 1,
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
                
                // Store the count BEFORE resetting
                const questionCount = currentFormQuestions.length;
                
                // Show success message FIRST
                showSuccess(`Form "${title}" saved successfully with ${questionCount} questions!`);
                
                console.log("Form saved:", newForm);
                
                // Reset form builder AFTER showing success
                currentFormQuestions = [];
                questionsList.innerHTML = "";
                document.getElementById('formTitle').value = '';
                document.getElementById('formDescription').value = '';
                document.getElementById('formStatus').value = 'active';
                
                
            }
        });
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
    
    // Save Form button - FORM BUILDER VERSION
    saveFormBtn.addEventListener('click', function(e) {
        e.preventDefault();
        saveFormBuilder();
    });

    // Initialize preview
    updatePreview();
}