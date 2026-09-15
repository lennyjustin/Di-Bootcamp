// Exercise 1: Class Inheritance with Protected Access Modifiers
class Employee {
    constructor(
        protected name: string,
        protected salary: number
    ) {}

    public getDetails(): string {
        return `${this.name} earns $${this.salary}`;
    }
}

class Manager extends Employee {
    constructor(
        name: string,
        salary: number,
        public department: string
    ) {
        super(name, salary);
    }

    public getDetails(): string {
        return `${this.name} earns $${this.salary} and manages the ${this.department} department`;
    }
}

const manager = new Manager("Alice", 75000, "IT");
console.log(manager.getDetails());


// Exercise 2: Using Readonly with Access Modifiers
class Car {
    constructor(
        public readonly make: string,
        private readonly model: string,
        public year: number
    ) {}

    public getCarDetails(): string {
        return `${this.make} ${this.model}, ${this.year}`;
    }
}

const car = new Car("Toyota", "Corolla", 2024);
console.log(car.getCarDetails());

// These produce errors because the properties are readonly:
// car.make = "Honda";
// car.model = "Civic";


// Exercise 3: Static Properties and Methods
class MathUtils {
    public static readonly PI = 3.14159;

    public static circumference(radius: number): number {
        return 2 * MathUtils.PI * radius;
    }
}

console.log(MathUtils.circumference(5));


// Exercise 4: Interface with Function Types
interface Operation {
    calculate(a: number, b: number): number;
}

class Addition implements Operation {
    public calculate(a: number, b: number): number {
        return a + b;
    }
}

class Multiplication implements Operation {
    public calculate(a: number, b: number): number {
        return a * b;
    }
}

const addition = new Addition();
const multiplication = new Multiplication();

console.log(addition.calculate(10, 5));
console.log(multiplication.calculate(10, 5));


// Exercise 5: Extending Interfaces
interface Shape {
    color: string;
    getArea(): number;
}

interface Rectangle extends Shape {
    readonly width: number;
    readonly height: number;
    getPerimeter(): number;
}

class ColoredRectangle implements Rectangle {
    constructor(
        public color: string,
        public readonly width: number,
        public readonly height: number
    ) {}

    public getArea(): number {
        return this.width * this.height;
    }

    public getPerimeter(): number {
        return 2 * (this.width + this.height);
    }
}

const rectangle = new ColoredRectangle("blue", 10, 5);

console.log(`Area: ${rectangle.getArea()}`);
console.log(`Perimeter: ${rectangle.getPerimeter()}`);

export {};