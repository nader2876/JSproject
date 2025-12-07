function renderForms() {
    console.log('renderForms called, database:', database);
    
    const table = document.getElementById('formsTable');
    if (!table) return; // Not on forms page
    
    // Check if database.forms exists
    if (!database.forms) {
        console.error('database.forms is undefined!');
        table.innerHTML = '<p class="text-center">Database error. Please refresh.</p>';
        return;
    }
    
    table.innerHTML = '';

    if (database.forms.length === 0) {
        table.innerHTML = '<p class="text-center">No forms found. Create your first form!</p>';
        return;
    }
    

    database.forms.forEach(form => {
        table.innerHTML += `
         <div class="form-card">
            <div class="form-left">
                <h2>#${form.id} &nbsp; ${form.title}</h2><br>
                <div class="all-buttons">
                    <button id="editBtn" class="btn btn-edit btn-sm me-2" onclick="openEditForm(${form.id})">Edit</button>
                    <button class="btn btn-scores btn-sm me-2 " href="scores.html?formId=${form.id}" data-form-id="${form.id}">Scores</button>
                    <button class="btn btn-delete btn-sm me-2" onclick="deleteForm(${form.id});">Delete</button>
                    <select class="form-select d-inline-block w-auto btn-sm" onchange="changeFormStatus(${form.id}, this.value)">
                        <option value="active" ${form.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="inactive" ${form.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
            </div>
            <div class="text-end">
                <div>${form.questions?.length || 0} Questions</div>
                <div class="mt-1 status ${form.status === 'active' ? 'status-active' : 'status-inactive'}" id="status-${form.id}">
                    <i class="bi bi-check-circle-fill"></i> ${form.status}
                </div>
            </div>
        </div>`;
    });
}
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-scores')) {
        const formId = e.target.dataset.formId;
        const form = database.forms.find(f => f.id == formId);
        if (!form) return;

        // Pass title in URL
        const formTitle = encodeURIComponent(form.title);
        window.location.href = `admin_scores_list.html?formTitle=${formTitle}`;
    }
});



function changeFormStatus(formId, newStatus) {
    // Make sure database is loaded
    if (!database.forms) {
        showError('Database not loaded yet');
        return;
    }
    
    const form = database.forms.find(f => f.id === formId);
    if (!form) return;

    form.status = newStatus;
    saveDatabase();
    renderForms();
    showSuccess(`Form status changed to ${newStatus}`);
}

function openEditForm(id) {
    localStorage.setItem("currentFormId", id);
    window.location.href = "/Adnan/admin/edit_form.html"; 
}

// new change
/*function openEditForm(id) {
    // Make sure database is loaded
    if (!database.forms) {
        showError('Database not loaded yet');
        return;
    }
    
    const form = database.forms.find(f => f.id === id);
    if (!form) return;

    document.getElementById('editFormTitle').value = form.title;
    document.getElementById('editFormDescription').value = form.description;
    document.getElementById('editFormStatus').value = form.status;

    currentEditingFormId = id;
   function openEditForm(id) {
    if (!database.forms) { showError('Database not loaded yet'); return; }
    
    const form = database.forms.find(f => f.id === id);
    if (!form) return;

    document.getElementById('editFormTitle').value = form.title;
    document.getElementById('editFormDescription').value = form.description;
    document.getElementById('editFormStatus').value = form.status;

    currentEditingFormId = id;

    // Show modal using Bootstrap
    const modal = new bootstrap.Modal(document.getElementById('editFormModal'));
    modal.show();
}

}*/

function saveEditingForm() {
    // Make sure database is loaded
    if (!database.forms) {
        showError('Database not loaded yet');
        return;
    }
    
    const form = database.forms.find(f => f.id === currentEditingFormId);
    if (!form) return;

    form.title = document.getElementById('editFormTitle').value;
    form.description = document.getElementById('editFormDescription').value;
    form.status = document.getElementById('editFormStatus').value;

    saveDatabase();
    renderForms();

    document.getElementById('editFormModal').style.display = 'none';
    showSuccess("Form updated successfully!");
    
}

function deleteForm(id) {
    // Make sure database is loaded
    if (!database.forms) {
        showError('Database not loaded yet');
        return;
    }
    
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
            database.forms = database.forms.filter(f => f.id !== id);
            saveDatabase();
            renderForms();
            showSuccess("Form deleted successfully!");
        }
    });
}