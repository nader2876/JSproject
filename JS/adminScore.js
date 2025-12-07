document.addEventListener("DOMContentLoaded", () => {
    initializeDatabase().then(() => {
        console.log("AdminScore DB:", window.database);

        // Get form title from URL query param (e.g., ?formTitle=Quiz+1)
        const urlParams = new URLSearchParams(window.location.search);
        const testName = urlParams.get('formTitle') || ''; // fallback to empty

        if (testName) {
            loadDatabase(testName); // ← now it will fetch & render correctly
        } else {
            document.getElementById("scoresContainer").innerHTML = "<p>No test name specified in URL.</p>";
        }
    });
});


function loadDatabase(testName) {

    fetch("../../db.json")
        .then(res => res.json())
        .then(jsonDB => {

            // Load local saved database
            const localDB = JSON.parse(localStorage.getItem("database")) || {
                users: [],
                forms: [],
                scores: []
            };

            // FIX MERGE — no duplicates + correct fallbacks
            const mergedDB = {
                users: localDB.users.length ? localDB.users : jsonDB.users,
                forms: jsonDB.forms,
                scores: localDB.scores.length ? localDB.scores : jsonDB.scores
            };

            renderScoresTable(mergedDB, testName);
        })
        .catch(err => {
            console.error("Fetch error:", err);
            document.getElementById("scoresContainer").innerHTML = "<p>Error loading database</p>";
        });
}




function renderScoresTable(database, testName) {
    const container = document.getElementById("scoresContainer");
    container.innerHTML = "";

    // Find form by test name
    const form = database.forms.find(
        f => f.title.toLowerCase() === testName.toLowerCase()
    );

    if (!form) {
        container.innerHTML = `<p>No form found with name "${testName}"</p>`;
        return;
    }

    // FORM TITLE
    container.innerHTML += `
        <div class="test-header mb-3 fw-bold">
            #${form.id} — ${form.title}
        </div>
    `;

    // Filter scores
    const formScores = database.scores.filter(s => s.formId === form.id);

    if (formScores.length === 0) {
        container.innerHTML += `<p>No scores yet for this form</p>`;
        return;
    }

    formScores.forEach(score => {
        const user = database.users.find(u => u.id === score.userId);
        if (!user) return;

        const totalQ = form.questions.length;
        const passed = score.score >= totalQ / 2;

        container.innerHTML += `
            <div class="score-row d-flex justify-content-between align-items-center p-2 border-bottom">
                <div class="d-flex align-items-center">
                    <i class="fa-solid fa-user me-2"></i>
                    <h5 class="mb-0">${user.username}</h5>
                </div>

                <div class="${passed ? "text-success-custom" : "text-danger-custom"}">
                    ${passed ? "Pass" : "Fail"} — ${score.score}/${totalQ}
                </div>

                <button class="btn btn-sm btn-review"
                        data-user="${user.id}"
                        data-form="${form.id}">
                    Review Answers
                </button>
            </div>
        `;
    });
}



