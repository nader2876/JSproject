fetch("db.json")
    .then(response => response.json())
    .then(data => {
        let users = data.users || [];

        if (!localStorage.getItem("users")) {
            localStorage.setItem("users", JSON.stringify(users));
        }
    })
    .catch(error => console.error("Error loading JSON:", error));

let users = JSON.parse(localStorage.getItem("users")) || [];

function showError(message) {
    Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: message
    });
}

function showSuccess(message) {
    Swal.fire({
        icon: "success",
        title: "Welcome!",
        text: message,
        timer: 1500,
        showConfirmButton: false
    });
}

document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();

    let foundUser = users.find(u => u.username === username);

    if (!foundUser) {
        showError("Username does not exist.");
        return;
    }

    if (foundUser.password !== password) {
        showError("Incorrect password.");
        return;
    }

    showSuccess("Login successful!");

    // ⬅️ Save ONLY the user ID inside localStorage
    localStorage.setItem("currentUserId", foundUser.id);

    setTimeout(() => {
        if (foundUser.role === "admin") {
            window.location.href = "admin-home.html";
        } else {
            window.location.href = "user-home.html";
        }
    }, 1500);
});

