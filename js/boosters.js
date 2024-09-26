const moodChart = document.getElementById('moodChart');
const moodLog = document.getElementById('moodLog');
const GoodFoodButtons = document.getElementById('goodFoodButtons');
const BadFoodButtons = document.getElementById('badFoodButtons');
const resetButton = document.getElementById('reset-button');

const GoodFoods = [
  'Good Sleep', 'Nap', 'Physical Activity', 'Water', 'Sunlight', 'Beans', 'Bananas', 'Apples', 'Yogurt', 'Milk', 'Advocado', 'Eggs', 'Pickles', 'Nuts', 'Protein',
  '\n', // Newline character for line break
  'Building Social Relationships', 'Focused in On a Project', 'Problem Solving', 'Insights', 'Doing something New', 'Drinking', 'Mastery', 'Learning', 'Having my Work Organized', 'Having something to do with family', 'Cleaning', 'TV Series (Flow)'
];

const BadFoods = [
 '\n', 'Disagreement', 'Lack of Social', 'Lack of Project', 'Bad Sleep', 'No Physical Activity', 'Overwhelmed', 'Hungry', 'Dyhydrated', 'Lack of Caffiene', 'Hangover', 'Sick', 'Eating Unhealthy Food', 'Doing a bad job', 'Not working', 'Not Out', 'Too much Out'
];

let GoodCount = 0;
let BadCount = 0;

const chart = new Chart(moodChart, {
  type: 'pie',
  data: {
    labels: ['Good', 'Bad'],
    datasets: [{
      data: [GoodCount, BadCount],
      backgroundColor: GoodCount === 0 && BadCount === 0 ? ['#gray', '#gray'] : ['#0dcaf0', '#000']
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false
  }
});

GoodFoods.forEach(food => createButton(food, 'Good', GoodFoodButtons));
BadFoods.forEach(food => createButton(food, 'Bad', BadFoodButtons));

const savedLog = JSON.parse(localStorage.getItem('moodLog')) || [];
savedLog.forEach(entry => {
  addToLog(entry.food, entry.mood, false);
  if (entry.mood === 'Good') {
    GoodCount++;
  } else if (entry.mood === 'Bad') {
    BadCount++;
  }
});
updateMoodChart();

resetButton.addEventListener('click', resetLog);

function createButton(food, mood, container) {
  if (food === '' || food === '\n') {
    const hr = document.createElement('hr');
    container.appendChild(hr); // Append the <hr> element
  } else {
    const button = document.createElement('button');
    button.textContent = food;
    button.className = 'btn m-1';
    button.classList.add(mood === 'Good' ? 'btn-outline-success' : 'btn-outline-danger');
    button.addEventListener('click', () => addFoodEntry(food, mood));
    container.appendChild(button);
  }
}




function updateMoodChart() {
  if (GoodCount === 0 && BadCount === 0) {
    chart.data.datasets[0].data = [1, 1];
    chart.data.datasets[0].backgroundColor = ['rgba(13, 202, 240, 0.5)', 'rgba(0, 0, 0, 0.5)'];
    chart.options.elements.arc.borderWidth = 2;
    chart.options.elements.arc.borderColor = ['#0dcaf0', 'rgba(0, 0, 0, 0.5)'];
  } else {
    chart.data.datasets[0].data = [GoodCount, BadCount];
    chart.data.datasets[0].backgroundColor = ['rgba(13, 202, 240, 0.5)', 'rgba(0, 0, 0, 0.5)'];
    chart.options.elements.arc.borderWidth = 2;
    chart.options.elements.arc.borderColor = ['#0dcaf0', 'rgba(0, 0, 0, 0.5)'];
  }
  chart.update();
}

function addToLog(food, mood, save = true) {
  const li = document.createElement('li');
  li.textContent = food;
  li.className = 'list-group-item d-flex justify-content-between align-items-center';
  li.style.color = mood === 'Good' ? '#0dcaf0' : '#000'; // Change text color based on mood

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.className = 'btn btn-danger btn-sm';
  deleteButton.addEventListener('click', () => deleteLogEntry(li, food, mood));
  li.appendChild(deleteButton);

  moodLog.appendChild(li);
  if (save) {
    saveToLocalStorage(food, mood);
  }
}
function addFoodEntry(food, mood) {
  if (GoodFoods.includes(food)) {
    GoodCount++;
  } else if (BadFoods.includes(food)) {
    BadCount++;
  }
  addToLog(food, mood);
  updateMoodChart();
}

function deleteLogEntry(li, food, mood) {
  moodLog.removeChild(li);
  if (mood === 'Good') {
    GoodCount--;
  } else if (mood === 'Bad') {
    BadCount--;
  }
  removeFromLocalStorage(food, mood);
  updateMoodChart();
}

function saveToLocalStorage(food, mood) {
  const existingLog = JSON.parse(localStorage.getItem('moodLog')) || [];
  existingLog.push({ food, mood });
  localStorage.setItem('moodLog', JSON.stringify(existingLog));
}

function removeFromLocalStorage(food, mood) {
  const existingLog = JSON.parse(localStorage.getItem('moodLog')) || [];
  const updatedLog = existingLog.filter(entry => !(entry.food === food && entry.mood === mood));
  localStorage.setItem('moodLog', JSON.stringify(updatedLog));
}

function resetLog() {
  GoodCount = 0;
  BadCount = 0;
  moodLog.innerHTML = '';
  localStorage.removeItem('moodLog');
  updateMoodChart();
}