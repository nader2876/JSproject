// Get formId from URL
const urlParams = new URLSearchParams(window.location.search);
const currentViewingFormId = Number(urlParams.get('formId'));

document.addEventListener('DOMContentLoaded', () => {
    initializeDatabase().then(() => {
        renderScoresTable(); // now database is loaded
    });
});

function renderScoresTable() {
    const container = document.getElementById("scoresContainer");
    if (!container) return;

    container.innerHTML = "";

    const formId = currentViewingFormId;
    if (!formId) {
        container.innerHTML = "<p>No form selected</p>";
        return;
    }

    // FIND THE ACTUAL FORM FROM DATABASE
    const form = database.forms.find(f => f.id === formId);
    
    if (!form) {
        container.innerHTML = "<p>Form not found</p>";
        return;
    }

    // Check if scores exist in database
    if (!database.scores) {
        database.scores = []; // Initialize if doesn't exist
    }

    const formScores = database.scores.filter(s => s.formId === formId);

    // INSERT FORM TITLE FROM DATABASE
    container.insertAdjacentHTML("beforeend", `
        <div class="test-header">
            #${form.id} &nbsp; ${form.title}
        </div>
    `);

    if (formScores.length === 0) {
        container.insertAdjacentHTML("beforeend", `
            <div class="score-row">
                <p class="text-center">No scores yet for this form</p>
            </div>
        `);
        return;
    }

    // INSERT SCORES
    formScores.forEach(score => {
        // Find the user for this score
        const user = database.users.find(u => u.id === score.userId);
        
        if (!user) {
            console.log('User not found for score:', score);
            return;
        }

        const totalQuestions = form.questions.length;
        const passed = score.score >= totalQuestions / 2;

        container.insertAdjacentHTML("beforeend", `
            <div class="score-row">
                <div class="user-section">
                    <i class="fa-solid fa-user user-icon"></i>
                    <h5 class="user-name">${user.username}</h5>
                </div>

                <div class="status-section ${passed ? "text-success-custom" : "text-danger-custom"}">
                    ${passed ? "Pass" : "Fail"} &nbsp; ${score.score}/${totalQuestions}
                </div>

                <div>
                    <button class="btn btn-review" data-user="${user.id}" data-form="${form.id}">
                        Review Answers
                    </button>
                </div>
            </div>
        `);
    });
}