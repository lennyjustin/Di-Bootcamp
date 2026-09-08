const colorSelect = document.getElementById("colorSelect");
const removeButton = document.getElementById("removeBtn");

function removecolor() {
    const selectedIndex = colorSelect.selectedIndex;

    if (selectedIndex !== -1) {
        colorSelect.remove(selectedIndex);
    }
}

removeButton.addEventListener("click", removecolor);