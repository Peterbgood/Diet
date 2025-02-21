document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const elements = {
    calorieInput: document.getElementById('calorie-input'),
    addBtn: document.getElementById('add-btn'),
    resetBtn: document.getElementById('reset-btn'),
    calorieList: document.getElementById('calorie-list'),
    totalCalories: document.getElementById('total-calories'),
    weeklyTotal: document.getElementById('weekly-total'),
    totalSaved: document.getElementById('total-saved'),
    barChartCanvas: document.getElementById('PieChart'), // Renamed for clarity
    prevWeekBtn: document.getElementById('prev-week-btn'),
    nextWeekBtn: document.getElementById('next-week-btn'),
  };

  // Check for missing elements
  if (Object.values(elements).some(el => !el)) {
    console.error('One or more DOM elements are missing.');
    return;
  }

  // Constants
  const TOTAL_WEEKLY_CALORIES = 11200;
  const DAILY_CALORIES_ALLOWED = 1600;
  const DAYS_PER_WEEK = 7;
  const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // State
  let weeks = [];
  let currentWeekIndex = 0;
  let chart;

  // Local Storage
  const storage = window.localStorage;

  // Initialize from storage or defaults
  function initialize() {
    try {
      weeks = JSON.parse(storage.getItem('weeks')) || [[]];
      currentWeekIndex = parseInt(storage.getItem('currentWeekIndex')) || 0;
      if (!Array.isArray(weeks) || currentWeekIndex < 0 || currentWeekIndex >= weeks.length) {
        weeks = [[]];
        currentWeekIndex = 0;
      }
    } catch (e) {
      console.warn('Corrupted data in localStorage, resetting.');
      weeks = [[]];
      currentWeekIndex = 0;
    }
    updateUI();
  }

  // Event Listeners
  elements.addBtn.addEventListener('click', addCalorie);
  elements.resetBtn.addEventListener('click', resetCurrentWeek);
  elements.prevWeekBtn.addEventListener('click', prevWeek);
  elements.nextWeekBtn.addEventListener('click', nextWeek);
  elements.calorieInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addCalorie();
  });
  elements.calorieList.addEventListener('click', (e) => {
    const btn = e.target.closest('.delete-btn');
    if (btn) deleteEntry(parseInt(btn.dataset.index));
  });

  // Add a calorie entry
  function addCalorie() {
    const calorieAmount = parseInt(elements.calorieInput.value);
    if (isNaN(calorieAmount) || calorieAmount <= 0) {
      alert('Please enter a valid positive calorie amount.');
      return;
    }
    if (weeks[currentWeekIndex].length >= DAYS_PER_WEEK) {
      alert('This week is full. Move to the next week to add more entries.');
      return;
    }
    weeks[currentWeekIndex].push(calorieAmount);
    elements.calorieInput.value = '';
    updateUI();
    saveToLocalStorage();
  }

  // Delete an entry
  function deleteEntry(index) {
    if (index >= 0 && index < weeks[currentWeekIndex].length) {
      weeks[currentWeekIndex].splice(index, 1);
      updateUI();
      saveToLocalStorage();
    }
  }

  // Reset current week's data
  function resetCurrentWeek() {
    if (confirm('Are you sure you want to reset this week’s data?')) {
      weeks[currentWeekIndex] = [];
      updateUI();
      saveToLocalStorage();
    }
  }

  // Navigate to previous week
  function prevWeek() {
    if (currentWeekIndex > 0) {
      currentWeekIndex--;
      updateUI();
      saveToLocalStorage();
    }
  }

  // Navigate to next week
  function nextWeek() {
    if (currentWeekIndex < weeks.length - 1) {
      currentWeekIndex++;
    } else {
      weeks.push([]);
      currentWeekIndex++;
    }
    updateUI();
    saveToLocalStorage();
  }

  // Update all UI components
  function updateUI() {
    updateWeekList();
    updateTotals();
    updateChart();
    updateNavigationButtons();
  }

  // Update the calorie list
  function updateWeekList() {
    const currentWeek = weeks[currentWeekIndex];
    elements.calorieList.innerHTML = currentWeek.map((entry, index) => {
      const caloriesSaved = DAILY_CALORIES_ALLOWED - entry;
      const color = caloriesSaved >= 0 ? '#007bff' : 'red';
      return `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          ${DAYS_OF_WEEK[index]}: ${entry} cals 
          <span style="color: ${color}">(${Math.abs(caloriesSaved)} cals)</span>
          <button class="delete-btn btn btn-danger btn-sm" data-index="${index}">
            <i class="bi bi-trash"></i>
          </button>
        </li>
      `;
    }).join('');
  }

  // Update all totals
  function updateTotals() {
    const currentWeek = weeks[currentWeekIndex];
    const totalConsumed = currentWeek.reduce((a, b) => a + b, 0);
    const remainingCalories = TOTAL_WEEKLY_CALORIES - totalConsumed;
    let totalSavedCalories = 0;
    currentWeek.forEach(entry => {
      const dailySaved = DAILY_CALORIES_ALLOWED - entry;
      totalSavedCalories += dailySaved;
    });

    elements.totalCalories.textContent = `Total Remaining: ${remainingCalories}`;
    elements.weeklyTotal.textContent = `Total Consumed: ${totalConsumed}`;
    elements.totalSaved.textContent = `Total Saved: ${totalSavedCalories}`;
  }

  // Update the bar chart
  function updateChart() {
    if (chart) chart.destroy();
    const ctx = elements.barChartCanvas.getContext('2d');
    const chartEntries = weeks[currentWeekIndex].concat(Array(DAYS_PER_WEEK - weeks[currentWeekIndex].length).fill(0));

    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: DAYS_OF_WEEK,
        datasets: [{
          label: 'Calories Consumed',
          data: chartEntries,
          backgroundColor: chartEntries.map(entry => entry > DAILY_CALORIES_ALLOWED ? 'rgba(220, 53, 69, 0.2)' : 'rgba(0, 123, 255, 0.2)'),
          borderColor: chartEntries.map(entry => entry > DAILY_CALORIES_ALLOWED ? '#dc3545' : '#007bff'),
          borderWidth: { top: 2, right: 2, left: 2, bottom: 0 },
        }]
      },
      options: {
        scales: {
          y: { max: 3000, beginAtZero: true },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => `${context.raw} cals (Limit: ${DAILY_CALORIES_ALLOWED})`,
            },
          },
        },
      },
    });
  }

  // Update navigation button states
  function updateNavigationButtons() {
    elements.prevWeekBtn.disabled = currentWeekIndex === 0;
    elements.nextWeekBtn.disabled = false; // Always enabled to allow adding new weeks
  }

  // Save to local storage
  function saveToLocalStorage() {
    storage.setItem('weeks', JSON.stringify(weeks));
    storage.setItem('currentWeekIndex', currentWeekIndex.toString());
  }

  // Initialize the app
  initialize();
});