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
    prevDateButton: document.getElementById('prev-date-button'),
    nextDateButton: document.getElementById('next-date-button'),
    dateInput: document.getElementById('date-input'),
  };

  if (Object.values(elements).some(el => !el)) {
    console.error('One or more DOM elements are missing.');
    return;
  }

  // Constants
  const TOTAL_WEEKLY_CALORIES = 10500; // 1500 * 7 = 10500
  const DAILY_MAXIMUMS = Array(7).fill(1500); // 1500 for all days
  const DAYS_PER_WEEK = 7;
  const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const MS_PER_WEEK = MS_PER_DAY * DAYS_PER_WEEK;

  // State
  let weeks = [];
  let currentWeekIndex = 0;
  let chart;

  const startDate = new Date('2025-01-06');
  startDate.setHours(0, 0, 0, 0);

  const storage = window.localStorage;

  function initialize() {
    try {
      weeks = JSON.parse(storage.getItem('weeks')) || [];
      if (!Array.isArray(weeks)) weeks = [];
    } catch (e) {
      console.warn('Corrupted data in localStorage, resetting.');
      weeks = [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay() || 7;
    const daysSinceMonday = dayOfWeek - 1;
    const currentMonday = new Date(today.getTime() - daysSinceMonday * MS_PER_DAY);
    const daysSinceStart = Math.floor((currentMonday - startDate) / MS_PER_DAY);
    currentWeekIndex = Math.max(0, Math.floor(daysSinceStart / DAYS_PER_WEEK));

    while (weeks.length <= currentWeekIndex) {
      weeks.push([]);
    }

    updateUI();
    saveToLocalStorage();
  }

  elements.addBtn.addEventListener('click', addCalorie);
  elements.resetBtn.addEventListener('click', resetCurrentWeek);
  elements.prevDateButton.addEventListener('click', prevWeek);
  elements.nextDateButton.addEventListener('click', nextWeek);
  elements.calorieInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addCalorie();
  });
  elements.calorieList.addEventListener('click', (e) => {
    const btn = e.target.closest('.delete-btn');
    if (btn) deleteEntry(parseInt(btn.dataset.index));
  });

  function addCalorie() {
    const calorieAmount = parseInt(elements.calorieInput.value);
    if (isNaN(calorieAmount) || calorieAmount <= 0) {
      alert('Please enter a valid positive calorie amount.');
      return;
    }
    const currentDayIndex = weeks[currentWeekIndex].length;
    if (currentDayIndex >= DAYS_PER_WEEK) {
      alert('This week is full. Move to the next week to add more entries.');
      return;
    }
    weeks[currentWeekIndex].push(calorieAmount);
    elements.calorieInput.value = '';
    updateUI();
    saveToLocalStorage();
  }

  function deleteEntry(index) {
    if (index >= 0 && index < weeks[currentWeekIndex].length) {
      weeks[currentWeekIndex].splice(index, 1);
      updateUI();
      saveToLocalStorage();
    }
  }

  function resetCurrentWeek() {
    if (confirm('Are you sure you want to reset this week’s data?')) {
      weeks[currentWeekIndex] = [];
      updateUI();
      saveToLocalStorage();
    }
  }

  function prevWeek() {
    if (currentWeekIndex > 0) {
      currentWeekIndex--;
      updateUI();
      saveToLocalStorage();
    }
  }

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

  function updateUI() {
    updateWeekList();
    updateTotals();
    updateChart();
    updateNavigationButtons();
    updateWeekDateRange();
  }

  function updateWeekList() {
    const currentWeek = weeks[currentWeekIndex];
    elements.calorieList.innerHTML = currentWeek.map((entry, index) => {
      const caloriesSaved = DAILY_MAXIMUMS[index] - entry;
      const color = caloriesSaved >= 0 ? '#4B5EAA' : '#C0392B'; // Muted blue for saved, bold red for over-limit
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

  function updateTotals() {
    const currentWeek = weeks[currentWeekIndex];
    const totalConsumed = currentWeek.reduce((a, b) => a + b, 0);
    const daysFilled = currentWeek.length;
    const remainingCalories = TOTAL_WEEKLY_CALORIES - totalConsumed;
    let totalSavedCalories = 0;
    currentWeek.forEach((entry, index) => {
      const dailySaved = DAILY_MAXIMUMS[index] - entry;
      totalSavedCalories += dailySaved;
    });

    elements.totalCalories.textContent = `Total Remaining: ${remainingCalories}`;
    elements.weeklyTotal.textContent = `Total Consumed: ${totalConsumed}`;
    elements.totalSaved.textContent = `Total Saved: ${totalSavedCalories}`;
  }

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
          backgroundColor: chartEntries.map((entry, index) => entry > DAILY_MAXIMUMS[index] ? 'rgba(192, 57, 43, 0.6)' : 'rgba(43, 74, 140, 0.6)'), // Semi-transparent red for over-limit, blue for consumed
          borderColor: chartEntries.map((entry, index) => entry > DAILY_MAXIMUMS[index] ? 'rgba(192, 57, 43, 0.6)' : 'rgba(43, 74, 140, 0.6)'), // Match border to background
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
              label: (context) => `${context.raw} cals (Limit: ${DAILY_MAXIMUMS[context.dataIndex]})`,
            },
          },
        },
      },
    });
  }

  function updateNavigationButtons() {
    elements.prevDateButton.disabled = currentWeekIndex === 0;
    elements.nextDateButton.disabled = false;
  }

  function updateWeekDateRange() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay() || 7;
    const daysSinceMonday = dayOfWeek - 1;
    const baseMonday = new Date(today.getTime() - daysSinceMonday * MS_PER_DAY);
    const weekStart = new Date(baseMonday.getTime() + (currentWeekIndex - Math.floor((today - startDate) / MS_PER_WEEK)) * MS_PER_WEEK);
    const weekEnd = new Date(weekStart.getTime() + (DAYS_PER_WEEK - 1) * MS_PER_DAY);
    const formatDate = (date) => `${date.getMonth() + 1}/${date.getDate()}`;
    elements.dateInput.value = `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
  }

  function saveToLocalStorage() {
    storage.setItem('weeks', JSON.stringify(weeks));
    storage.setItem('currentWeekIndex', currentWeekIndex.toString());
  }

  initialize();
});
