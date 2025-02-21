let chart;
let foodLog = {};
const DAILY_LIMIT = 1600;
let currentDate = new Date();

// Save data to local storage
function saveData() {
  const dateStr = formatDate(currentDate);
  console.log('Saving data for:', dateStr, foodLog[dateStr]);
  localStorage.setItem('foodLog', JSON.stringify(foodLog));
  localStorage.setItem('currentDate', dateStr);
}

// Load data from local storage
function loadData() {
  const storedFoodLog = localStorage.getItem('foodLog');
  currentDate = new Date(); // Always start with today
  if (storedFoodLog) {
    try {
      foodLog = JSON.parse(storedFoodLog);
      console.log('Loaded foodLog:', foodLog);
    } catch (error) {
      console.error('Error parsing food log:', error);
      foodLog = {};
    }
  }
  updateUI();
}

// Format date as MM/DD/YYYY
function formatDate(date) {
  return date.toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'America/New_York' });
}

// Update UI
function updateUI() {
  console.log('Updating UI for:', formatDate(currentDate));
  updateFoodList();
  updateTotalCalories();
  renderCaloriesChart();
  displayCurrentDate();
}

// Update food list with custom sorting and icons
function updateFoodList() {
  const dateStr = formatDate(currentDate);
  const foodListElement = document.getElementById('food-list');
  foodListElement.innerHTML = '';
  console.log('Food log for', dateStr, ':', foodLog[dateStr]);

  if (foodLog[dateStr] && foodLog[dateStr].length > 0) {
    // Separate entries into categories
    const coffeeItems = foodLog[dateStr].filter(entry => entry.name.includes('☕'));
    const burntItems = foodLog[dateStr].filter(entry => entry.calories < 0 && !entry.name.includes('☕'));
    const otherItems = foodLog[dateStr].filter(entry => !entry.name.includes('☕') && entry.calories >= 0);

    // Combine in desired order: coffee, other, burnt
    const sortedItems = [...coffeeItems, ...otherItems, ...burntItems];

    sortedItems.forEach((entry, index) => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      const icon = entry.type || '🍽️'; // Use entry.type if exists, otherwise default to generic icon
      // Only prepend icon if name doesn't already start with it
      const displayName = entry.name.startsWith(icon) ? entry.name : `${icon} ${entry.name}`;
      li.innerHTML = `
        <span contenteditable="true" class="form-control name">${displayName}</span>
        <span contenteditable="true" class="form-control calories" style="width: 80px;">${entry.calories}</span>
        <button class="btn btn-danger btn-sm delete-btn"><i class="bi bi-trash"></i></button>
      `;

      const nameSpan = li.querySelector('.name');
      const caloriesSpan = li.querySelector('.calories');
      const deleteBtn = li.querySelector('.delete-btn');

      nameSpan.addEventListener('keypress', (e) => handleEdit(e, index, 'name', nameSpan.textContent.replace(icon + ' ', '')));
      caloriesSpan.addEventListener('keypress', (e) => handleEdit(e, index, 'calories', parseInt(caloriesSpan.textContent)));
      deleteBtn.addEventListener('click', () => {
        const originalIndex = foodLog[dateStr].findIndex(item => item.name === entry.name && item.calories === entry.calories);
        foodLog[dateStr].splice(originalIndex, 1);
        updateUI();
        saveData();
      });

      caloriesSpan.style.color = entry.calories < 0 ? '#0d6efd' : 'inherit';
      foodListElement.appendChild(li);
    });
  } else {
    console.log('No entries for', dateStr);
  }
}

