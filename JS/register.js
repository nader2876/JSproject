// Load initial data from db.json if localStorage is empty
fetch("./db.json")
    .then(response => response.json()) // response.json() converts the downloaded file into real JavaScript data.
    .then(data => {
        let users = data.users || [];
        if (!localStorage.getItem("users")) {
            localStorage.setItem("users", JSON.stringify(users));
        }
    })
    .catch(error => console.error("Error loading JSON:", error));

document.getElementById("registerForm").addEventListener("submit", function(e) {

    e.preventDefault();

    let username = document.getElementById("username").value.trim();
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();
    let retypePassword = document.getElementById("retype_password").value.trim();

    // Helper function for SweetAlert error
    function showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Error Occured...',
            text: message
        });
    }

    // Check all fields are filled
    if (!username || !email || !password || !retypePassword) {
        showError("Please fill all fields!");
        return;
    }

    // Username: letters only
    let usernameRegex = /^[A-Za-z\u0600-\u06FF\s]+$/;
    if (!usernameRegex.test(username)) {
        showError("Username must contain letters only.");
        return;
    }

    // Email regex
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError("Invalid email address.");
        return;
    }

    // Password regex: 6-20 chars, at least 1 letter and 1 number
    let passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/;
    if (!passwordRegex.test(password)) {
        showError("Password must be 6-20 characters and include letters and numbers.");
        return;
    }

    // Check passwords match
    if (password !== retypePassword) {
        showError("Passwords do not match.");
        return;
    }

    // Load users from localStorage
    let users = JSON.parse(localStorage.getItem("users")) || []; // Converts string → object , Used after reading from localStorage .

    // Check if email exists
    if (users.some(user => user.email === email)) {
        showError("Email already registered.");
        return;
    }

    // Create new user
    let newUser = {
        id: Date.now(),
        username: username,
        email: email,
        password: password,
        retypePassword:retypePassword,
        role:"user"
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users)); // localstorge can only store string  , Converts object → string , Used before saving to localStorage.



    Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Account created successfully!'
    });

    document.getElementById("registerForm").reset();
});

