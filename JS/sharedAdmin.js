// -------------------- SweetAlert Helpers --------------------
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

// -------------------- Database Loading --------------------
let currentEditingUserId = null;
let currentEditingFormId = null;
let database = { users: [], forms: [] }; // default empty DB

// Helper: Validate DB structure
function isValidDB(data) {
    return data && typeof data === 'object' && Array.isArray(data.users) && Array.isArray(data.forms);
}

// Load database from localStorage
function loadDatabase() {
    const raw = localStorage.getItem('db');
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (isValidDB(parsed)) {
                database.users = parsed.users;
                database.forms = parsed.forms;
                console.log('Database loaded from localStorage:', database);
                window.database = database;
                return true; // localStorage is valid
            } else {
                console.warn('Invalid DB structure in localStorage. Ignoring it.');
            }
        } catch (e) {
            console.error('Error parsing localStorage data:', e);
        }
    }
    return false; // localStorage missing or invalid
}

// Initialize database (localStorage → JSON fallback)
function initializeDatabase() {
    return new Promise((resolve) => {
        // 1️ Try localStorage first
        if (loadDatabase()) {
            console.log('Using database from localStorage');
            resolve(database);
            return;
        }

        // 2️⃣ Otherwise, fetch db.json from same folder
        fetch('../../db.json')
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch db.json');
                return response.json();
            })
            .then(jsonData => {
                if (isValidDB(jsonData)) {
                    database = jsonData;
                    localStorage.setItem('db', JSON.stringify(database));
                    console.log('Database initialized from JSON:', database);
                } else {
                    console.warn('db.json has invalid structure. Initializing empty DB.');
                    database = { users: [], forms: [] };
                    localStorage.setItem('db', JSON.stringify(database));
                }
                window.database = database;

                // Log full object clearly
                console.log('Full database object:', database);
                console.log('Full database formatted:\n', JSON.stringify(database, null, 2));

                resolve(database);
            })
            .catch(error => {
                console.error('Error fetching db.json:', error);
                // fallback to empty DB
                database = { users: [], forms: [] };
                localStorage.setItem('db', JSON.stringify(database));
                window.database = database;
                resolve(database);
            });
    });
}

// Save database to localStorage
function saveDatabase() {
    localStorage.setItem('db', JSON.stringify(database));
}

// -------------------- On page load --------------------
document.addEventListener('DOMContentLoaded', function () {
 
    initializeDatabase().then(() => {
        
        // Only render forms if we're on the forms page
        if (document.getElementById('formsTable')) {
            renderForms(); // your existing function
        }
    });
});
