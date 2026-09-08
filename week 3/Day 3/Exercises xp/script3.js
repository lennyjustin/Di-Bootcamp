let allBoldItems;

function getBoldItems() {
    const paragraph = document.getElementById("sentence");
    allBoldItems = paragraph.querySelectorAll("strong");
}

function highlight() {
    allBoldItems.forEach(function (item) {
        item.style.color = "blue";
    });
}

function returnItemsToDefault() {
    allBoldItems.forEach(function (item) {
        item.style.color = "black";
    });
}

// Initialize on page load
window.addEventListener("load", getBoldItems);

const paragraph = document.getElementById("sentence");

paragraph.addEventListener("mouseover", highlight);
paragraph.addEventListener("mouseout", returnItemsToDefault);