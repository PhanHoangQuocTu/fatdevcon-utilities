import Decimal from "decimal.js";

/* Calculation utilities */
const summary = (a: number, b: number): number => {
  const aValue = new Decimal(a);
  const bValue = new Decimal(b);
  return aValue.add(bValue).toNumber();
};

const subtract = (a: number, b: number): number => {
  const aValue = new Decimal(a);
  const bValue = new Decimal(b);
  return aValue.sub(bValue).toNumber();
};

const multiply = (a: number, b: number): number => {
  const aValue = new Decimal(a);
  const bValue = new Decimal(b);
  return aValue.mul(bValue).toNumber();
};

const divide = (a: number, b: number): number => {
  if (b === 0) {
    throw new Error("Division by zero");
  }

  const aValue = new Decimal(a);
  const bValue = new Decimal(b);
  return aValue.div(bValue).toNumber();
};

/* Math utilities */
const percentage = (value: number, total: number): number => {
  if (total === 0) return 0;

  return multiply(divide(value, total), 100);
};

const round = (value: number, decimals = 2): number => {
  const numberValue = new Decimal(value);
  return numberValue.toDecimalPlaces(decimals).toNumber();
};

const gcdDecimal = (a: Decimal, b: Decimal): Decimal => {
  a = a.abs();
  b = b.abs();
  while (!b.isZero()) {
    const temp = b;
    b = a.mod(b);
    a = temp;
  }
  return a;
};

const factorial = (n: number): number => {
  if (n < 0) {
    throw new Error("Factorial of negative number is not defined");
  }
  if (n === 0 || n === 1) {
    return 1;
  }
  let result = new Decimal(1);
  for (let i = 2; i <= n; i++) {
    result = result.mul(i);
  }
  return result.toNumber();
};

const gcd = (a: number, b: number): number => {
  return gcdDecimal(new Decimal(a), new Decimal(b)).toNumber();
};

const lcm = (a: number, b: number): number => {
  if (a === 0 || b === 0) {
    return 0;
  }
  const da = new Decimal(a).abs();
  const db = new Decimal(b).abs();
  return da.mul(db).div(gcdDecimal(da, db)).toNumber();
};

const isPrime = (n: number): boolean => {
  n = Math.floor(n);
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
};

const fibonacci = (n: number): number => {
  if (n < 0) {
    throw new Error("Fibonacci of negative number is not defined");
  }
  if (n === 0) return 0;
  if (n === 1) return 1;
  let a = new Decimal(0);
  let b = new Decimal(1);
  for (let i = 2; i <= n; i++) {
    const temp = a.add(b);
    a = b;
    b = temp;
  }
  return b.toNumber();
};

export {
  summary,
  subtract,
  multiply,
  divide,
  percentage,
  round,
  factorial,
  gcd,
  lcm,
  isPrime,
  fibonacci,
};
