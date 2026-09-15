// Exercise 1: Conditional Types

type MappedType<T> = T extends number ? number : T extends string ? number : never;

function mapType<T extends number | string>(value: T): MappedType<T> {
  if (typeof value === "number") {
    return (value * value) as MappedType<T>;
  }

  return value.length as MappedType<T>;
}

console.log(mapType(4));
console.log(mapType("hello"));

// Exercise 2: Keyof and Lookup Types

function getProperty<T extends object, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = {
  name: "Alice",
  age: 30,
  city: "Paris",
};

console.log(getProperty(user, "name"));
console.log(getProperty(user, "age"));
console.log(getProperty(user, "city"));

// Exercise 3: Using Interfaces with Numeric Properties in TypeScript

interface HasNumericProperty {
  [key: string]: number;
}

function multiplyProperty<T extends HasNumericProperty, K extends keyof T>(
  obj: T,
  key: K,
  factor: number
): number {
  return obj[key] * factor;
}

const stats = {
  price: 20,
  quantity: 3,
  discount: 2,
};

console.log(multiplyProperty(stats, "price", 2));
console.log(multiplyProperty(stats, "quantity", 5));
console.log(multiplyProperty(stats, "discount", 10));
