// ============ Form Builder Create Page Script ============

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Only run if we're on the form builder create page
    if (!document.getElementById('questionText')) return;
    
    // NOTE: 'previewAnswer' element is used inside updatePreview, 
    // it must be defined globally or passed, so we retrieve it here:
    window.previewAnswer = document.getElementById("previewAnswer");

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
    
    // Retrieve the preview answer input defined outside the function scope
    const previewAnswer = window.previewAnswer; 

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
        
        // **FIX 1: Apply Required visual indicator based on switch state**
        if (requiredSwitch.checked) {
            previewText.textContent += " *"; 
        }
        
        applyStyles(previewText);

        // Short Text preview logic
        if (qType.value === "Short Text") {
            correctAnswerWrapper.style.display = "block";
            addOptionBtn.style.display = "none";
            optionsContainer.innerHTML = "";
            optionCount = 0;

            if (previewAnswer) {
                previewAnswer.style.display = "block";
                
                // **FIX 2: Apply 'required' attribute to the preview input for Short Text**
                previewAnswer.required = requiredSwitch.checked;
                
                previewAnswer.placeholder = requiredSwitch.checked ? "Answer (Required)" : "Answer";
            }
        } else {
            correctAnswerWrapper.style.display = "none";
            if (previewAnswer) previewAnswer.style.display = "none";
        }

        // Multiple Choice / Dropdown logic
        if (qType.value === "Multiple Choice" || qType.value === "Dropdown List") {
            addOptionBtn.style.display = optionCount < MAX_OPTIONS ? "inline-block" : "none";

            // Update option input types
            const optionType = qType.value === "Multiple Choice" ? "radio" : "checkbox";
            const optionRows = optionsContainer.querySelectorAll(".option-row");
            optionRows.forEach(row => {
                const control = row.querySelector(".correct-answer-control");
                control.type = optionType;
                // Only radio buttons need a shared name for mutual exclusion
                control.name = optionType === "radio" ? CORRECT_ANSWER_NAME : `${CORRECT_ANSWER_NAME}_${row.dataset.optionId}`;
            });
        } else {
            addOptionBtn.style.display = "none";
        }
        
        // Update add option button status (if max reached)
        if (optionCount >= MAX_OPTIONS && (qType.value === "Multiple Choice" || qType.value === "Dropdown List")) {
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
        // Type is determined by updatePreview, initialize as radio
        control.type = qType.value === "Multiple Choice" ? "radio" : "checkbox"; 
        control.name = qType.value === "Multiple Choice" ? CORRECT_ANSWER_NAME : `${CORRECT_ANSWER_NAME}_${optionCount}`;

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
            updatePreview(); // Update to re-enable Add Option button if count dropped
        });

        const label = document.createElement("small");
        label.textContent = "Correct";
        label.className = "text-success fw-bold me-2";

        row.appendChild(control);
        row.appendChild(label);
        row.appendChild(txt);
        row.appendChild(delBtn);
        optionsContainer.appendChild(row);
        
        updatePreview(); // Check if max options reached after adding
    }

    // Build question object from current preview (no change needed here)
    function buildQuestionObject() {
        const type = qType.value;
        const questionText = qText.value.trim();
        const isRequired = requiredSwitch.checked; // **Required state is correctly captured here**
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
        const type = qType.value;
        const isRequired = requiredSwitch.checked;

        // 1. Basic Question Text Validation
        if (!qText.value.trim()) {
            showError("Please enter the question text.");
            return;
        }
        
        // 2. Short Text Validation (Must have a correct answer for scoring)
        if (type === "Short Text" && !correctAnswerInput.value.trim()) {
            showError("Please enter the correct answer for the Short Text question.");
            return;
        }

        // 3. Multiple Choice / Dropdown Validation (Must have options and a correct selection)
        if (type !== "Short Text") {
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
        
        // Create visual card for display (Rest of your existing logic for visual card)
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
        // Reset styles and switch
        boldCheck.checked = false;
        italicCheck.checked = false;
        requiredSwitch.checked = true; // Typically a new question defaults to required
        fontSelect.value = "Arial";
        styleSettings = { bold: false, italic: false, font: "Arial" };
        
        optionsContainer.innerHTML = "";
        optionCount = 0;
        
        // Ensure preview resets correctly
        updatePreview();
        
        // Show success message
        showSuccess("Question added successfully!");
    }

    // Save form to database - SPECIFIC TO FORM BUILDER (No changes here)
    function saveFormBuilder() {
        const title = document.getElementById('formTitle').value.trim();
        const description = document.getElementById('formDescription').value.trim();
        const status = document.getElementById('formStatus').value;
        // Make sure loadDatabase, saveDatabase, showError, and showSuccess are defined globally or via sharedAdmin.js
        if (typeof loadDatabase === 'function') loadDatabase(); 
        
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
                        correctAnswer: q.correctAnswer,
                        styles: q.styles // Optionally save styles for rendering later
                    };

                    if (q.type === "Multiple Choice" || q.type === "Dropdown List") {
                        baseQuestion.options = q.options.map(opt => opt.text);
                        const correctOption = q.options.find(opt => opt.correct);
                        baseQuestion.correctOption = correctOption ? correctOption.text : null;
                    }

                    return baseQuestion;
                });

                // Create form object
                const now = new Date();
                const newForm = {
                    id: (window.database.forms ? window.database.forms.length : 0) + 1, // Safer ID calculation
                    title: title,
                    description: description,
                    status: status,
                    createdAt: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
                    questionsNumber: currentFormQuestions.length,
                    questions: formattedQuestions
                };

                // Add to database
                if (!window.database.forms) window.database.forms = [];
                database.forms.push(newForm);
                if (typeof saveDatabase === 'function') saveDatabase();
                
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
                
                // Reset question builder state
                qText.value = '';
                correctAnswerInput.value = '';
                optionsContainer.innerHTML = '';
                requiredSwitch.checked = true;
                updatePreview();
            }
        });
    }

    // Event Listeners
    qText.addEventListener("input", updatePreview);
    qType.addEventListener("change", updatePreview);
    requiredSwitch.addEventListener("change", updatePreview); // Listen for switch change
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