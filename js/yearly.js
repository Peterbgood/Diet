// Global chart variable
let chart;

// Constants
const CALORIE_THRESHOLD = 11200;
const STORAGE_KEY = 'weightData';

// Utility function to format date as MM/DD/YYYY
function formatDate(date) {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

// Save a new calorie entry
function saveData(event) {
  event.preventDefault(); // Prevent form submission
  const dateInput = document.getElementById('date').value;
  const weightInput = document.getElementById('weight').value;

  if (!dateInput || !weightInput) {
    alert('Please enter both date and calories.');
    return;
  }

  const date = new Date(dateInput + 'T00:00:00');
  const weight = parseFloat(weightInput);

  if (isNaN(weight) || weight <= 0) {
    alert('Please enter a valid calorie amount.');
    return;
  }

  const entry = {
    date: date.toISOString(),
    weight: weight,
  };

  const storedData = getStoredData();
  storedData.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));

  document.getElementById('weight').value = ''; // Clear input
  renderLog();
  updateChart();
}

// Delete an entry
function deleteEntry(index) {
  const storedData = getStoredData();
  storedData.splice(index, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
  renderLog();
  updateChart();
}

// Reset all data
function resetData() {
  if (confirm('Are you sure you want to reset all data?')) {
    localStorage.removeItem(STORAGE_KEY);
    renderLog();
    updateChart();
  }
}

// Get stored data from localStorage
function getStoredData() {
  const data = localStorage.getItem(STORAGE_KEY);
  try {
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.warn('Invalid data in localStorage, resetting.');
    return [];
  }
}

// Render the log list
function renderLog() {
  const log = document.getElementById('log');
  log.innerHTML = '';

  const storedData = getStoredData();
  // Create an array of objects with original indices
  const dataWithIndices = storedData.map((entry, originalIndex) => ({
    entry,
    originalIndex
  }));
  // Sort by date, newest first
  dataWithIndices.sort((a, b) => new Date(b.entry.date) - new Date(a.entry.date));

  dataWithIndices.forEach(({ entry, originalIndex }) => {
    const date = new Date(entry.date);
    const weight = entry.weight;
    const overUnder = weight - CALORIE_THRESHOLD;
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.dataset.index = originalIndex; // Store the original index
    li.innerHTML = `
      ${formatDate(date)}: ${weight.toFixed(0)} Cals
      <span class="over-under">(${overUnder > 0 ? '+' : ''}${Math.abs(overUnder).toFixed(0)})</span>
      <button class="btn btn-danger btn-sm delete-btn"><i class="bi bi-trash"></i></button>
    `;
    const overUnderText = li.querySelector('.over-under');
    overUnderText.style.color = overUnder <= 0 ? '#40E0D0' : '#FF4500'; // Teal for under/at, reddish for over
    log.appendChild(li);
  });

  // Add delete event listeners using the stored original index
  log.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const li = e.target.closest('li');
      const index = parseInt(li.dataset.index);
      deleteEntry(index);
    });
  });
}

// Create the bar chart
function createBarChart() {
  const ctx = document.getElementById('BarChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: 'Calories',
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 2,
      }],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 15000,
        },
      },
      plugins: {
        annotation: {
          annotations: {
            line1: {
              type: 'line',
              yMin: CALORIE_THRESHOLD,
              yMax: CALORIE_THRESHOLD,
              borderColor: '#40E0D0', // Teal for threshold line
              borderWidth: 5,
              label: {
                content: 'Threshold',
                enabled: true,
                position: 'center',
                backgroundColor: 'rgba(64, 224, 208, 0.8)', // Teal with opacity
              },
            },
          },
        },
      },
    },
  });
  updateChart();
}

// Update the bar chart
function updateChart() {
  const storedData = getStoredData();
  const labels = [];
  const data = [];
  const backgroundColors = [];
  const borderColors = [];

  storedData.sort((a, b) => new Date(a.date) - new Date(b.date)); // Oldest first for chart
  storedData.forEach(entry => {
    const date = new Date(entry.date);
    const weight = entry.weight;
    labels.push(formatDate(date));
    data.push(weight);
    const color = weight > CALORIE_THRESHOLD ? 'rgba(255, 69, 0, 0.2)' : 'rgba(64, 224, 208, 0.2)'; // Reddish for over, teal for under
    backgroundColors.push(color);
    borderColors.push(weight > CALORIE_THRESHOLD ? '#FF4500' : '#40E0D0'); // Solid reddish and teal borders
  });

  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.data.datasets[0].backgroundColor = backgroundColors;
  chart.data.datasets[0].borderColor = borderColors;
  chart.update();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Set default date to today in local time (Eastern Time)
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // +1 because months are 0-based
  const day = String(now.getDate()).padStart(2, '0');
  document.getElementById('date').value = `${year}-${month}-${day}`;

  // Form submission handler
  document.getElementById('calorie-form').addEventListener('submit', saveData);

  // Reset button handler
  document.getElementById('reset-btn').addEventListener('click', resetData);

  // Initial render and chart setup
  renderLog();
  if (!chart) createBarChart();
});