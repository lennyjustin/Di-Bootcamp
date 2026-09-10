// Exercise 1: Comparison
function compareToTen(num) {
	return new Promise((resolve, reject) => {
		if (num <= 10) {
			resolve(`${num} is less than or equal to 10`);
		} else {
			reject(`${num} is greater than 10`);
		}
	});
}

compareToTen(15)
	.then((result) => console.log(result))
	.catch((error) => console.log(error));

compareToTen(8)
	.then((result) => console.log(result))
	.catch((error) => console.log(error));

// Exercise 2: Promise resolving after four seconds
const successPromise = new Promise((resolve) => {
	setTimeout(() => resolve("success"), 4000);
});

successPromise.then((result) => console.log(result));

// Exercise 3: Promise.resolve and Promise.reject
const resolvedValue = Promise.resolve(3);
resolvedValue.then((value) => console.log(value));

const rejectedValue = Promise.reject("Boo!");
rejectedValue.catch((error) => console.log(error));