// Handle editable fields
function handleEdit(event, index, field, value) {
  if (event.key === 'Enter') {
    event.preventDefault();
    const dateStr = formatDate(currentDate);
    if (field === 'calories' && isNaN(value)) {
      alert('Please enter a valid number for calories.');
      return;
    }
    const sortedItems = [...foodLog[dateStr].filter(entry => entry.name.includes('☕')),
                        ...foodLog[dateStr].filter(entry => !entry.name.includes('☕') && entry.calories >= 0),
                        ...foodLog[dateStr].filter(entry => entry.calories < 0 && !entry.name.includes('☕'))];
    const entryToUpdate = sortedItems[index];
    const originalIndex = foodLog[dateStr].findIndex(item => item.name === entryToUpdate.name && item.calories === entryToUpdate.calories);
    foodLog[dateStr][originalIndex][field] = field === 'calories' ? parseInt(value) : value;
    updateUI();
    saveData();
  }
}

// Update total and remaining calories
function updateTotalCalories() {
  const dateStr = formatDate(currentDate);
  const totalCalories = foodLog[dateStr] ? foodLog[dateStr].reduce((acc, item) => acc + item.calories, 0) : 0;
  const remainingCalories = Math.max(DAILY_LIMIT - totalCalories, 0);

  document.getElementById('total-calories').textContent = totalCalories;
  document.getElementById('remaining-calories').textContent = remainingCalories;

  return { totalCalories, remainingCalories };
}

// Render pie chart
function renderCaloriesChart() {
  const { totalCalories, remainingCalories } = updateTotalCalories();
  const ctx = document.getElementById('caloriesChart').getContext('2d');
  const chartData = totalCalories >= DAILY_LIMIT ? [DAILY_LIMIT] : [totalCalories, remainingCalories];
  const chartLabels = totalCalories >= DAILY_LIMIT ? ['Calories Used'] : ['Calories Used', 'Remaining'];
  const chartColors = totalCalories >= DAILY_LIMIT ? ['#dc3545'] : ['#007bff', '#6c757d'];

  if (!chart) {
    chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: chartLabels,
        datasets: [{
          data: chartData,
          backgroundColor: chartColors,
          borderColor: '#fff',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: ${context.raw} cal`,
            },
          },
        },
      },
    });
  } else {
    chart.data.labels = chartLabels;
    chart.data.datasets[0].data = chartData;
    chart.data.datasets[0].backgroundColor = chartColors;
    chart.update();
  }
}

// Display current date
function displayCurrentDate() {
  const dateInput = document.getElementById('date-input');
  dateInput.value = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
}

// Add custom food entry with generic icon
function addCustomFood(event) {
  event.preventDefault();
  const name = document.getElementById('custom-name').value.trim();
  const calories = parseInt(document.getElementById('custom-calories').value);
  if (!name || isNaN(calories)) {
    console.log('Invalid custom entry:', name, calories);
    alert('Please enter a valid food name and calorie amount.');
    return;
  }
  const dateStr = formatDate(currentDate);
  if (!foodLog[dateStr]) foodLog[dateStr] = [];
  foodLog[dateStr].push({ name, calories, type: '🍽️' }); // Add generic icon
  console.log('Added custom entry:', { name, calories, type: '🍽️' }, 'to', dateStr);
  document.getElementById('custom-name').value = '';
  document.getElementById('custom-calories').value = '';
  updateUI();
  saveData();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  loadData();

  document.getElementById('prev-date-button').addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 1);
    updateUI();
    saveData();
  });

  document.getElementById('next-date-button').addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 1);
    updateUI();
    saveData();
  });

  document.getElementById('date-input').addEventListener('change', (e) => {
    currentDate = new Date(e.target.value);
    updateUI();
    saveData();
  });

  document.getElementById('custom-food-form').addEventListener('submit', addCustomFood);

  document.querySelectorAll('.add-calorie-button').forEach(button => {
    button.addEventListener('click', () => {
      const dateStr = formatDate(currentDate);
      const calories = parseInt(button.dataset.calories);
      const name = button.dataset.name;
      const type = button.dataset.type; // Preserve icon from buttons
      if (!foodLog[dateStr]) foodLog[dateStr] = [];
      foodLog[dateStr].push({ name, calories, type });
      console.log('Added button entry:', { name, calories, type }, 'to', dateStr);
      updateUI();
      saveData();
    });
  });
});