const article = document.querySelector("article");
const h1 = article.querySelector("h1");
const h2 = article.querySelector("h2");
const h3 = article.querySelector("h3");
const paragraphs = article.querySelectorAll("p");
const lastParagraph = paragraphs[paragraphs.length - 1];
const boldBtn = document.getElementById("boldBtn");

// 1. Retrieve the h1 and console.log it
console.log(h1);

// 2. Remove the last paragraph
lastParagraph.remove();

// 3. Change h2 background to red when clicked
h2.addEventListener("click", function () {
    h2.style.backgroundColor = "red";
});

// 4. Hide h3 when clicked
h3.addEventListener("click", function () {
    h3.style.display = "none";
});

// 5. Make all paragraphs bold when button is clicked
boldBtn.addEventListener("click", function () {
    paragraphs.forEach(function (p) {
        p.style.fontWeight = "bold";
    });
});

// BONUS 1: Random font size on h1 hover (0 to 100px)
h1.addEventListener("mouseover", function () {
    const randomSize = Math.floor(Math.random() * 101);
    h1.style.fontSize = randomSize + "px";
});

// BONUS 2: Fade out the 2nd paragraph on hover
const secondParagraph = paragraphs[1];

secondParagraph.addEventListener("mouseover", function () {
    secondParagraph.classList.add("fade-out");
});