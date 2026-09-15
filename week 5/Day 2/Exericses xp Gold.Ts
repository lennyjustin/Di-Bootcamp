// Exercise 1: Union Types

function processValue(value: string | number): string {
  if (typeof value === "number") {
    return `$${value.toFixed(2)}`;
  }

  return value.split("").reverse().join("");
}

console.log(processValue(100));
console.log(processValue("hello"));

// Exercise 2: Array Type Annotations

function sumNumbersInArray(items: Array<number | string>): number {
  return items.reduce<number>((sum, item) => {
    if (typeof item === "number") {
      return sum + item;
    }
    return sum;
  }, 0);
}

console.log(sumNumbersInArray([1, "a", 2, "b", 3]));
console.log(sumNumbersInArray([10, "x", 20, 30]));

// Exercise 3: Type Aliases

type AdvancedUser = {
  name: string;
  age: number;
  address?: string;
};

function introduceAdvancedUser(user: AdvancedUser): string {
  const baseMessage = `Hello, my name is ${user.name} and I am ${user.age} years old.`;

  if (user.address) {
    return `${baseMessage} I live at ${user.address}.`;
  }

  return baseMessage;
}

console.log(introduceAdvancedUser({ name: "Alice", age: 25 }));
console.log(introduceAdvancedUser({ name: "Bob", age: 30, address: "Paris" }));

// Exercise 4: Optional Parameters

function welcomeUser(name: string, greeting: string = "Hello"): string {
  return `${greeting}, ${name}!`;
}

console.log(welcomeUser("Alice"));
console.log(welcomeUser("Bob", "Hi"));
