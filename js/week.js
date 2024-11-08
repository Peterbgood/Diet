document.addEventListener('DOMContentLoaded', () => {
  const calorieInput = document.getElementById('calorie-input');
  const addBtn = document.getElementById('add-btn');
  const resetBtn = document.getElementById('reset-btn');
  const calorieList = document.getElementById('calorie-list');
  const totalCalories = document.getElementById('total-calories');
  const weeklyTotal = document.getElementById('weekly-total');
  const totalSaved = document.getElementById('total-saved');
  const pieChartCanvas = document.getElementById('PieChart');
  const prevWeekBtn = document.getElementById('prev-week-btn');
  const nextWeekBtn = document.getElementById('next-week-btn');

  if (!calorieInput || !addBtn || !resetBtn || !calorieList || !totalCalories || !weeklyTotal || !totalSaved || !pieChartCanvas || !prevWeekBtn || !nextWeekBtn) {
    console.error('One or more elements are missing in the DOM.');
    return;
  }

  let calories = 11200;
  let weeks = [];
  let currentWeekIndex = 0;
  let totalConsumed = 0;

  const storage = window.localStorage;

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Retrieve data from local storage
  if (storage.getItem('weeks')) {
    weeks = JSON.parse(storage.getItem('weeks'));
    currentWeekIndex = weeks.length - 1; 
    updateWeek();
  } else {
    weeks.push([]);
    currentWeekIndex = 0;
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
  prevWeekBtn.addEventListener('click', prevWeek);
  nextWeekBtn.addEventListener('click', nextWeek);

  calorieInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      addCalorie();
    }
  });

  function addCalorie() {
    const calorieAmount = parseInt(calorieInput.value);
    if (calorieAmount && weeks[currentWeekIndex].length < 7) {
      weeks[currentWeekIndex].push(calorieAmount);
      calories -= calorieAmount;
      totalConsumed += calorieAmount;
      updateWeek();
      updateTotal();
      updateWeeklyTotal();
      updateTotalSaved();
      updatePieChart();
      saveToLocalStorage();
      calorieInput.value = '';
    }
  }

  function resetCalories() {
    if (weeks.length === 1) {
      weeks[0] = []; 
    } else {
      weeks.splice(currentWeekIndex, 1);
      currentWeekIndex = Math.max(0, currentWeekIndex - 1);
      weeks.splice(currentWeekIndex, 0, []);
    }
    calories = 11200;
    totalConsumed = 0;
    updateWeek();
    updateTotal();
    updateWeeklyTotal();
    updateTotalSaved();
    updatePieChart();
    saveToLocalStorage();
  }

  function updateWeek() {
    const listHtml = weeks[currentWeekIndex].map((entry, index) => {
      const dailyAllowed = 1600;
      const caloriesSaved = dailyAllowed - entry;
      const color = caloriesSaved >= 0 ? '#007bff' : 'red';
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
    const deletedAmount = weeks[currentWeekIndex].splice(index, 1)[0];
    calories += deletedAmount; 
    totalConsumed -= deletedAmount;
    updateWeek();
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
    const totalAllowed = 1600 * weeks[currentWeekIndex].length;
    const totalSavedCalories = totalAllowed - totalConsumed;
    totalSaved.textContent = `Total Calories Saved: ${totalSavedCalories}`;
  }

  function updatePieChart() {
    if (window.chart) {
      window.chart.destroy();
    }
    const ctx = pieChartCanvas.getContext('2d');

    // Fill the entries array with zeros if it's not full
    const chartEntries = weeks[currentWeekIndex].concat(Array(7 - weeks[currentWeekIndex].length).fill(0));

    window.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: daysOfWeek,
        datasets: [{
          label: 'Calories Consumed',
          data: chartEntries,
          backgroundColor: chartEntries.map(entry => entry > 1600 ? 'rgba(220, 53, 69, 0.2)' : 'rgba(0, 123, 255, 0.2)'),
          borderColor: chartEntries.map(entry => entry > 1600 ? '#dc3545' : '#007bff'), 
          borderWidth: {
            top: 2,
            right: 2,
            left: 2,
            bottom: 0 
          },
        }]
      },
      options: {
        scales: {
          y: {
            max: 3000 
          }
        }
      }
    });
  }

  function saveToLocalStorage() {
    storage.setItem('weeks', JSON.stringify(weeks));
    storage.setItem('calories', calories.toString());
    storage.setItem('totalConsumed', totalConsumed.toString());
    storage.setItem('currentWeekIndex', currentWeekIndex.toString());
  }

  function prevWeek() {
    if (currentWeekIndex > 0) {
      currentWeekIndex--;
      updateWeek();
      updateTotal();
      updateWeeklyTotal();
      updateTotalSaved();
      updatePieChart();
      saveToLocalStorage();
    }
  }

  function nextWeek() {
    if (currentWeekIndex < weeks.length - 1) {
      currentWeekIndex++;
      updateWeek();
      updateTotal();
      updateWeeklyTotal();
      updateTotalSaved();
      updatePieChart();
      saveToLocalStorage();
    } else {
      weeks.push([]);
      currentWeekIndex++;
      updateWeek();
      updateTotal();
      updateWeeklyTotal();
      updateTotalSaved();
      updatePieChart();
      saveToLocalStorage();
    }
  }

  // Initialize the first week if no data exists
  if (weeks.length === 0) {
    weeks.push([]);
    saveToLocalStorage();
  }

  updatePieChart();
  updateWeek();
  updateTotalSaved();
});