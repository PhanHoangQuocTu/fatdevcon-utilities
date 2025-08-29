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

export { summary, subtract, multiply, divide, percentage, round };
