// Exercise 1: Intersection Types
type Person = {
	name: string;
	age: number;
};

type Address = {
	street: string;
	city: string;
};

export type PersonWithAddress = Person & Address;

export const personWithAddress: PersonWithAddress = {
	name: "Alice",
	age: 30,
	street: "123 Main Street",
	city: "New York",
};

console.log(personWithAddress);


// Exercise 2: Type Guards with Union Types
export function describeValue(value: number | string): string {
	if (typeof value === "number") {
		return "This is a number";
	}

	return "This is a string";
}

console.log(describeValue(42));
console.log(describeValue("Hello"));


// Exercise 3: Type Casting
const someValue: any = "This value is treated as a string";
const stringValue = someValue as string;
console.log(stringValue.toUpperCase());


// Exercise 4: Type Assertions with Union Types
export function getFirstElement(elements: (number | string)[]): string {
	return elements[0] as string;
}

console.log(getFirstElement(["first", 2, "third"]));
console.log(getFirstElement(["one", "two"]));


// Exercise 5: Generic Constraints
export function logLength<T extends { length: number }>(value: T): void {
	console.log(value.length);
}

logLength("TypeScript");
logLength([1, 2, 3]);


// Exercise 6: Intersection Types and Type Guards
type Job = {
	position: string;
	department: string;
};

type Manager = Job & {
	position: "Manager";
};

type Developer = Job & {
	position: "Developer";
};

export type Employee = Person & (Manager | Developer);

export function describeEmployee(employee: Employee): string {
	if (employee.position === "Manager") {
		return `${employee.name} is a manager in the ${employee.department} department.`;
	}

	return `${employee.name} is a developer in the ${employee.department} department.`;
}

const manager: Employee = {
	name: "Bob",
	age: 40,
	position: "Manager",
	department: "Sales",
};

const developer: Employee = {
	name: "Carol",
	age: 28,
	position: "Developer",
	department: "Engineering",
};

console.log(describeEmployee(manager));
console.log(describeEmployee(developer));


// Exercise 7: Type Assertions and Generic Constraints
export function formatInput<T extends { toString(): string }>(value: T): string {
	const formattedValue = String(value) as string;
	return formattedValue;
}

console.log(formatInput("hello"));
console.log(formatInput(123));

export {};
