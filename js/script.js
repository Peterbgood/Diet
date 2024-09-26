document.addEventListener("DOMContentLoaded", function(){
  const nameInput = document.getElementById("name");
  const calorieAmountInput = document.getElementById("calorie-amount");
  const addEntryButton = document.getElementById("add-entry");
  const entryListElement = document.getElementById("entry-list");
  const remainingCaloriesElement = document.getElementById("remaining-calories-value");
  const totalCaloriesUsedElement = document.getElementById("total-calories-used-value");
  const resetButton = document.getElementById("reset-button");
  const addCalorieButtons = document.querySelectorAll(".add-calorie-button");

  let data = {
    remainingCalories: 1700,
    totalCaloriesUsed: 0,
    entries: []
  };

  function addEntry(name, calorieAmount) {
    if (name !== "" && !isNaN(calorieAmount)) {
      const existingEntryIndex = data.entries.findIndex((entry) => entry.name === name);
      if (existingEntryIndex > -1) {
        data.entries[existingEntryIndex].calorieAmount += calorieAmount;
      } else {
        data.entries.push({ name, calorieAmount });
      }
      data.remainingCalories -= calorieAmount;
      data.totalCaloriesUsed += calorieAmount;
      saveData();
      renderEntryList();
      renderCaloriesChart();
      nameInput.value = "";
      calorieAmountInput.value = "";
    } else {
      alert("Please enter a valid name and calorie amount.");
    }
  }

  addEntryButton.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const calorieAmount = parseInt(calorieAmountInput.value.trim());
    addEntry(name, calorieAmount);
  });

  addCalorieButtons.forEach(button => {
    button.addEventListener("click", () => {
      const name = button.getAttribute("data-name");
      const calories = parseInt(button.getAttribute("data-calories"));
      addEntry(name, calories);
    });
  });

  nameInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const name = nameInput.value.trim();
      const calorieAmount = parseInt(calorieAmountInput.value.trim());
      addEntry(name, calorieAmount);
    }
  });

  calorieAmountInput.addEventListener("focus", (event) => {
    if (event.target.type === "text") {
      event.target.type = "number";
    }
  });

  calorieAmountInput.addEventListener("blur", (event) => {
    if (event.target.type === "number") {
      event.target.type = "text";
    }
  });

  calorieAmountInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const name = nameInput.value.trim();
      const calorieAmount = parseInt(calorieAmountInput.value.trim());
      addEntry(name, calorieAmount);
    }
  });

  entryListElement.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-button")) {
      const entryElement = event.target.closest("li");
      const entryName = entryElement.querySelector("span").textContent;
      const [name, calorieAmount] = entryName.split(" - ");
      const index = data.entries.findIndex((entry) => entry.name === name && entry.calorieAmount === parseInt(calorieAmount));
      if (index > -1) {
        data.entries.splice(index, 1);
        data.remainingCalories += parseInt(calorieAmount);
        data.totalCaloriesUsed -= parseInt(calorieAmount);
        saveData();
        renderEntryList();
        entryElement.remove();
      }
    } else if (event.target.tagName === "SPAN") {
      const entryElement = event.target.closest("li");
      const entryNameElement = event.target;
      const entryName = entryNameElement.textContent;
      const [name, calorieAmount] = entryName.split(" - ");
      const index = data.entries.findIndex((entry) => entry.name === name && entry.calorieAmount === parseInt(calorieAmount));

      if (index > -1) {
        const inputField = document.createElement("input");
        inputField.type = "text";
        inputField.value = name;
        entryNameElement.replaceWith(inputField);
        inputField.focus();

        inputField.addEventListener("blur", () => {
          const newName = inputField.value.trim();
          if (newName !== "") {
            data.entries[index].name = newName;
            saveData();
            renderEntryList();
          } else {
            alert("Please enter a valid name.");
          }
        });

        inputField.addEventListener("keypress", (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            const newName = inputField.value.trim();
            if (newName !== "") {
              data.entries[index].name = newName;
              saveData();
              renderEntryList();
            } else {
              alert("Please enter a valid name.");
            }
          }
        });
      }
    }
  });

    resetButton.addEventListener("click", () => {
    data = {
      remainingCalories: 1700,
      totalCaloriesUsed: 0,
      entries: []
    };
    saveData();
    renderEntryList();
    entryListElement.innerHTML = ""; // Clear entry list
    renderCaloriesChart();
  });

  function renderEntryList() {
    entryListElement.innerHTML = "";
    const ul = document.createElement("UL");
    ul.className = "list-group"; // Use Bootstrap list group class
    data.entries.forEach((entry) => {
      const li = document.createElement("LI");
      li.className = 'list-group-item d-flex justify-content-between align-items-center'; // Use Bootstrap classes
      const entryHTML = `
        <span style="color: ${entry.calorieAmount < 0 ? '#0dcaf0' : ''}">${entry.name} - ${entry.calorieAmount}</span>
        <button class="btn btn-danger btn-sm delete-button">Delete</button>
      `;
      li.innerHTML = entryHTML;
      ul.appendChild(li);
    });
    entryListElement.appendChild(ul);
    remainingCaloriesElement.textContent = data.remainingCalories;
    totalCaloriesUsedElement.textContent = data.totalCaloriesUsed;
    renderCaloriesChart();
  }

  let chart; // Declare chart variable outside the function

 function renderCaloriesChart() {
  const ctx = document.getElementById('caloriesChart').getContext('2d');
  let totalCaloriesUsed = data.totalCaloriesUsed;
  let remainingCalories = data.remainingCalories;

  // Check if totalCaloriesUsed is less than 0
  if (totalCaloriesUsed < 0) {
    totalCaloriesUsed = 0; // Set to initial value
    remainingCalories = 1700; // Set to initial value
  }

  let backgroundColor;
  let borderColor;
  if (totalCaloriesUsed >= 1700) {
    backgroundColor = ['rgba(255, 99, 132, 0.2)'];
    borderColor = ['#ff000d', '#ff000d']; // Red border
    totalCaloriesUsed = 1700; // Limit to 1700 for chart display
    remainingCalories = 0;
  } else {
    backgroundColor = ['rgba(0, 0, 0, 0.5)', 'rgba(13, 202, 240, 0.5)'];
    borderColor = ['#000', '#0dcaf0']; // Black and cyan border
  }

  if (!chart) { // Check if chart is not created
    chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Calories Used', 'Remaining Calories'],
        datasets: [{
          data: [totalCaloriesUsed, remainingCalories],
          backgroundColor: backgroundColor,
          borderColor: borderColor,
          borderWidth: 2 // Set border width
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                if (context.label === 'Calories Used') {
                  return `Calories Used: ${data.totalCaloriesUsed}`;
                } else if (context.label === 'Remaining Calories') {
                  return `Remaining Calories: ${data.remainingCalories}`;
                } else {
                  return '';
                }
              }
            }
          }
        }
      }
    });
  } else { // If chart is already created, update the data
    chart.data.datasets[0].data = [totalCaloriesUsed, remainingCalories];
    chart.data.datasets[0].backgroundColor = backgroundColor;
    chart.data.datasets[0].borderColor = borderColor;
    chart.update();
  }
}
	
  function saveData() {
    const jsonData = JSON.stringify(data);
    localStorage.setItem("calorie-counter-data", jsonData);
  }

  // Retrieve data from local storage
  const storedData = localStorage.getItem("calorie-counter-data");
  if (storedData) {
    data = JSON.parse(storedData);
  }

  renderEntryList(); // Render entry list initially
  renderCaloriesChart(); // Initialize the chart
});