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

    const totalCaloriesText = document.querySelector('.text-primary');
    const totalCaloriesBadge = document.getElementById('total-calories');
    const remainingCaloriesText = document.querySelector('.text-success');
    const remainingCaloriesBadge = document.getElementById('remaining-calories');

    totalCaloriesBadge.innerText = totalCalories;
    remainingCaloriesBadge.innerText = remainingCalories;

    // Update text colors
    totalCaloriesText.style.color = '#8e44ad'; // Purple from gradient start
    remainingCaloriesText.style.color = remainingCalories < 0 ? '#ff0000' : '#b39ddb'; // Bright red if over 1600, else medium purple-gray
    remainingCaloriesBadge.className = remainingCalories < 0 ? 'badge bg-danger' : 'badge bg-success'; // Switch to red gradient if over 1600

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
        const burntCalories = foodLog[dateStr].filter(entry => entry.calories < 0);
        const coffeeItems = foodLog[dateStr].filter(entry => entry.name.includes('☕') && entry.calories >= 0);
        const otherCalories = foodLog[dateStr].filter(entry => !entry.name.includes('☕') && entry.calories >= 0);
  
        coffeeItems.forEach(entry => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between');
  
            const nameSpan = document.createElement('span');
            nameSpan.contentEditable = 'true';
            nameSpan.classList.add('form-control'); 
            nameSpan.textContent = entry.name;
  
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
            caloriesSpan.textContent = `${entry.calories}`;
  
            if (entry.calories < 0) {
                caloriesSpan.style.color = '#964B00';
            }
  
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('btn', 'btn-sm', 'btn-danger');
            deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
  
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
  
        otherCalories.forEach(entry => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between');
  
            const nameSpan = document.createElement('span');
            nameSpan.contentEditable = 'true';
            nameSpan.classList.add('form-control'); 
            nameSpan.textContent = entry.name;
  
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
            caloriesSpan.textContent = `${entry.calories}`;
  
            if (entry.calories < 0) {
                caloriesSpan.style.color = '#964B00';
            }
  
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('btn', 'btn-sm', 'btn-danger');
            deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
  
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
  
        burntCalories.forEach(entry => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between');
  
            const nameSpan = document.createElement('span');
            nameSpan.contentEditable = 'true';
            nameSpan.classList.add('form-control'); 
            nameSpan.textContent = entry.name;
  
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
            caloriesSpan.textContent = `${entry.calories}`;
            caloriesSpan.style.color = '#0d6efd';
  
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('btn', 'btn-sm', 'btn-danger');
            deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
  
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
        remainingCalories = 1600;
    }
  
    const chartColors = {
        used: {
            backgroundColor: ctx => {
                const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, '#8e44ad');
                gradient.addColorStop(1, '#e84393');
                return gradient;
            },
            borderColor: '#fff'
        },
        remaining: {
            backgroundColor: ctx => {
                const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, '#d1c4e9');
                gradient.addColorStop(1, '#b39ddb');
                return gradient;
            },
            borderColor: '#fff'
        },
        overLimit: {
            backgroundColor: ctx => {
                const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, '#c0392b');
                gradient.addColorStop(1, '#e57373');
                return gradient;
            },
            borderColor: '#fff'
        }
    };
  
    let chartColorsUsed;
    if (totalCaloriesUsed >= 1600) {
        chartColorsUsed = [chartColors.overLimit];
        totalCaloriesUsed = 1600;
        remainingCalories = 0;
    } else {
        chartColorsUsed = [chartColors.used, chartColors.remaining];
    }
  
    if (!chart) {
        chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Calories Used', 'Remaining Calories'],
                datasets: [{
                    data: [totalCaloriesUsed, remainingCalories],
                    backgroundColor: chartColorsUsed.map(c => typeof c.backgroundColor === 'function' ? c.backgroundColor(ctx) : c.backgroundColor),
                    borderColor: chartColorsUsed.map(c => c.borderColor),
                    borderWidth: 2,
                    cutout: '50%'
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
        chart.data.datasets[0].backgroundColor = chartColorsUsed.map(c => typeof c.backgroundColor === 'function' ? c.backgroundColor(ctx) : c.backgroundColor);
        chart.data.datasets[0].borderColor = chartColorsUsed.map(c => c.borderColor);
        chart.data.datasets[0].cutout = '50%';
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