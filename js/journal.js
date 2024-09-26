// Get the columns
const columns = $('.co');

// Add event listener to each column
columns.on('input', saveToLocalStorage);

// Save the content to local storage
function saveToLocalStorage() {
  const journal = {
    column1: $('#column1').html(),
    column2: $('#column2').html(),
    column3: $('#column3').html(),
  };
  localStorage.setItem('journal', JSON.stringify(journal));
}

// Load the content from local storage
$(window).on('load', function () {
  const storedData = JSON.parse(localStorage.getItem('journal'));

  if (storedData) {
    $.each(storedData, function (key, value) {
      $('#' + key).html(value);
    });
  }
});

// Add event listener to the reset button
$('#reset-list').on('click', resetJournal);

// Reset the journal
function resetJournal() {
  localStorage.removeItem('journal');
  columns.html('');
}