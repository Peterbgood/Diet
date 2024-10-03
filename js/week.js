const listHtml = entries.map((entry, index) => {
  const dailyAllowed = 1700;
  const caloriesSaved = dailyAllowed - entry;
      const color = caloriesSaved >= 0 ? '#dbefdc' : 'red';
      const color = caloriesSaved >= 0 ? '#0dcaf0' : 'red';
  return `
       <li class="list-group-item d-flex justify-content-between align-items-center">
         ${daysOfWeek[index]}: ${entry} cals 
  @@ -129,8 +129,8 @@ function updatePieChart() {
  datasets: [{
  label: 'Calories Consumed',
  data: chartEntries,
          backgroundColor: chartEntries.map(entry => entry > 1700 ? 'rgba(219, 239, 220, 0.5)' : 'rgba(13, 202, 240, 0.1)'),
          borderColor: chartEntries.map(entry => entry > 1700 ? '#fff' : '#fff'), // match border color with background color
          backgroundColor: chartEntries.map(entry => entry > 1700 ? 'rgba(255, 99, 132, 0.2)' : 'rgba(13, 202, 240, 0.1)'),
          borderColor: chartEntries.map(entry => entry > 1700 ? 'rgba(255, 99, 132, 1)' : '#0dcaf0'), // match border color with background color
  borderWidth: {
  top: 2,
  right: 2,