document.addEventListener('DOMContentLoaded', () => {
    // Read test name from URL
    const urlParams = new URLSearchParams(window.location.search);
    const testName = urlParams.get('formTitle');
    if (!testName) {
        document.getElementById("scoresContainer").innerHTML = "<p>No test selected</p>";
        return;
    }

    // Fetch database
    fetch('/db.json') // adjust path if needed
        .then(response => response.json())
        .then(database => {
            renderScoresTable(database, testName);
        })
        .catch(error => {
            console.error("Failed to fetch database:", error);
            document.getElementById("scoresContainer").innerHTML = "<p>Error loading database</p>";
        });
});

function renderScoresTable(database, testName) {
    const container = document.getElementById("scoresContainer");
    container.innerHTML = "";

    // Find form by title (case-insensitive)
    const form = database.forms.find(f => f.title.toLowerCase() === testName.toLowerCase());
    if (!form) {
        container.innerHTML = `<p>No form found with the name "${testName}"</p>`;
        return;
    }

    // Form title
    container.insertAdjacentHTML("beforeend", `
        <div class="test-header mb-3 fw-bold">
            #${form.id} &nbsp; ${form.title}
        </div>
    `);

    // Filter scores for this form
    const formScores = database.scores.filter(s => s.formId === form.id);
    if (formScores.length === 0) {
        container.insertAdjacentHTML("beforeend", `<p>No scores yet for this form</p>`);
        return;
    }

    formScores.forEach(score => {
        const user = database.users.find(u => u.id === score.userId);
        if (!user) return;

        const totalQuestions = form.questions.length;
        const passed = score.score >= totalQuestions / 2;

        container.insertAdjacentHTML("beforeend", `
            <div class="score-row d-flex justify-content-between align-items-center p-2 border-bottom">
                <div class="user-section d-flex align-items-center">
                    <i class="fa-solid fa-user user-icon me-2"></i>
                    <h5 class="user-name mb-0">${user.username}</h5>
                </div>
                <div class="status-section ${passed ? "text-success-custom" : "text-danger-custom"}">
                    ${passed ? "Pass" : "Fail"} &nbsp; ${score.score}/${totalQuestions}
                </div>
                <div>
                    <button class="btn btn-sm btn-review" data-user="${user.id}" data-form="${form.id}">
                        Review Answers
                    </button>
                </div>
            </div>
        `);
    });
}

