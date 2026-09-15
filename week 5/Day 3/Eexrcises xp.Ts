// Exercise 1: Access Modifiers
class Employee {
    constructor(
        private name: string,
        private salary: number,
        public position: string,
        protected department: string
    ) {}

    public getEmployeeInfo(): string {
        return `${this.name} - ${this.position}`;
    }
}

const employee = new Employee("Alice", 50000, "Developer", "IT");
console.log(employee.getEmployeeInfo());


// Exercise 2: Readonly Properties
class Product {
    constructor(
        public readonly id: number,
        public name: string,
        public price: number
    ) {}

    public getProductInfo(): string {
        return `${this.name} costs $${this.price}`;
    }
}

const product = new Product(1, "Laptop", 1200);
console.log(product.getProductInfo());

// Error: Cannot assign to 'id' because it is readonly.
// product.id = 2;


// Exercise 3: Inheritance
class Animal {
    constructor(public name: string) {}

    public makeSound(): string {
        return "Some animal sound";
    }
}

class Dog extends Animal {
    public makeSound(): string {
        return "Bark";
    }
}

const dog = new Dog("Buddy");
console.log(dog.makeSound());


// Exercise 4: Static Methods
class Calculator {
    public static add(a: number, b: number): number {
        return a + b;
    }

    public static subtract(a: number, b: number): number {
        return a - b;
    }
}

console.log(Calculator.add(10, 5));
console.log(Calculator.subtract(10, 5));


// Exercise 5: Interfaces
interface User {
    readonly id: number;
    name: string;
    email: string;
}

interface PremiumUser extends User {
    membershipLevel?: string;
}

function printUserDetails(user: PremiumUser): void {
    console.log(`ID: ${user.id}`);
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Membership: ${user.membershipLevel ?? "None"}`);
}

const premiumUser: PremiumUser = {
    id: 101,
    name: "John Doe",
    email: "john@example.com",
    membershipLevel: "Gold"
};

printUserDetails(premiumUser);


// Exercise 6: Function Type in an Interface
interface Operation {
    (a: number, b: number): number;
}

const multiply: Operation = (a, b) => a * b;

console.log(multiply(4, 5));

export {};