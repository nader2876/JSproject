

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

    let db = JSON.parse(localStorage.getItem("db"));
    let users = db.users || [];

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
     localStorage.setItem("currentUserRole", foundUser.role);
  setTimeout(() => {
    window.location.href = "main.html"; // same page for everyone
}, 1500);
});

