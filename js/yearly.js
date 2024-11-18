let chart; 

function saveData() {
  const date = new Date(document.getElementById("date").value + "T00:00:00"); 
  const weight = parseFloat(document.getElementById("weight").value);
  const log = document.getElementById("log");
  const overUnder = weight - 11200;
  const entry = `<li class="list-group-item d-flex justify-content-between align-items-center" data-date="${formatDate(date)}"> ${formatDate(date)}: ${weight.toFixed(0)} Cals <span class="over-under">(${overUnder > 0 ? '+' : ''}${Math.abs(overUnder).toFixed(0)})</span> <button class="btn btn-danger btn-sm delete-btn" onclick="deleteEntry(this)">Delete</button></li>`;
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
    overUnderText.textContent = `(${overUnder > 0 ? '+' : '-'}${Math.abs(overUnder).toFixed(0)})`;
    overUnderText.style.color = overUnder < 0 ? '#964B00 !important' : 'rgba(220, 53, 69, 0.2)!important';
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
      labels: [], 
      datasets: [{
        label: 'Cals',
        data: [], 
        backgroundColor: [], 
        borderColor: '#0d6efd',
        borderWidth: 2
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 15000 
        }
      },
      plugins: {
        annotation: {
          annotations: {
            line1: {
              type: 'line',
              yMin: 11200,
              yMax: 11200,
              borderColor: '#0d6efd', 
              borderWidth: 5, 
              label: {
                content: 'Threshold',
                enabled: true,
                position: 'center',
                backgroundColor: 'rgba(220, 53, 69, 0.8)' 
              }
            }
          }
        }
      }
    }
  });

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
    entries.forEach((entry) => {
      if (entry) {
        const date = entry.match(/>(.*?):/)[1];
        const weight = parseFloat(entry.match(/:(.*?) Cals/)[1]);
        const overUnder = weight - 11200;
        labels.push(date);
        data.push(weight);
        backgroundColors.push(weight > 11200 ? 'rgba(220, 53, 69, 0.2)' : 'rgba(0, 123, 255, 0.3)');
      }
    });
    labels.reverse();
    data.reverse();
    backgroundColors.reverse();
    console.log('Labels:', labels);
    console.log('Data:', data);
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.data.datasets[0].backgroundColor = backgroundColors;
    chart.data.datasets[0].borderColor = '#452B1F'; 
    chart.data.datasets[0].borderWidth = 2; 
    chart.update();
  }
}
