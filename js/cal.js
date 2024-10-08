let chart;
let data = {
    totalCaloriesUsed: 0,
    remainingCalories: 1700
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
    const remainingCalories = 1700 - totalCalories;

    document.getElementById('total-calories').innerText = totalCalories;
    document.getElementById('remaining-calories').innerText = remainingCalories;

    data = {
        totalCaloriesUsed: totalCalories,
        remainingCalories: remainingCalories
    };
}

// Function to update food list
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
        foodLog[dateStr].forEach(entry => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between');

            const nameSpan = document.createElement('span');
            nameSpan.contentEditable = 'true';
            nameSpan.classList.add('form-control'); // Add form-control class
            nameSpan.textContent = entry.name;

            // Add event listener to update food item name on Enter key press
            nameSpan.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const newName = nameSpan.textContent;
                    foodLog[dateStr] = foodLog[dateStr].map(item => {
                        if (item.name === entry.name) {
                            item.name = newName;
                        }
                        return item;
                    });
                    updateFoodList();
                    saveData();
                }
            });

            const caloriesSpan = document.createElement('span');
            caloriesSpan.textContent = `${entry.calories} calories`;

            // Change color for negative calories
            if (entry.calories < 0) {
                caloriesSpan.style.color = '#964B00';
            }

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('btn', 'btn-sm', 'btn-danger');
            deleteButton.textContent = 'Delete';

            deleteButton.addEventListener('click', () => {
                foodLog[dateStr] = foodLog[dateStr].filter(item => item.name !== entry.name);
                updateFoodList();
                updateTotalCalories();
                renderCaloriesChart();
                saveData();
            });

            listItem.appendChild(nameSpan);
            listItem.appendChild(caloriesSpan);
            listItem.appendChild(deleteButton);
            foodListElement.appendChild(listItem);
        });
    }
}
// Function to render calories chart
function renderCaloriesChart() {
    const ctx = document.getElementById('caloriesChart').getContext('2d');
    let totalCaloriesUsed = data.totalCaloriesUsed;
    let remainingCalories = data.remainingCalories;

    if (totalCaloriesUsed < 0) {
        totalCaloriesUsed = 0;
        remainingCalories = 1700;
    }

    let backgroundColor;
    let borderColor;
    if (totalCaloriesUsed >= 1700) {
        backgroundColor = ['red'];
        borderColor = ['#fff', '#fff'];
        totalCaloriesUsed = 1700;
        remainingCalories = 0;
    } else {
        backgroundColor = ['#452B1F', '#964B00'];
        borderColor = ['#fff', '#fff'];
    }

    if (!chart) {
        chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Calories Used', 'Remaining Calories'],
                datasets: [{
                    data: [totalCaloriesUsed, remainingCalories],
                    backgroundColor: backgroundColor,
                    borderColor: borderColor,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                if (context.label === 'Calories Used') {
                                    return `Calories Used: ${data.totalCaloriesUsed}`;
                                } else if (context.label === 'Remaining Calories') {
                                    return `Remaining Calories: ${data.remainingCalories}`;
                                }
                            }
                        }
                    }
                }
            }
        });
    } else {
        chart.data.datasets[0].data[0] = totalCaloriesUsed;
        chart.data.datasets[0].data[1] = remainingCalories;
        chart.data.datasets[0].backgroundColor = backgroundColor;
        chart.data.datasets[0].borderColor = borderColor;
        chart.update();
    }
}

// Function to display current date
function displayCurrentDate() {
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'America/New_York',
    };

    const formatter = new Intl.DateTimeFormat('en-US', options);
    document.getElementById('date-input').value = formatter.format(currentDate);
}

// Add event listener to calorie buttons
document.querySelectorAll('.add-calorie-button').forEach(button => {
    button.addEventListener('click', () => {
        const dateStr = currentDate.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: 'America/New_York',
        });
        const calories = parseInt(button.dataset.calories);
        const name = button.dataset.name;

        if (!foodLog[dateStr]) {
            foodLog[dateStr] = [];
        }

        // Check if food already exists
        const existingFoodIndex = foodLog[dateStr].findIndex(entry => entry.name === name);
        if (existingFoodIndex !== -1) {
            foodLog[dateStr][existingFoodIndex].calories += calories;
        } else {
            foodLog[dateStr].push({ name, calories });
        }

        updateUI();
        saveData();
    });
});

// Add event listener to previous date button
document.getElementById('prev-date-button').addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 1);
    updateUI();
    saveData();
});

// Add event listener to next date button
document.getElementById('next-date-button').addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 1);
    updateUI();
    saveData();
});

// Add event listener to food list for editing names
document.getElementById('food-list').addEventListener('input', () => {
    saveData();
});

// Initialize UI
updateUI();
