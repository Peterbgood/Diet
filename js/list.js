// Unique name for local storage
const STORAGE_KEY = 'todo-list-4';

// Initialize the to-do list and list name
let toDoList = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let listName = localStorage.getItem(`${STORAGE_KEY}-name`) || 'To-Do-List';

// Function to update the list HTML
function updateList() {
  const listHTML = toDoList.map((item, index) => {
    let itemHTML = item.replace(/\n/g, '<br>');
    return `
      <li class="list-group-item d-flex justify-content-between align-items-center" data-index="${index}" draggable="true">
        <p contenteditable="false" class="flex-grow-1">${itemHTML}</p>
        <div class="d-flex align-items-center">
          <button class="up btn btn-primary btn-sm ">Up</button>
          <button class="delete btn btn-danger btn-sm">Delete</button>
        </div>
      </li>
    `;
  }).join('');

  $('#to-do-list').html(listHTML);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toDoList));
}

// Function to add a new item to the list
// Function to add a new item to the list
function addItem() {
  const newItem = $('#new-item').val().trim();
  if (newItem !== '') {
    toDoList.push(newItem); // Use push() instead of unshift()
    updateList();
    $('#new-item').val('');
  }
}

// Function to reset the list
function resetList() {
  toDoList = [];
  updateList();
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(`${STORAGE_KEY}-name`);
  listName = 'To-Do-List';
  $('#list-name').text(listName);
}

// Event listeners
$('#add-item').on('click', addItem);
$('#new-item').on('keypress', function(event) {
  if (event.key === 'Enter') {
    addItem();
  }
});

$(document).ready(function() {
  $('#list-name').text(listName);
  updateList();

  // Make list name editable on click
  $('#list-name').on('click', function() {
    const listNameText = $(this).text();
    $(this).html(''); // Clear the existing text
    const editInput = $('<input type="text" class="form-control text-center">').val(listNameText);
    $(this).append(editInput);
    editInput.focus();

    editInput.on('keypress', function(event) {
      if (event.key === 'Enter') {
        const newListName = $(this).val().trim();
        listName = newListName;
        $(this).closest('span').text(listName);
        localStorage.setItem(`${STORAGE_KEY}-name`, listName);
        $(this).remove();
      }
    });

    editInput.on('blur', function() {
      const newListName = $(this).val().trim();
      listName = newListName;
      $(this).closest('span').text(listName);
      localStorage.setItem(`${STORAGE_KEY}-name`, listName);
      $(this).remove();
    });
  });

  // Make log entry editable on click
  $('#to-do-list').on('click', 'p', function() {
    $(this).attr('contenteditable', true);
    $(this).focus();
    $(this).addClass('form-control py-1'); // Add Bootstrap styling and padding
  });

  // Update list item on keypress or blur
  $('#to-do-list').on('keypress', 'p', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      document.execCommand('insertLineBreak');
      event.preventDefault();
    }
  });

  $('#to-do-list').on('blur', 'p', function() {
    const index = $(this).closest('li').data('index');
    toDoList[index] = $(this).html().trim().replace(/<br>/g, '\n'); // Use html() instead of text() to preserve line breaks
    $(this).attr('contenteditable', false);
    $(this).removeClass('form-control py-1'); // Remove Bootstrap styling and padding
    updateList();
  });

  // Delete list item
  $('#to-do-list').on('click', '.delete', function() {
    const index = $(this).closest('li').data('index');
    toDoList.splice(index, 1);
    updateList();
  });

  // Move list item up
  $('#to-do-list').on('click', '.up', function() {
    const index = $(this).closest('li').data('index');
    if (index > 0) {
      toDoList.splice(index - 1, 0, toDoList.splice(index, 1)[0]);
      updateList();
    }
  });
});


// Add event listeners for drag and drop
$('#to-do-list').on('dragstart', 'li', function(event) {
  event.originalEvent.dataTransfer.setData('text/plain', $(this).data('index'));
});

$('#to-do-list').on('dragover', 'li', function(event) {
  event.preventDefault();
});

$('#to-do-list').on('drop', 'li', function(event) {
  event.preventDefault();
  const sourceIndex = parseInt(event.originalEvent.dataTransfer.getData('text/plain'));
  const targetIndex = $(this).data('index');
  if (sourceIndex !== targetIndex) {
    toDoList.splice(targetIndex, 0, toDoList.splice(sourceIndex, 1)[0]);
    updateList();
  }
});