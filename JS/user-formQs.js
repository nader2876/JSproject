// Get selected title from localStorage
const selectedTitle = localStorage.getItem("selectedTestTitle");
if (!selectedTitle) {
    Swal.fire({ icon: "error", title: "No test selected", text: "Choose a test from the list first." });
    throw new Error("No selected test title in localStorage");
}

document.getElementById("formTitle").textContent = selectedTitle;

// Load forms data from main database in localStorage
const db = JSON.parse(localStorage.getItem("db")) || {};
let formsData = db.forms || [];

if (!formsData || !Array.isArray(formsData)) {
    Swal.fire({ icon: "error", title: "Error", text: "No forms data available." });
    throw new Error("Forms data not found in localStorage db");
}

// Escape HTML helper
function escapeHtml(s){
    if (!s) return "";
    return String(s).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" })[m]);
}

// CSS.escape polyfill
function CSSescape(str){
    if (window.CSS && CSS.escape) return CSS.escape(str);
    return String(str).replace(/([^\w-])/g, "\\$1");
}

// Render questions dynamically
function renderForm() {
    const formObj = formsData.find(f => f.title === selectedTitle);
    if (!formObj) {
        Swal.fire({ icon: "error", title: "Not found", text: "Selected test not found in data." });
        return;
    }

    const container = document.getElementById("questionsContainer");
    container.innerHTML = "";

    formObj.questions.forEach(q => {
        const qbox = document.createElement("div");
        qbox.className = "question-group";

        const qTitle = document.createElement("div");
        qTitle.className = "question-label-box";
        qTitle.innerHTML = `<strong>Q${q.id}.</strong> ${escapeHtml(q.text)}`; // use q.text
        qbox.appendChild(qTitle);

        const choicesDiv = document.createElement("div");

        // Check type from builder
        if ((q.type === "Multiple Choice" || q.type === "Dropdown List") && Array.isArray(q.options)) {
            choicesDiv.className = "custom-radio-group";
            q.options.forEach(choice => {
                const label = document.createElement("label");
                label.className = "custom-radio";
                label.innerHTML = `<input type="radio" name="q${q.id}" class="radio-input" value="${escapeHtml(choice)}">
                                   <div class="radio-circle"></div>
                                   <span class="radio-label-text">${escapeHtml(choice)}</span>`;
                choicesDiv.appendChild(label);
            });

            // Restore userAnswer if exists
            if (q.userAnswer) {
                setTimeout(() => {
                    const radio = document.querySelector(`input[name="q${q.id}"][value="${CSSescape(q.userAnswer)}"]`);
                    if (radio) radio.checked = true;
                }, 0);
            }

            choicesDiv.addEventListener("change", ev => {
                const input = ev.target;
                if (!input || !input.name) return;
                const qIndex = formObj.questions.findIndex(x => String(x.id) === String(q.id));
                formObj.questions[qIndex].userAnswer = input.value;
                db.forms = formsData;
                localStorage.setItem("db", JSON.stringify(db));
            });

        } else { // Short Text
            const input = document.createElement("input");
            input.type = "text";
            input.className = "form-control-custom";
            input.placeholder = "Write Your Answer";
            input.value = q.userAnswer || "";
            input.addEventListener("input", ev => {
                const qIndex = formObj.questions.findIndex(x => String(x.id) === String(q.id));
                formObj.questions[qIndex].userAnswer = ev.target.value;
                db.forms = formsData;
                localStorage.setItem("db", JSON.stringify(db));
            });
            choicesDiv.appendChild(input);
        }

        qbox.appendChild(choicesDiv);
        container.appendChild(qbox);
    });
}


// Initial render
renderForm();

// Handle submit
document.getElementById("submitBtn").addEventListener("click", () => {
    const formObj = formsData.find(f => f.title === selectedTitle);
    if (!formObj) return;

    let correctCount = 0;
    formObj.questions.forEach(q => {
        if (q.userAnswer && String(q.userAnswer).trim() === String(q.correctAnswer)) correctCount++;
    });

    formObj.score = correctCount;
    db.forms = formsData;
    localStorage.setItem("db", JSON.stringify(db));

    let scores = JSON.parse(localStorage.getItem("scores") || "[]");
    const currentUserId = localStorage.getItem("currentUserId");
    let username = "guest";
    if (currentUserId) {
        const users = db.users || [];
        const u = users.find(x => String(x.id) === String(currentUserId));
        if (u) username = u.username || u.email || "user";
    }

    const scoreRecord = {
        userId: currentUserId ? Number(currentUserId) : null,
        username: username,
        testTitle: selectedTitle,
        score: correctCount,
        total: formObj.questions.length,
        date: new Date().toISOString(),
        answers: formObj.questions.map(q => ({
            questionId: q.id,
            question: q.question,
            userAnswer: q.userAnswer || "",
            correctAnswer: q.correctAnswer
        }))
    };

    scores.push(scoreRecord);
    localStorage.setItem("scores", JSON.stringify(scores));

    const percent = Math.round((correctCount / formObj.questions.length) * 100);
    Swal.fire({
        icon: "success",
        title: "Test submitted",
        html: `<b>${username}</b>, your score: <b>${correctCount} / ${formObj.questions.length}</b> (${percent}%)`
    }).then(() => {
    // This runs after user clicks OK
    window.location.href = "main.html"; // Adjust path if needed
});

});


