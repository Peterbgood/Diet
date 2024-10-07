let chart; // Define chart in the global scope

function saveData() {
  const date = new Date(document.getElementById("date").value + "T00:00:00"); 
  const weight = parseFloat(document.getElementById("weight").value);
  const log = document.getElementById("log");
  const overUnder = weight - 11900;
  const entry = `<li class="list-group-item d-flex justify-content-between align-items-center" data-date="${formatDate(date)}"> ${formatDate(date)}: ${weight.toFixed(1)} Calories <span class="over-under">(${overUnder > 0 ? '+' : ''}${overUnder.toFixed(1)})</span> <button class="btn btn-danger btn-sm delete-btn" onclick="deleteEntry(this)">Delete</button></li>`;
  const storedData = localStorage.getItem("weightData");
  if (storedData === null) {
    localStorage.setItem("weightData", entry);
  } else {
    localStorage.setItem("weightData", entry + storedData);
  }
  log.insertAdjacentHTML("afterbegin", entry);
  const logEntry = log.querySelector(`[data-date="${formatDate(date)}"]`);
  const overUnderText = logEntry.querySelector('.over-under');
  if (overUnderText) {
    overUnderText.textContent = `(${overUnder > 0 ? '+' : '-'}${Math.abs(overUnder).toFixed(1)})`;
    overUnderText.style.color = overUnder < 0 ? '#964B00 !important' : 'red !important';
  }
  updateChart();
}

function deleteEntry(btn) {
  const entry = btn.parentNode;
  entry.remove();
  const storedData = localStorage.getItem("weightData");
  const newData = storedData.replace(entry.outerHTML, "");
  localStorage.setItem("weightData", newData);
  updateChart();
}

function resetData() {
  localStorage.removeItem("weightData");
  document.getElementById("log").innerHTML = "";
  updateChart();
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}/${year}`; 
}

document.addEventListener("DOMContentLoaded", function() {
  const storedData = localStorage.getItem("weightData");
  if (storedData) {
    document.getElementById("log").innerHTML = storedData;
  }
  createBarChart();
});

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;
const day = now.getDate();
document.getElementById("date").value = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

function createBarChart() {
  const ctx = document.getElementById('BarChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [], // dynamic labels
      datasets: [{
        label: 'Calories',
        data: [], // dynamic data
        backgroundColor: [], // dynamic background color
        borderColor: '#452B1F',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 15000 // Adjust the max value as needed
        }
      },
      plugins: {
        annotation: {
          annotations: {
            line1: {
              type: 'line',
              yMin: 11900,
              yMax: 11900,
              borderColor: '#452B1F', // Red color for visibility
              borderWidth: 5, // Increased thickness
              label: {
                content: 'Threshold',
                enabled: true,
                position: 'center',
                backgroundColor: '#964B00' // Background color for the label
              }
            }
          }
        }
      }
    }
  });

  // Call updateChart initially to populate the chart
  updateChart();
}

function updateChart() {
  console.log('Updating chart...');
  const storedData = localStorage.getItem("weightData");
  if (storedData) {
    const entries = storedData.match(/<li[^>]*>(.*?)<\/li>/g);
    const labels = [];
    const data = [];
    const backgroundColors = [];
    const borderColors = [];
    entries.forEach((entry) => {
      if (entry) {
        const date = entry.match(/>(.*?):/)[1];
        const weight = parseFloat(entry.match(/:(.*?) Calories/)[1]);
        const overUnder = weight - 11900;
        labels.push(date);
        data.push(weight);
        backgroundColors.push(weight > 11900 ? 'red' : '#964B00');
        borderColors.push(weight > 11900 ? '#fff' : '#fff'); 
      }
    });
    // Reverse the arrays
    labels.reverse();
    data.reverse();
    backgroundColors.reverse();
    borderColors.reverse();
    console.log('Labels:', labels);
    console.log('Data:', data);
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.data.datasets[0].backgroundColor = backgroundColors;
    chart.data.datasets[0].borderColor = borderColors;
    chart.data.datasets[0].borderWidth = {
      top: 2,
      right: 2,
      left: 2,
      bottom: 0 
    };
    chart.update();
  }
}