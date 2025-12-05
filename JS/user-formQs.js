// user-formsQs.js

// Get selected title from localStorage (set by forms.html)
const selectedTitle = localStorage.getItem("selectedTestTitle");
if (!selectedTitle) {
  Swal.fire({ icon: "error", title: "No test selected", text: "Choose a test from the list first." });
  throw new Error("No selected test title in localStorage");
}

document.getElementById("testTitle").textContent = selectedTitle;

let formsData = JSON.parse(localStorage.getItem("formsData") || "null");
// If formsData not in localStorage (first run) we try to load db.json and then save
function ensureFormsDataThenRender() {
  if (formsData && Array.isArray(formsData)) {
    renderForm();
    return;
  }

  fetch("./db.json")
    .then(res => {
      if (!res.ok) throw new Error("db.json not found");
      return res.json();
    })
    .then(data => {
      formsData = data.forms || [];
      // create writable copy in localStorage
      localStorage.setItem("formsData", JSON.stringify(formsData));
      renderForm();
    })
    .catch(err => {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error", text: "Could not load tests data." });
    });
}

// render selected form questions
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
    qbox.className = "qbox";

    const qTitle = document.createElement("div");
    qTitle.innerHTML = `<strong>Q${q.id}.</strong> ${escapeHtml(q.question)}`;
    qbox.appendChild(qTitle);

    const choicesDiv = document.createElement("div");
    choicesDiv.className = "choices";

    if (q.type === "mcq" && Array.isArray(q.choices)) {
      q.choices.forEach(choice => {
        const id = `q${q.id}_${Math.random().toString(36).slice(2,8)}`;
        const label = document.createElement("label");
        label.innerHTML = `<input type="radio" name="q${q.id}" value="${escapeHtml(choice)}"> ${escapeHtml(choice)}`;
        choicesDiv.appendChild(label);
      });

      // if there is a saved userAnswer pre-check the radio
      if (q.userAnswer) {
        // small delay to allow DOM nodes
        setTimeout(() => {
          const radio = document.querySelector(`input[name="q${q.id}"][value="${CSSescape(q.userAnswer)}"]`);
          if (radio) radio.checked = true;
        }, 0);
      }

      // listen for change events (save answer as user selects)
      choicesDiv.addEventListener("change", (ev) => {
        const input = ev.target;
        if (!input || !input.name) return;
        const qIdStr = input.name.replace("q", ""); // numeric id
        const selectedVal = input.value;

        // update the in-memory formsData
        const formIndex = formsData.findIndex(f => f.title === selectedTitle);
        if (formIndex === -1) return;
        const qIndex = formsData[formIndex].questions.findIndex(x => String(x.id) === String(qIdStr));
        if (qIndex === -1) return;

        formsData[formIndex].questions[qIndex].userAnswer = selectedVal;
        // persist formsData
        localStorage.setItem("formsData", JSON.stringify(formsData));
      });

    } else {
      // other types can be supported (text, true_false etc.)
      // For simplicity, if text type:
      if (q.type === "text") {
        const input = document.createElement("input");
        input.type = "text";
        input.value = q.userAnswer || "";
        input.addEventListener("input", (ev) => {
          const formIndex = formsData.findIndex(f => f.title === selectedTitle);
          const qIndex = formsData[formIndex].questions.findIndex(x => String(x.id) === String(q.id));
          formsData[formIndex].questions[qIndex].userAnswer = ev.target.value;
          localStorage.setItem("formsData", JSON.stringify(formsData));
        });
        choicesDiv.appendChild(input);
      }
    }

    qbox.appendChild(choicesDiv);
    container.appendChild(qbox);
  });
}

// helper to escape html (basic)
function escapeHtml(s){
  if (s == null) return "";
  return String(s).replace(/[&<>"']/g, function(m){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]; });
}

// CSS.escape polyfill for older browsers (we only use it to match value)
function CSSescape(str) {
  if (window.CSS && CSS.escape) return CSS.escape(str);
  return String(str).replace(/([^\w-])/g, "\\$1");
}

// handle submit: score + save score record + update form.score
document.getElementById("submitBtn").addEventListener("click", () => {
  const formIndex = formsData.findIndex(f => f.title === selectedTitle);
  if (formIndex === -1) {
    Swal.fire({ icon: "error", title: "Error", text: "Form not found." });
    return;
  }
  const formObj = formsData[formIndex];
  let correctCount = 0;
  formObj.questions.forEach(q => {
    const userA = q.userAnswer;
    const correctA = q.correctAnswer;
    if (userA != null && String(userA).trim() !== "" && String(userA) === String(correctA)) {
      correctCount++;
    }
  });

  formObj.score = correctCount;
  // persist formsData back to localStorage
  localStorage.setItem("formsData", JSON.stringify(formsData));

  // prepare score record
  let scores = JSON.parse(localStorage.getItem("scores") || "[]");

  // find current user from localStorage
  const currentUserId = localStorage.getItem("currentUserId"); // earlier we set this on login
  let username = "guest";
  if (currentUserId) {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
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

  // SweetAlert show result
  const percent = Math.round((correctCount / formObj.questions.length) * 100);
  Swal.fire({
    icon: "success",
    title: "Test submitted",
    html: `<b>${username}</b>, your score: <b>${correctCount} / ${formObj.questions.length}</b> (${percent}%)`
  });
});

ensureFormsDataThenRender();

