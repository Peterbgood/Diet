 
let chart;
let data = {
    totalCaloriesUsed: 0,
    remainingCalories: 1600
};
let currentDate = new Date();
let foodLog = {};

// Function to save data to local storage
function saveData() {
    const dateStr = currentDate.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'America/New_York',
    });

    const foodListElement = document.getElementById('food-list');
    const foodItems = foodListElement.children;

    foodLog[dateStr] = [];

    Array.from(foodItems).forEach(item => {
        const name = item.children[0].textContent;
        const calories = parseInt(item.children[1].textContent);

        foodLog[dateStr].push({ name, calories });
    });

    localStorage.setItem('foodLog', JSON.stringify(foodLog));
    localStorage.setItem('currentDate', dateStr);
}

// Function to load data from local storage
function loadData() {
    const storedFoodLog = localStorage.getItem('foodLog');
    const storedCurrentDate = localStorage.getItem('currentDate');

    if (storedFoodLog && storedCurrentDate) {
        try {
            foodLog = JSON.parse(storedFoodLog);
            // Load stored date but default to today's date
            currentDate = new Date();
            updateUI();
        } catch (error) {
            console.error('Error parsing stored data:', error);
            foodLog = {};
            currentDate = new Date();
            saveData();
        }
    } else {
        foodLog = {};
        currentDate = new Date();
        saveData();
    }
}

// Load data from local storage on page load
loadData();

// Function to update UI
function updateUI() {
    updateTotalCalories();
    updateFoodList();
    renderCaloriesChart();
    displayCurrentDate();
}

// Function to update total calories
function updateTotalCalories() {
    const dateStr = currentDate.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'America/New_York',
    });
    const totalCalories = foodLog[dateStr] ? foodLog[dateStr].reduce((acc, item) => acc + item.calories, 0) : 0;
    const remainingCalories = 1600 - totalCalories;

    document.getElementById('total-calories').innerText = totalCalories;
    document.getElementById('remaining-calories').innerText = remainingCalories;

    data = {
        totalCaloriesUsed: totalCalories,
        remainingCalories: remainingCalories
    };
}

// Function to update food list
function updateFoodList() {
    const dateStr = currentDate.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'America/New_York',
    });
    const foodListElement = document.getElementById('food-list');
    foodListElement.innerHTML = '';

    if (foodLog[dateStr]) {
        // Separate burnt calories
        const burntCalories = foodLog[dateStr].filter(entry => entry.calories < 0);
        const otherCalories = foodLog[dateStr].filter(entry => entry.calories >= 0);

        // Display other calories first
        otherCalories.forEach((entry, index) => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between');

            const upButton = document.createElement('button');
            upButton.classList.add('btn', 'btn-sm', 'btn-success', 'me-2');
            upButton.textContent = 'Up';
            upButton.addEventListener('click', () => {
                if (index > 0) {
                    const temp = foodLog[dateStr][index];
                    foodLog[dateStr][index] = foodLog[dateStr][index - 1];
                    foodLog[dateStr][index - 1] = temp;
                    updateFoodList();
                }
            });

            const nameSpan = document.createElement('span');
            nameSpan.contentEditable = 'true


