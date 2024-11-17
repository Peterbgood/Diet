// Define functions and variables
let chart; // Define chart in the global scope

function saveData() {
    const date = new Date(document.getElementById("date").value + "T00:00:00");
    const weight = parseFloat(document.getElementById("weight").value);
    const log = document.getElementById("log");
    const dayOfWeek = getDayOfWeek(date);
    let color;
    switch (dayOfWeek) {
        case "Sunday":
            color = 'color: black;';
            break;
        case "Monday":
            color = 'color: #000;';
            break;
        case "Tuesday":
            color = 'color: #000;';
            break;
        case "Wednesday":
            color = 'color: #000;';
            break;
        case "Thursday":
            color = 'color: #000;';
            break;
        case "Friday":
            color = 'color: #007bff;';
            break;
        case "Saturday":
            color = 'color: black;';
            break;
    }
    const entry = `<li class="list-group-item d-flex justify-content-between align-items-center" style="${color}"> ${formatDate(date)} (${dayOfWeek}): ${weight.toFixed(1)} lbs <button class="btn btn-danger btn-sm delete-btn" onclick="deleteEntry(this)">Delete</button></li>`;
    const storedData = localStorage.getItem("weightData2");
    if (storedData === null) {
        localStorage.setItem("weightData2", entry);
    } else {
        localStorage.setItem("weightData2", entry + storedData);
    }
    log.insertAdjacentHTML("afterbegin", entry);
    updateChart();
}

document.addEventListener("DOMContentLoaded", function () {
    const storedData = localStorage.getItem("weightData2");
    if (storedData) {
        document.getElementById("log").innerHTML = storedData;
    }
    updateChart();
});

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;
const day = now.getDate();
document.getElementById("date").value = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

function deleteEntry(btn) {
    const entry = btn.parentNode;
    entry.remove();
    const storedData = localStorage.getItem("weightData2");
    const newData = storedData.replace(entry.outerHTML, "");
    localStorage.setItem("weightData2", newData);
    updateChart();
}

function resetData() {
    localStorage.removeItem("weightData2");
    document.getElementById("log").innerHTML = "";
    updateChart();
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}/${year}`;
}

function getDayOfWeek(date) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[date.getDay()];
}

function updateChart() {
    const ctx = document.getElementById('weightChart').getContext('2d');
    if (chart) {
        chart.destroy();
    }
    const storedData = localStorage.getItem("weightData2");
    const entries = storedData ? storedData.split("</li>") : [];
    const labels = entries.map(entry => {
        const match = entry.match(/\d{1,2}\/\d{1,2}\/\d{4}/);
        return match ? match[0] : '';
    }).filter(label => label !== '');
    const weights = entries.map(entry => {
        const match = entry.match(/(\d+\.\d+)\s+lbs/);
        return match ? parseFloat(match[1]) : 0;
    }).filter(weight => weight !== 0);

    // Filter the entries to include only the last 14 days
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const recentLabels = [];
    const recentWeights = [];
    for (let i = 0; i < labels.length; i++) {
        const entryDate = new Date(labels[i]);
        if (entryDate >= twoWeeksAgo) {
            recentLabels.push(labels[i]);
            recentWeights.push(weights[i]);
        }
    }

    // Display in chronological order
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: recentLabels.reverse(),
            datasets: [{
                label: 'Weight',
                data: recentWeights.reverse(),
                backgroundColor: recentWeights.map(weight => weight < 160 ? '#007bff' : '#007bff'),
                borderColor: recentWeights.map(weight => weight < 160 ? '#007bff' : '#007bff'),
                borderWidth: 1,
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    min: 155,
                    max: 165
                }
            }
        }
    });
}



document.getElementById("clear-btn").addEventListener("click", function () {
    localStorage.removeItem("weightData2");
    document.getElementById("log").innerHTML = "";
    updateChart();
});
