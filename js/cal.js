let chart;
let data = {
    totalCaloriesUsed: 0,
    remainingCalories: 1450 // Default to 1450; adjusted by day
};
let currentDate = new Date();
let foodLog = {};

// Function to get the calorie limit based on the day of the week
function getCalorieLimit(date) {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    return (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) ? 2050 : 1450;
}

// Function to get the current date string
function getDateString(date) {
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'America/New_York',
    });
}

// Function to save data to local storage
function saveData() {
    const dateStr = getDateString(currentDate);
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
    localStorage.setItem(`fourMileRun_${dateStr}`, document.getElementById('fourMileRunCheckbox').checked);
}

// Function to load data from local storage
function loadData() {
    const storedFoodLog = localStorage.getItem('foodLog');

    if (storedFoodLog) {
        try {
            foodLog = JSON.parse(storedFoodLog);
        } catch (error) {
            console.error('Error parsing stored food log:', error);
            foodLog = {};
        }
    } else {
        foodLog = {};
    }

    // Always start with today's date on load/refresh
    currentDate = new Date();
    const dateStr = getDateString(currentDate);
    const runCompleted = localStorage.getItem(`fourMileRun_${dateStr}`) === 'true';
    document.getElementById('fourMileRunCheckbox').checked = runCompleted;
    updateUI();
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
    const dateStr = getDateString(currentDate);
    const totalCalories = foodLog[dateStr] ? foodLog[dateStr].reduce((acc, item) => acc + item.calories, 0) : 0;
    const calorieLimit = getCalorieLimit(currentDate);
    const remainingCalories = calorieLimit - totalCalories;

    const totalCaloriesText = document.querySelector('.text-primary');
    const totalCaloriesBadge = document.getElementById('total-calories');
    const remainingCaloriesText = document.querySelector('.text-success');
    const remainingCaloriesBadge = document.getElementById('remaining-calories');

    totalCaloriesBadge.innerText = totalCalories;
    remainingCaloriesBadge.innerText = remainingCalories;

    // Update text colors
    totalCaloriesText.style.color = '#1E90FF'; // Dodger blue
    remainingCaloriesText.style.color = remainingCalories < 0 ? '#FF4500' : '#40E0D0'; // Orange red if over limit, else turquoise
    remainingCaloriesBadge.className = remainingCalories < 0 ? 'badge bg-danger' : 'badge bg-success'; // Switch to red gradient if over limit

    data = {
        totalCaloriesUsed: totalCalories,
        remainingCalories: remainingCalories
    };
}

// Function to update food list
function updateFoodList() {
    const dateStr = getDateString(currentDate);
    const foodListElement = document.getElementById('food-list');
    foodListElement.innerHTML = '';
  
    if (foodLog[dateStr]) {
        const burntCalories = foodLog[dateStr].filter(entry => entry.calories < 0);
        const coffeeItems = foodLog[dateStr].filter(entry => entry.name.toLowerCase().includes('coffee') && entry.calories >= 0);
        const otherCalories = foodLog[dateStr].filter(entry => !entry.name.toLowerCase().includes('coffee') && entry.calories >= 0);

        const createListItem = (entry) => {
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
                        if (item.name === entry.name && item.calories === entry.calories) {
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
                caloriesSpan.style.color = '#2F4F4F'; // Dark slate gray for burnt calories
            }

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('btn', 'btn-sm', 'btn-danger');
            deleteButton.innerHTML = '<i class="bi bi-trash"></i>';

            deleteButton.addEventListener('click', () => {
                foodLog[dateStr] = foodLog[dateStr].filter(item => !(item.name === entry.name && item.calories === entry.calories));
                updateFoodList();
                updateTotalCalories();
                renderCaloriesChart();
                saveData();
            });

            listItem.appendChild(nameSpan);
            listItem.appendChild(caloriesSpan);
            listItem.appendChild(deleteButton);
            return listItem;
        };

        coffeeItems.reverse().forEach(entry => foodListElement.appendChild(createListItem(entry)));
        otherCalories.forEach(entry => foodListElement.appendChild(createListItem(entry)));
        burntCalories.forEach(entry => foodListElement.appendChild(createListItem(entry)));
    }
}

// Function to render calories chart
function renderCaloriesChart() {
    const ctx = document.getElementById('caloriesChart').getContext('2d');
    let totalCaloriesUsed = data.totalCaloriesUsed;
    let remainingCalories = data.remainingCalories;
    const calorieLimit = getCalorieLimit(currentDate);
  
    if (totalCaloriesUsed < 0) {
        totalCaloriesUsed = 0;
        remainingCalories = calorieLimit;
    }
  
    const chartColors = {
        used: {
            backgroundColor: ctx => {
                const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, '#1E90FF');
                gradient.addColorStop(1, '#00CED1');
                return gradient;
            },
            borderColor: '#fff'
        },
        remaining: {
            backgroundColor: ctx => {
                const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, '#E0FFFF');
                gradient.addColorStop(1, '#40E0D0');
                return gradient;
            },
            borderColor: '#fff'
        },
        overLimit: {
            backgroundColor: ctx => {
                const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, '#FF4500');
                gradient.addColorStop(1, '#FF6347');
                return gradient;
            },
            borderColor: '#fff'
        }
    };
  
    let chartColorsUsed;
    if (totalCaloriesUsed >= calorieLimit) {
        chartColorsUsed = [chartColors.overLimit];
        totalCaloriesUsed = calorieLimit;
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
        const dateStr = getDateString(currentDate);
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
    const dateStr = getDateString(currentDate);
    const runCompleted = localStorage.getItem(`fourMileRun_${dateStr}`) === 'true';
    document.getElementById('fourMileRunCheckbox').checked = runCompleted;
    updateUI();
    saveData();
});

// Add event listener to next date button
document.getElementById('next-date-button').addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 1);
    const dateStr = getDateString(currentDate);
    const runCompleted = localStorage.getItem(`fourMileRun_${dateStr}`) === 'true';
    document.getElementById('fourMileRunCheckbox').checked = runCompleted;
    updateUI();
    saveData();
});

// Add event listener to food list for editing names
document.getElementById('food-list').addEventListener('input', () => {
    saveData();
});

// Add event listener to 4-mile run checkbox
document.getElementById('fourMileRunCheckbox').addEventListener('change', () => {
    saveData(); // Save checkbox state to localStorage without updating calories
});

// Initialize UI
updateUI();