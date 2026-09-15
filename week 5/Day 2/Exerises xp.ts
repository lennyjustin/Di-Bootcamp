// Exercise 1: Hello, World!
console.log("Hello, World!");

// Exercise 2: Type Annotations
const age: number = 30;
const name: string = "Alice";
console.log("Age:", age);
console.log("Name:", name);

// Exercise 3: Union Types
let id: string | number;
id = "user-123";
console.log("ID as string:", id);
id = 42;
console.log("ID as number:", id);

// Exercise 4: if...else
function checkNumber(value: number): string {
  if (value > 0) {
    return "Positive";
  } else if (value < 0) {
    return "Negative";
  } else {
    return "Zero";
  }
}

console.log(checkNumber(5));
console.log(checkNumber(-2));
console.log(checkNumber(0));

// Exercise 5: Tuple Types
function getDetails(personName: string, personAge: number): [string, number, string] {
  return [personName, personAge, `Hello, ${personName}! You are ${personAge} years old.`];
}

const details = getDetails("Alice", 25);
console.log(details);

// Exercise 6: Object Type Annotations
type Person = {
  name: string;
  age: number;
};

function createPerson(personName: string, personAge: number): Person {
  return {
    name: personName,
    age: personAge,
  };
}

const person = createPerson("Bob", 28);
console.log(person);

// Exercise 7: Type Assertions
const inputElement = typeof document !== "undefined"
  ? (document.getElementById("myInput") as HTMLInputElement | null)
  : null;

if (inputElement) {
  inputElement.value = "TypeScript";
  console.log("Input value:", inputElement.value);
} else {
  console.log("No input element found in the DOM. This example is ready for browser use.");
}

// Exercise 8: switch statement with complex conditions
function getAction(role: string): string {
  switch (role) {
    case "admin":
      return "Manage users and settings";
    case "editor":
      return "Edit content";
    case "viewer":
      return "View content";
    case "guest":
      return "Limited access";
    default:
      return "Invalid role";
  }
}

console.log(getAction("admin"));
console.log(getAction("editor"));
console.log(getAction("viewer"));
console.log(getAction("guest"));
console.log(getAction("unknown"));

// Exercise 9: Function Overloading with Default Parameters
function greet(): string;
function greet(name: string): string;
function greet(name: string = "Guest"): string {
  return `Hello, ${name}!`;
}

console.log(greet());
console.log(greet("Charlie"));
