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
    barChartCanvas: document.getElementById('PieChart'),
    prevDateButton: document.getElementById('prev-date-button'), // Updated
    nextDateButton: document.getElementById('next-date-button'), // Updated
    dateInput: document.getElementById('date-input'),           // Updated
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
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const MS_PER_WEEK = MS_PER_DAY * DAYS_PER_WEEK;

  // State
  let weeks = [];
  let currentWeekIndex = 0;
  let chart;

  // Set startDate to a fixed reference Monday (January 6, 2025)
  const startDate = new Date('2025-01-06'); // First Monday of 2025
  startDate.setHours(0, 0, 0, 0);

  // Local Storage
  const storage = window.localStorage;

  // Initialize from storage and set to current week
  function initialize() {
    try {
      weeks = JSON.parse(storage.getItem('weeks')) || [];
      if (!Array.isArray(weeks)) {
        weeks = [];
      }
    } catch (e) {
      console.warn('Corrupted data in localStorage, resetting.');
      weeks = [];
    }

    // Calculate the current week index based on today’s date
    const today = new Date(); // February 20, 2025
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay() || 7; // Sunday = 7
    const daysSinceMonday = dayOfWeek - 1; // Thursday = 3
    const currentMonday = new Date(today.getTime() - daysSinceMonday * MS_PER_DAY); // Feb 17
    const daysSinceStart = Math.floor((currentMonday - startDate) / MS_PER_DAY);
    currentWeekIndex = Math.max(0, Math.floor(daysSinceStart / DAYS_PER_WEEK));

    // Ensure weeks array has enough entries up to currentWeekIndex
    while (weeks.length <= currentWeekIndex) {
      weeks.push([]);
    }

    updateUI();
    saveToLocalStorage();
  }

  // Event Listeners
  elements.addBtn.addEventListener('click', addCalorie);
  elements.resetBtn.addEventListener('click', resetCurrentWeek);
  elements.prevDateButton.addEventListener('click', prevWeek); // Updated
  elements.nextDateButton.addEventListener('click', nextWeek); // Updated
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
    updateWeekDateRange();
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
    elements.prevDateButton.disabled = currentWeekIndex === 0; // Updated
    elements.nextDateButton.disabled = false;                // Updated
  }

  // Update week date range in the input field
  function updateWeekDateRange() {
    const today = new Date(); // February 20, 2025
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay() || 7; // Sunday = 7
    const daysSinceMonday = dayOfWeek - 1; // Thursday = 3
    const baseMonday = new Date(today.getTime() - daysSinceMonday * MS_PER_DAY); // Feb 17
    const weekStart = new Date(baseMonday.getTime() + (currentWeekIndex - Math.floor((today - startDate) / MS_PER_WEEK)) * MS_PER_WEEK);
    const weekEnd = new Date(weekStart.getTime() + (DAYS_PER_WEEK - 1) * MS_PER_DAY);
    const formatDate = (date) => `${date.getMonth() + 1}/${date.getDate()}`;
    elements.dateInput.value = `${formatDate(weekStart)} - ${formatDate(weekEnd)}`; // Updated
  }

  // Save to local storage
  function saveToLocalStorage() {
    storage.setItem('weeks', JSON.stringify(weeks));
    storage.setItem('currentWeekIndex', currentWeekIndex.toString());
  }

  // Initialize the app
  initialize();
});