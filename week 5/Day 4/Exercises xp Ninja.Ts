// Exercise 1: TypeScript Generics and Intersection Types
export class Container<T> {
	private readonly items: T[] = [];

	public add(item: T): void {
		this.items.push(item);
	}

	public remove(): T | undefined {
		return this.items.pop();
	}

	public list(): T[] {
		return [...this.items];
	}
}

type Identified = {
	id: number;
};

type Named = {
	name: string;
};

type IdentifiedPerson = Identified & Named;

const peopleContainer = new Container<IdentifiedPerson>();
peopleContainer.add({ id: 1, name: "Alice" });
peopleContainer.add({ id: 2, name: "Bob" });
console.log(peopleContainer.list());
console.log(peopleContainer.remove());


// Exercise 2: Generic Interfaces and Type Casting
export interface Response<T> {
	status: number;
	message: string;
	data: T;
}

export function parseResponse<T>(response: Response<unknown>): T {
	return response.data as T;
}

const apiResponse: Response<unknown> = {
	status: 200,
	message: "Success",
	data: { id: 1, title: "TypeScript" },
};

const parsedPost = parseResponse<{ id: number; title: string }>(apiResponse);
console.log(parsedPost.title);


// Exercise 3: Generic Classes and Type Assertions
export class Repository<T> {
	private readonly items: T[] = [];

	public add(item: T): void {
		this.items.push(item);
	}

	public retrieve(index: number): T | undefined {
		return this.items[index] as T | undefined;
	}

	public list(): T[] {
		return [...this.items];
	}
}

const numberRepository = new Repository<number>();
numberRepository.add(10);
numberRepository.add(20);
console.log(numberRepository.retrieve(0));
console.log(numberRepository.list());

const stringRepository = new Repository<string>();
stringRepository.add("first item");
console.log(stringRepository.retrieve(0));

export {};
