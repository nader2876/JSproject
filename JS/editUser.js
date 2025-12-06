// Load database
const db = JSON.parse(localStorage.getItem("db")) || {};
const users = db.users || [];

// Get logged user ID
const currentUserId = Number(localStorage.getItem("currentUserId"));

// If not logged in
if (!currentUserId) {
    Swal.fire({
        icon: "error",
        title: "Not Logged In",
        text: "Please log in first."
    });
} else {

    // Find user
    const currentUser = users.find(u => u.id === currentUserId);

    if (!currentUser) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "User not found."
        });
    } else {

        // ==== Fill form with existing user info ====
        document.getElementById("fullName").value = currentUser.username || "";
        document.getElementById("email").value = currentUser.email || "";
        document.getElementById("password").value = currentUser.password || "";
        document.getElementById("role").value = currentUser.role || "";

        // ==== Save Button ====
        document.getElementById("saveBtn").addEventListener("click", function (event) {
            event.preventDefault();

            const newUsername = document.getElementById("fullName").value.trim();
            const newEmail = document.getElementById("email").value.trim();
            const newPassword = document.getElementById("password").value.trim();
            const newRole = document.getElementById("role").value;

            // Update user data
            currentUser.username = newUsername;
            currentUser.email = newEmail;
            currentUser.password = newPassword;
            currentUser.role = newRole;

            // Save back to database
            db.users = users;
            localStorage.setItem("db", JSON.stringify(db));

            // Success alert
            Swal.fire({
                icon: "success",
                title: "Updated!",
                text: "Profile updated successfully."
            }).then(() => {
                window.location.href = "/Adnan/Admin/user_list.html";
            });
        });
    }
}
