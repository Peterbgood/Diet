// Initialize an empty array to store the selected items
var selectedItems = [];

// Array of button labels
var buttonLabels = [
  // Beverages
  'Beverages ',
  'Water', 'Seltzer', 'Coffee', 'Gatorade', 'Beer',
  '\n', // Newline character for line break
  
  // Dairy
  'Dairy ',
  'Cream', 'Mozzarella', 'Yogurt', 'Feta', 'Milk',
  '\n', // Newline character for line break
  
  // Meat/Protein
  'Meat ',
  'Steak', 'Chicken', 'Egg', 'Pork', 'Hamburgers', 'Hotdogs', 'Kielbasa', 'Hamburg',
  '\n', // Newline character for line break
  
  // Fruits
  'Fruits ',
  'Bananas', 'Blue Berries', 'Strawberries', 'Water Melon', 'Peach',
  '\n', // Newline character for line break
  
  // Vegetables
  'Vegetables ',
  'Cucumber', 'Beans', 'Tomatoes', 'Cesar Salad', 'Broccoli',
  '\n', // Newline character for line break
  
  // Grains
  'Grains ',
  'Rice', 'Bread', 'Spagetti',
  '\n', // Newline character for line break
  
  // Sweets
  'Sweets ',
  'Chocolate', 'Skittles', 'Chips',
  '\n', // Newline character for line break
  
  // Miscellaneous Food
  'Miscellaneous Food ',
  'Takis', 'Splenda', 'Atkins',
  '\n', // Newline character for line break
  
  // Non-Food Items
  'Non-Food Items ',
  'Money', 'Hand Soap', 'Dish Soap', 'Trash Bags', 'Lottery'
];

// Function to generate buttons dynamically
function generateButtons() {
    var buttonsContainer = document.getElementById('buttons');
    buttonLabels.forEach(function(label) {
        if (label === '\n') {
            // Create a line break
            var hr = document.createElement('hr');
            buttonsContainer.appendChild(hr);
        } else if (label.endsWith(' ')) {
            // Create a heading
            var heading = document.createElement('h4');
            heading.textContent = label;
            buttonsContainer.appendChild(heading);
        } else {
            // Create a button
            var button = document.createElement('button');
            button.className = 'btn btn-outline-secondary m-1 btn-sm';
            button.textContent = label;
            button.onclick = function() {
                addToLog(label);
            };
            buttonsContainer.appendChild(button);
        }
    });
}

// Function to add an item to the log
function addToLog(item) {
    selectedItems.push({ name: item, selected: false });
    saveToLocalStorage();
    updateLog();
}

// Function to delete an item from the log
function deleteItem(index) {
    selectedItems.splice(index, 1);
    saveToLocalStorage();
    updateLog();
}

// Function to reset the log
function resetLog() {
    selectedItems = [];
    saveToLocalStorage();
    updateLog();
}

// Function to update the log display
function updateLog() {
    var logList = document.getElementById("log-list");
    logList.innerHTML = "";
    for (var i = 0; i < selectedItems.length; i++) {
        var li = document.createElement("li");
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.textContent = selectedItems[i].name;
        if (selectedItems[i].selected) {
            li.classList.add('selected');
        }
        li.onclick = function(index) {
            return function() {
                // Toggle the 'selected' class
                this.classList.toggle('selected');
                // Toggle the 'selected' state in the array
                selectedItems[index].selected = !selectedItems[index].selected;
                saveToLocalStorage();
            }
        }(i);
        var deleteButton = document.createElement("button");
        deleteButton.className = 'btn btn-danger btn-sm';
        deleteButton.onclick = function(index) {
            return function() {
                deleteItem(index);
            }
        }(i);
        deleteButton.textContent = "Delete";
        li.appendChild(deleteButton);
        logList.appendChild(li);
    }
}

// Function to save the selected items to local storage
function saveToLocalStorage() {
    localStorage.setItem("selectedItems", JSON.stringify(selectedItems));
}

// Function to load the selected items from local storage
function loadFromLocalStorage() {
    var storedItems = localStorage.getItem("selectedItems");
    if (storedItems) {
        selectedItems = JSON.parse(storedItems);
        updateLog();
    }
}

// Get the input field element
var inputField = document.getElementById('new-item');

// Add an event listener to the input field
inputField.addEventListener('keypress', function(event) {
    // Check if the Enter key was pressed
    if (event.key === 'Enter') {
        // Call the addToLog function with the input field value
        addToLog(inputField.value);
        // Clear the input field value
        inputField.value = '';
    }
});

// Load selected items from local storage when the page loads
window.onload = function() {
    loadFromLocalStorage();
    generateButtons();
}