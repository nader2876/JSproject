let currentTest = null;

// قراءة ID من URL
const urlParams = new URLSearchParams(window.location.search);
const currentTestId = Number(urlParams.get("id"));

if (!currentTestId) {
    Swal.fire("Error", "No test ID found!", "error");
}

// تحميل JSON
fetch("./db.json")
    .then(res => res.json())
    .then(data => {
        currentTest = data.forms.find(t => t.id === currentTestId);

        if (!currentTest) {
            Swal.fire("Error", "Test not found!", "error");
            return;
        }

        document.getElementById("testTitle").innerText = currentTest.title;

        renderQuestions(); // ← عرض الأسئلة مباشرة
    })
    .catch(err => console.log(err));


// عرض الأسئلة
function renderQuestions() {
    let container = document.getElementById("questionsContainer");
    container.innerHTML = "";

    currentTest.questions.forEach(q => {
        let div = document.createElement("div");
        div.className = "question-box";

        let html = `
            <h3>${q.question}</h3>
        `;

        html += q.choices.map(choice => `
            <label>
                <input type="radio" name="q${q.id}" value="${choice}">
                ${choice}
            </label><br>
        `).join("");

        div.innerHTML = html;
        container.appendChild(div);
    });

    // إظهار زر الإرسال
    document.getElementById("submitBtn").style.display = "block";
}


// عند الضغط على Submit
document.getElementById("submitBtn").addEventListener("click", () => {

    let score = 0;

    currentTest.questions.forEach(q => {

        let userChoice = document.querySelector(`input[name="q${q.id}"]:checked`);

        if (userChoice) {
            q.userAnswer = userChoice.value;

            if (q.userAnswer === q.correctAnswer) {
                score++;
            }
        }
    });

    let finalScore = `${score} / ${currentTest.questions.length}`;
    currentTest.score = score;

    Swal.fire({
        icon: "success",
        title: "Your Score",
        text: `You got: ${finalScore}`
    });
});
