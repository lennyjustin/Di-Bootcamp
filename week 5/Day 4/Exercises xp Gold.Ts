// Exercise 1: Combining Intersection Types with Type Guards
export interface User {
	name: string;
	email: string;
}

export interface Admin {
	adminLevel: number;
}

export type AdminUser = User & Admin;

export function getProperty(
	user: AdminUser,
	propertyName: string,
): unknown | undefined {
	if (propertyName in user) {
		return user[propertyName as keyof AdminUser];
	}

	return undefined;
}

const adminUser: AdminUser = {
	name: "Alice",
	email: "alice@example.com",
	adminLevel: 3,
};

console.log(getProperty(adminUser, "name"));
console.log(getProperty(adminUser, "adminLevel"));
console.log(getProperty(adminUser, "missingProperty"));


// Exercise 2: Type Casting with Generics
type TypeConverter<T> = (value: unknown) => T;

export function castToType<T>(value: unknown, converter: TypeConverter<T>): T {
	return converter(value);
}

const castNumber = castToType("42", Number);
const castBoolean = castToType("true", Boolean);

console.log(castNumber);
console.log(castBoolean);


// Exercise 3: Type Assertions with Generic Constraints
export function getArrayLength<T extends number | string>(items: T[]): number {
	return items.length as number;
}

console.log(getArrayLength([1, 2, 3]));
console.log(getArrayLength(["one", "two"]));


// Exercise 4: Generic Interfaces with Class Implementation
export interface Storage<T> {
	add(item: T): void;
	get(index: number): T | undefined;
}

export class Box<T> implements Storage<T> {
	private readonly items: T[] = [];

	public add(item: T): void {
		this.items.push(item);
	}

	public get(index: number): T | undefined {
		return this.items[index];
	}
}

const numberBox = new Box<number>();
numberBox.add(10);
numberBox.add(20);
console.log(numberBox.get(1));

const stringBox = new Box<string>();
stringBox.add("TypeScript");
console.log(stringBox.get(0));


// Exercise 5: Combining Generic Classes with Constraints
export interface Item<T> {
	value: T;
}

export class Queue<T> {
	private readonly items: Item<T>[] = [];

	public add(item: Item<T>): void {
		this.items.push(item);
	}

	public remove(): Item<T> | undefined {
		return this.items.shift();
	}
}

const numberQueue = new Queue<number>();
numberQueue.add({ value: 1 });
numberQueue.add({ value: 2 });
console.log(numberQueue.remove());

const stringQueue = new Queue<string>();
stringQueue.add({ value: "first" });
console.log(stringQueue.remove());

export {};
