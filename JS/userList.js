function renderUsers() {
    
    loadDatabase();
   const container = document.getElementById("users-container");
            container.innerHTML = "";
 if (!database.users || database.users.length === 0) {
        container.innerHTML = '<p class="text-center">No users found.</p>';
        return;
    }

            window.database.users.forEach((user, index) => {
                container.innerHTML += `
                    <div class="col-lg-6">
                        <div class="user-card">
                            <div class="user-info">
                                <i class="fa-solid fa-user user-icon"></i>
                                <h3 class="user-name">${user.username}</h3>
                            </div>
                            <div>
<button class="btn btn-custom btn-edit" data-userid="${user.id}" onclick="window.location.href='edit_user.html?userId='${user.id}'">Edit</button>
                                <button class="btn btn-custom btn-delete" data-id="${user.id}">Delete</button>
                            </div>
                        </div>
                    </div>
                `;
            });
    }
    
function deleteUser(id) {

 Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to permanently delete this form?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
         
    database.users = database.users.filter(user => user.id !== id);
    saveDatabase();
    renderUsers();
    showSuccess("User deleted successfully");
        }
    });




}
document.getElementById('users-container').addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-delete')) {
        const userId = Number(e.target.dataset.id);
        deleteUser(userId);
    } else if (e.target.classList.contains('btn-edit')) {
        const userId = Number(e.target.dataset.id);
        goToEditUser(userId);
    }
});
   renderUsers();
   function goToEditUser(userId) {
    // Navigate to edit page with userId in the URL
    window.location.href = `edit_user.html?userId=${userId}`;
}