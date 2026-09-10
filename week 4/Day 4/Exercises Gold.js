// Exercise 1: Promise.all()
const promise1 = Promise.resolve(3);
const promise2 = 42;
const promise3 = new Promise((resolve) => {
	setTimeout(resolve, 3000, "foo");
});

Promise.all([promise1, promise2, promise3])
	.then((values) => {
		console.log(values);
	})
	.catch((error) => {
		console.error(error);
	});

// Promise.all() waits for every item to resolve and returns their values in
// the same order as the input array. It also accepts ordinary values such as
// 42, which are treated as already-resolved promises. Therefore, the output
// is [3, 42, "foo"]. If any promise rejects, Promise.all() rejects instead.

// Exercise 2: Analyse Promise.all()
function timesTwoAsync(x) {
	return new Promise((resolve) => resolve(x * 2));
}

const arr = [1, 2, 3];
const promiseArr = arr.map(timesTwoAsync);

Promise.all(promiseArr)
	.then((result) => {
		// Each array value is multiplied by two, so the output is [2, 4, 6].
		console.log(result);
	})
	.catch((error) => {
		console.error(error);
	});
