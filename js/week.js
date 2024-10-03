const calorieInput = document.getElementById('calorie-input');
const addBtn = document.getElementById('add-btn');
const resetBtn = document.getElementById('reset-btn');
const calorieList = document.getElementById('calorie-list');
const totalCalories = document.getElementById('total-calories');
const weeklyTotal = document.getElementById('weekly-total');
const totalSaved = document.getElementById('total-saved');
const pieChartCanvas = document.getElementById('PieChart');

let calories = 11900;
let entries = [];
let totalConsumed = 0;

const storage = window.localStorage;

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Retrieve data from local storage
if (storage.getItem('entries')) {
  entries = JSON.parse(storage.getItem('entries'));
  updateList();
}
if (storage.getItem('calories')) {
  calories = parseInt(storage.getItem('calories'));
  updateTotal();
}
if (storage.getItem('totalConsumed')) {
  totalConsumed = parseInt(storage.getItem('totalConsumed'));
  updateWeeklyTotal();
}

addBtn.addEventListener('click', addCalorie);
resetBtn.addEventListener('click', resetCalories);

calorieInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    addCalorie();
  }
});

function addCalorie() {
  const calorieAmount = parseInt(calorieInput.value);
  if (calorieAmount && entries.length < 7) {
    entries.push(calorieAmount);
    calories -= calorieAmount;
    totalConsumed += calorieAmount;
    updateList();
    updateTotal();
    updateWeeklyTotal();
    updateTotalSaved();
    updatePieChart();
    saveToLocalStorage();
    calorieInput.value = '';
  }
}

function resetCalories() {
  calories = 11900;
  entries = [];
  totalConsumed = 0;
  updateList();
  updateTotal();
  updateWeeklyTotal();
  updateTotalSaved();
  updatePieChart();
  saveToLocalStorage();
}

function updateList() {
  const listHtml = entries.map((entry, index) => {
    const dailyAllowed = 1700;
    const caloriesSaved = dailyAllowed - entry;
    const color = caloriesSaved >= 0 ? '#452B1F' : 'red';
    return `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        ${daysOfWeek[index]}: ${entry} cals 
        <span style="color: ${color}">(${Math.abs(caloriesSaved)} cals)</span>
        <button class="delete-btn btn btn-danger btn-sm" data-index="${index}">Delete</button>
      </li>
    `;
  }).join('');
  calorieList.innerHTML = listHtml;
  const deleteBtns = document.querySelectorAll('.delete-btn');
  deleteBtns.forEach((btn) => {
    btn.addEventListener('click', deleteEntry);
  });
}

function deleteEntry(event) {
  const index = event.target.dataset.index;
  const deletedAmount = entries.splice(index, 1)[0];
  calories += deletedAmount; 
  totalConsumed -= deletedAmount;
  updateList();
  updateTotal();
  updateWeeklyTotal();
  updateTotalSaved();
  updatePieChart();
  saveToLocalStorage();
}

function updateTotal() {
  totalCalories.textContent = `Remaining Calories: ${calories}`;
}

function updateWeeklyTotal() {
  weeklyTotal.textContent = `Total Calories Consumed: ${totalConsumed}`;
}

function updateTotalSaved() {
  const totalAllowed = 1700 * entries.length;
  const totalSavedCalories = totalAllowed - totalConsumed;
  totalSaved.textContent = `Total Calories Saved: ${totalSavedCalories}`;
}

function updatePieChart() {
  if (window.chart) {
    window.chart.destroy();
  }
  const ctx = pieChartCanvas.getContext('2d');

  // Fill the entries array with zeros if it's not full
  const chartEntries = entries.concat(Array(7 - entries.length).fill(0));

  window.chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: daysOfWeek,
      datasets: [{
        label: 'Calories Consumed',
        data: chartEntries,
        backgroundColor: chartEntries.map(entry => entry > 1700 ? 'rgba(255, 99, 132, 0.2)' : 'rgba(13, 202, 240, 0.1)'),
        borderColor: chartEntries.map(entry => entry > 1700 ? '#964B00)' : '#452B1F), // match border color with background color
        borderWidth: {
          top: 2,
          right: 2,
          left: 2,
          bottom: 0 // no bottom border
        },
      }]
    },
    options: {
      scales: {
        y: {
          max: 3000 // set max limit of graph
        }
      }
    }
  });
}

function saveToLocalStorage() {
  storage.setItem('entries', JSON.stringify(entries));
  storage.setItem('calories', calories.toString());
  storage.setItem('totalConsumed', totalConsumed.toString());
}

// Retrieve data from local storage
if (storage.getItem('entries')) {
  entries = JSON.parse(storage.getItem('entries'));
  updateList();
}
if (storage.getItem('calories')) {
  calories = parseInt(storage.getItem('calories'));
  updateTotal();
}
if (storage.getItem('totalConsumed')) {
  totalConsumed = parseInt(storage.getItem('totalConsumed'));
  updateWeeklyTotal();
}

updatePieChart();

updateList();

updateTotalSaved();
