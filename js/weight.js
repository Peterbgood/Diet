// Global chart variable
let chart;

// Utility functions
const formatDate = date => `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
const getDayOfWeek = date => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()];
const getWeekNumber = date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

function saveData() {
    const date = new Date(document.getElementById("date").value + "T00:00:00");
    const weight = parseFloat(document.getElementById("weight").value);
    
    const entry = {
        date: date.toISOString(),
        weight: weight,
        dayOfWeek: getDayOfWeek(date),
        weekNumber: getWeekNumber(date)
    };

    let storedData = getStoredData();
    storedData.unshift(entry); // Add to beginning
    localStorage.setItem("weightData2", JSON.stringify(storedData));
    
    // Clear the weight input field
    document.getElementById("weight").value = "";
    
    renderLog();
    updateChart();
}

function deleteEntry(index) {
    let storedData = getStoredData();
    if (index >= 0 && index < storedData.length) {
        storedData.splice(index, 1);
        localStorage.setItem("weightData2", JSON.stringify(storedData));
        renderLog();
        updateChart();
    }
}

function resetData() {
    localStorage.removeItem("weightData2");
    renderLog();
    updateChart();
}

// Helper function to safely get stored data
function getStoredData() {
    const rawData = localStorage.getItem("weightData2");
    if (!rawData) return [];
    
    try {
        const parsed = JSON.parse(rawData);
        // If it's an array, return it
        if (Array.isArray(parsed)) return parsed;
        // If it's not an array, clear it and return empty
        localStorage.setItem("weightData2", "[]");
        return [];
    } catch (e) {
        // If parsing fails (old HTML data), clear it and return empty
        console.warn("Invalid data found in localStorage, resetting to empty array.");
        localStorage.setItem("weightData2", "[]");
        return [];
    }
}

function renderLog() {
    const log = document.getElementById("log");
    log.innerHTML = "";
    
    const storedData = getStoredData();
    if (!storedData.length) return;

    // Create a copy of the data and sort by date (newest first)
    const sortedData = [...storedData].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Group by week
    let currentWeek = null;
    sortedData.forEach((entry) => {
        const weekNum = entry.weekNumber;
        if (currentWeek !== weekNum) {
            currentWeek = weekNum;
            const weekDivider = document.createElement("li");
            weekDivider.className = "list-group-item week-divider";
            weekDivider.textContent = `Week ${weekNum}`;
            log.appendChild(weekDivider);
        }

        // Find the original index in storedData
        const originalIndex = storedData.findIndex(item => item.date === entry.date);

        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
            ${formatDate(new Date(entry.date))} (${entry.dayOfWeek}): ${entry.weight.toFixed(1)} lbs
            <button class="btn btn-danger btn-sm delete-btn" onclick="deleteEntry(${originalIndex})">
                <i class="bi bi-trash"></i>
            </button>
        `;
        if (entry.dayOfWeek === "Friday") {
            li.classList.add("friday-entry");
        }
        log.appendChild(li);
    });
}

function updateChart() {
    const ctx = document.getElementById("weightChart").getContext("2d");
    if (chart) chart.destroy();

    const storedData = getStoredData();
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    
    const recentData = storedData
        .map(entry => ({
            date: new Date(entry.date),
            weight: entry.weight
        }))
        .filter(d => d.date >= oneMonthAgo)
        .sort((a, b) => a.date - b.date);

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: recentData.map(d => formatDate(d.date)),
            datasets: [{
                label: "Weight",
                data: recentData.map(d => d.weight),
                backgroundColor: "#007bff",
                borderColor: "#007bff",
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

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    const now = new Date();
    document.getElementById("date").value = 
        `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
    
    renderLog();
    updateChart();
});

// Add clear button listener if it exists
document.getElementById("clear-btn")?.addEventListener("click", resetData);
