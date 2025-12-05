fetch("./db.json")
    .then(response => response.json())
    .then(data => {
        let users = data.users || [];

        if (!localStorage.getItem("users")) {
            localStorage.setItem("users", JSON.stringify(users));
        }
    })
    .catch(error => console.error("Error loading JSON:", error));

// Get logged user ID
let currentUserId = Number(localStorage.getItem("currentUserId"));

if (!currentUserId) {
    Swal.fire({
        icon: "error",
        title: "Not Logged In",
        text: "Please log in first."
    });
}

// Load users
let users = JSON.parse(localStorage.getItem("users")) || [];

// Find logged user inside users array
let currentUser = users.find(u => u.id === currentUserId);

if (!currentUser) {
    Swal.fire({
        icon: "error",
        title: "Error",
        text: "User not found."
    });
}

// Fill fields
document.getElementById("username").value = currentUser.username || "";
document.getElementById("email").value = currentUser.email || "";
document.getElementById("password").value = currentUser.password || "";

// Save changes
document.getElementById("Edit").addEventListener("click", function () {
    let newUsername = document.getElementById("username").value.trim();
    let newEmail = document.getElementById("email").value.trim();
    let newPassword = document.getElementById("password").value.trim();

    // Update only changed fields
    if (newUsername) currentUser.username = newUsername;
    if (newEmail) currentUser.email = newEmail;
    if (newPassword) {
        currentUser.password = newPassword;
        currentUser.retypePassword = newPassword;
    }

    // Save updated users array
    localStorage.setItem("users", JSON.stringify(users));

    Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Profile updated successfully."
    });
});
