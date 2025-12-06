document.getElementById("registerForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let username = document.getElementById("username").value.trim();
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();
    let retypePassword = document.getElementById("retype_password").value.trim();

    // Load the full database from localStorage
    let db = JSON.parse(localStorage.getItem("db")) || {};
    if (!db.users) db.users = []; // ensure users array exists

    // Helper function for SweetAlert error
    function showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Error Occurred...',
            text: message
        });
    }

    // Validation
    if (!username || !email || !password || !retypePassword) {
        showError("Please fill all fields!");
        return;
    }

    let usernameRegex = /^[A-Za-z\u0600-\u06FF\s]+$/;
    if (!usernameRegex.test(username)) {
        showError("Username must contain letters only.");
        return;
    }

    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError("Invalid email address.");
        return;
    }

    let passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/;
    if (!passwordRegex.test(password)) {
        showError("Password must be 6-20 characters and include letters and numbers.");
        return;
    }

    if (password !== retypePassword) {
        showError("Passwords do not match.");
        return;
    }

    // Check if email already exists in db.users
    if (db.users.some(user => user.email === email)) {
        showError("Email already registered.");
        return;
    }

    // Create new user
    let newUser = {
        id: Date.now(),
        username: username,
        email: email,
        password: password,
        role: "user"
    };

    // Add to the users array inside db
    db.users.push(newUser);

    // Save the full database back to localStorage
    localStorage.setItem("db", JSON.stringify(db));

    Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Account created successfully!'
    }).then(() => {
        // Redirect to login
        window.location.href = "Login.html";
    });
});


