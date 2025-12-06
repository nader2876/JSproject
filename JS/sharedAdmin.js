function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message
    });
}

function showSuccess(message) {
    Swal.fire({
        icon: 'success',
        title: 'Success',
        text: message,
        timer: 1500,
        showConfirmButton: false
    });
}

// Database Loading
let currentEditingUserId = null;
let currentEditingFormId = null;
let database = { users: [], forms: [] }; // Initialize with empty structure

// Initialize database
function initializeDatabase() {
    return new Promise((resolve) => {
        fetch('../../db.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch db.json');
                }
                return response.json();
            })
            .then(jsonData => {
                if (!localStorage.getItem('db')) {
                    localStorage.setItem('db', JSON.stringify(jsonData));
                    console.log('Database initialized from JSON');
                }
                loadDatabase();
                resolve(database);
            })
            .catch(error => {
                console.error('Error loading database:', error);
                // Initialize empty database
                database = {
                    users: [],
                    forms: []
                };
                // Check if we have data in localStorage
                loadDatabase();
                localStorage.setItem('db', JSON.stringify(database));
                resolve(database);
            });
    });
}

function loadDatabase() {
    const raw = localStorage.getItem('db');
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            database.users = parsed.users || [];
            database.forms = parsed.forms || [];
            console.log('Database loaded from localStorage:', database);
        } catch (e) {
            console.error('Error parsing localStorage data:', e);
            database = { users: [], forms: [] };
        }
    } else {
        database = { users: [], forms: [] };
    }
    // Make database globally accessible
    window.database = database;
}

function saveDatabase() {
    localStorage.setItem('db', JSON.stringify(database));
}

// Initialize database on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeDatabase().then(() => {
        // Only render forms if we're on the forms page
        if (document.getElementById('formsTable')) {
            renderForms();
        }
    });
});
