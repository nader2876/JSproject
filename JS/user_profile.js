// Load the full database from localStorage
const db = JSON.parse(localStorage.getItem("db")) || {};
const users = db.users || [];

// Get logged user ID
const currentUserId = Number(localStorage.getItem("currentUserId"));

if (!currentUserId) {
    Swal.fire({
        icon: "error",
        title: "Not Logged In",
        text: "Please log in first."
    });
    throw new Error("Not logged in"); // Stop execution
}

// Find logged user inside users array
const currentUser = users.find(u => u.id === currentUserId);

if (!currentUser) {
    Swal.fire({
        icon: "error",
        title: "Error",
        text: "User not found."
    });
    throw new Error("User not found"); // Stop execution
}

// Fill input fields
document.getElementById("username").value = currentUser.username || "";
document.getElementById("email").value = currentUser.email || "";
document.getElementById("password").value = currentUser.password || "";
document.getElementById("topName").textContent = currentUser.username || "FullName";

// Save changes
document.getElementById("Edit").addEventListener("click", function () {
    const newUsername = document.getElementById("username").value.trim();
    const newEmail = document.getElementById("email").value.trim();
    const newPassword = document.getElementById("password").value.trim();

    // Update only changed fields
    if (newUsername) {
        currentUser.username = newUsername;
        document.getElementById("topName").textContent = currentUser.username;
    }
    if (newEmail) currentUser.email = newEmail;
    if (newPassword) {
        currentUser.password = newPassword;
        currentUser.retypePassword = newPassword;
    }

    // Save updated users array back into the full db
    db.users = users;
    localStorage.setItem("db", JSON.stringify(db));

    Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Profile updated successfully."
    })
        .then(() => {
    // Redirect to another page after OK
    window.location.href = "/Main.html"; // <-- put your page here
});
    
});

