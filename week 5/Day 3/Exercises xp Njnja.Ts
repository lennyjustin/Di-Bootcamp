// Exercise 1: Advanced Access Modifiers and Inheritance
class Employee {
    constructor(
        public name: string,
        private age: number,
        protected salary: number
    ) {}

    protected calculateBonus(): number {
        return this.salary * 0.1;
    }

    public getSalaryDetails(): string {
        return `Salary: $${this.salary}`;
    }
}

class Manager extends Employee {
    public getSalaryDetails(): string {
        const bonus = this.calculateBonus();
        return `Salary: $${this.salary}, Bonus: $${bonus}`;
    }
}

class ExecutiveManager extends Manager {
    public approveBudget(amount: number): string {
        return `${this.name} approved a budget of $${amount}`;
    }
}

const executiveManager = new ExecutiveManager("Alice", 40, 100000);
console.log(executiveManager.getSalaryDetails());
console.log(executiveManager.approveBudget(250000));


// Exercise 2: Advanced Static Methods and Properties
class Shape {
    public static totalShapes = 0;

    constructor() {
        Shape.totalShapes++;
    }

    public static getType(): string {
        return "Shape";
    }
}

class Circle extends Shape {
    constructor(public radius: number) {
        super();
    }

    public area(): number {
        return Math.PI * this.radius ** 2;
    }

    public static getType(): string {
        return "Circle";
    }
}

class Square extends Shape {
    constructor(public side: number) {
        super();
    }

    public area(): number {
        return this.side ** 2;
    }

    public static getType(): string {
        return "Square";
    }
}

const circle = new Circle(5);
const square = new Square(4);

console.log(Circle.getType(), circle.area());
console.log(Square.getType(), square.area());
console.log(`Total shapes: ${Shape.totalShapes}`);


// Exercise 3: Complex Interfaces with Function Types
interface Calculator {
    a: number;
    b: number;
    operate(operation: (a: number, b: number) => number): number;
}

class AdvancedCalculator implements Calculator {
    constructor(
        public a: number,
        public b: number
    ) {}

    public operate(operation: (a: number, b: number) => number): number {
        return operation(this.a, this.b);
    }

    public add(): number {
        return this.operate((a, b) => a + b);
    }

    public subtract(): number {
        return this.operate((a, b) => a - b);
    }

    public multiply(): number {
        return this.operate((a, b) => a * b);
    }
}

const advancedCalculator = new AdvancedCalculator(10, 5);
console.log(advancedCalculator.add());
console.log(advancedCalculator.subtract());
console.log(advancedCalculator.multiply());


// Exercise 4: Readonly Properties in Complex Inheritance
class Device {
    constructor(public readonly serialNumber: string) {}

    public getDeviceInfo(): string {
        return `Serial number: ${this.serialNumber}`;
    }
}

class Laptop extends Device {
    constructor(
        serialNumber: string,
        public model: string,
        public price: number
    ) {
        super(serialNumber);
    }

    public getDeviceInfo(): string {
        return `${super.getDeviceInfo()}, Model: ${this.model}, Price: $${this.price}`;
    }
}

const laptop = new Laptop("SN-12345", "ThinkPad", 1200);
console.log(laptop.getDeviceInfo());

laptop.model = "ThinkPad X1";
laptop.price = 1400;
console.log(laptop.getDeviceInfo());

// laptop.serialNumber = "SN-67890"; // Error: serialNumber is readonly


// Exercise 5: Extending Multiple Interfaces with Optional and Readonly Properties
interface Product {
    readonly name: string;
    price: number;
    discount?: number;
}

interface Electronics extends Product {
    warrantyPeriod: number;
}

class Smartphone implements Electronics {
    constructor(
        public readonly name: string,
        public price: number,
        public warrantyPeriod: number,
        public discount?: number
    ) {}

    public getPriceAfterDiscount(): number {
        if (this.discount === undefined) {
            return this.price;
        }

        return this.price - (this.price * this.discount) / 100;
    }
}

const smartphone = new Smartphone("Example Phone", 1000, 24, 10);
console.log(`Final price: $${smartphone.getPriceAfterDiscount()}`);

export {};