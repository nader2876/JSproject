fetch("./db.json")
    .then(response => response.json())
    .then(data => {
        let users = data.users || [];

        // Only set in localStorage if not already stored
        if (!localStorage.getItem("users")) {
            localStorage.setItem("users", JSON.stringify(users));
        }
    })
    .catch(error => console.error("Error loading JSON:", error));
    
// Load users from localStorage
let users = JSON.parse(localStorage.getItem("users")) || [];

function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: message
    });
}

function showSuccess(message) {
    Swal.fire({
        icon: 'success',
        title: 'Welcome!',
        text: message,
        timer: 1500,
        showConfirmButton: false
    });
}

document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    // 1. Check if the user exists
    let foundUser = users.find(u => u.username === username);

    if (!foundUser) {
        showError("Username does not exist.");
        return;
    }

    // 2. Check if password matches
    if (foundUser.password !== password) {
        showError("Incorrect password.");
        return;
    }

    // 3. Login success
    showSuccess("Login successful!");

    // Save current user
    sessionStorage.setItem("currentUser", JSON.stringify(foundUser));

    // 4. Redirect based on role
    setTimeout(() => {
        if (foundUser.role === "admin") {
            window.location.href = "admin-home.html";
        } else {
            window.location.href = "user-home.html";
        }
    }, 1500);
});
