function calculateTip() {
    const billAmount = document.getElementById("billAmt").value;
    const serviceQuality = parseFloat(document.getElementById("serviceQual").value);
    const numberOfPeopleInput = document.getElementById("numOfPeople").value;
    const eachParagraph = document.getElementById("each");
    const totalTipDiv = document.getElementById("totalTip");
    const tipSpan = document.getElementById("tip");

    // First condition: serviceQuality is zero or billAmount is empty
    if (serviceQuality === 0 || billAmount === "") {
        alert("Please enter a valid bill amount and select a service quality greater than 0.");
        return;
    }

    // Second condition: numberOfPeople is empty or smaller than 1
    let numberOfPeople = parseInt(numberOfPeopleInput);

    if (numberOfPeopleInput === "" || numberOfPeople < 1) {
        numberOfPeople = 1;
        eachParagraph.style.display = "none";
    } else {
        eachParagraph.style.display = "block";
    }

    // Calculate total tip per person
    const total = (billAmount * serviceQuality) / numberOfPeople;
    const roundedTotal = total.toFixed(2);

    // Display the result
    totalTipDiv.style.display = "block";
    tipSpan.textContent = roundedTotal;
}

// Call the function when the calculate button is clicked
document.getElementById("calculate").onclick = calculateTip;