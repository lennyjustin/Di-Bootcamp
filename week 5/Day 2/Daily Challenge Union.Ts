// Daily Challenge: Union Type Validator

function validateUnionType(value: any, allowedTypes: string[]): boolean {
  for (const type of allowedTypes) {
    if (typeof value === type) {
      return true;
    }
  }
  return false;
}

const samples = [
  42,
  "hello",
  true,
  null,
  undefined,
  { name: "Alice" },
  [1, 2, 3],
];

for (const sample of samples) {
  const result = validateUnionType(sample, ["number", "string", "boolean"]);
  console.log(`Value: ${sample} -> ${result}`);
}
