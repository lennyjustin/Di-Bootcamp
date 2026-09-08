const genresSelect = document.getElementById("genres");

// 1. Display the value of the selected option
const selectedOption = genresSelect.options[genresSelect.selectedIndex];
alert(selectedOption.value);

// 2. Add a new option: Classic
const classicOption = new Option("Classic", "classic");
genresSelect.add(classicOption);

// 3. Make the newly added option selected by default
classicOption.selected = true;