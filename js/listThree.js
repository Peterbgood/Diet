let $columns; // Declare $columns as a global variable
const $heading = $('h1[contenteditable="true"]');
const storagePrefix = 'myTodoApp_';

// Load saved data from local storage
function loadColumns() {
    $columns = $('.co[contenteditable="true"]'); // Initialize $columns
    for (let i = 1; i <= 6; i++) {
        const data = localStorage.getItem(`${storagePrefix}column${i}`);
        if (data) {
            if ($('#column' + i).length === 0) {
                const newColumnHtml = `
                    <div class="col-sm">
                        <div class="form-control co d-none d-sm-block" contenteditable="true" id="column${i}"></div>
                    </div>
                `;
                $('.row').append(newColumnHtml);
            }
            $(`#column${i}`).html(data);
        }
    }
}

// Save data to local storage on input
function saveColumns() {
    $columns.on('blur', function() {
        const index = $columns.index(this) + 1;
        localStorage.setItem(`${storagePrefix}column${index}`, $(this).html());
    });
}

$(document).ready(function() {
    loadColumns();

    const headingData = localStorage.getItem(`${storagePrefix}heading`);
    if (headingData) {
        $heading.html(headingData);
    } else {
        $heading.html('To-Do-List'); // or set a default value
    }

    saveColumns();

    $heading.on('input', function() {
        localStorage.setItem(`${storagePrefix}heading`, $heading.html());
    });

    // Reset to-do list and heading
    $('#reset-list').on('click', function() {
        // Remove all columns except the first one
        $('.row .col-sm:not(:first)').remove();
        
        // Reset heading
        $heading.html('To-Do-List'); // or set a default value
        
        // Clear the first column's content
        $('#column1').html('');
        
        // Clear local storage for this app only
        Object.keys(localStorage).forEach(function(key) {
            if (key.startsWith(storagePrefix)) {
                localStorage.removeItem(key);
            }
        });
        
        // Reload the page with a small delay to ensure a complete reset
        setTimeout(function() {
            location.reload();
        }, 100); // 100ms delay
    });

    // Add column on double click
    $(document).on('dblclick', function(e) {
        if ($(e.target).closest('.row').length === 0) {
            const newColumnIndex = $columns.length + 1;
            if (newColumnIndex <= 6) { // Limit to 6 columns
                const newColumnHtml = `
                    <div class="col-sm">
                        <div class="form-control co d-none d-sm-block" contenteditable="true" id="column${newColumnIndex}"></div>
                    </div>
                `;
                $('.row').append(newColumnHtml);
                $(`#column${newColumnIndex}`).focus();
                // Update $columns to include the new column
                $columns = $('.co[contenteditable="true"]'); // Update the global $columns variable
                // Attach blur event to the new column
                $(`#column${newColumnIndex}`).on('blur', function() {
                    localStorage.setItem(`${storagePrefix}column${newColumnIndex}`, $(this).html());
                });
                // Save the new column to local storage immediately
                localStorage.setItem(`${storagePrefix}column${newColumnIndex}`, $(`#column${newColumnIndex}`).html());
            }
        }
    });

    // Save all columns to local storage on page unload
    $(window).on('beforeunload', function() {
        $columns.each(function(index, element) {
            const columnIndex = index + 1;
            localStorage.setItem(`${storagePrefix}column${columnIndex}`, $(element).html());
        });
    });
});