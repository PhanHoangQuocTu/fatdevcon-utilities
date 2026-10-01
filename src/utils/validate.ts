export const assertFiniteNumber = (value: unknown, name: string): void => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number, received ${String(value)}`);
  }
};

export const assertInteger = (value: unknown, name: string): void => {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new TypeError(`${name} must be an integer, received ${String(value)}`);
  }
};

export const assertArray = (value: unknown, name: string): void => {
  if (!Array.isArray(value)) {
    throw new TypeError(`${name} must be an array, received ${String(value)}`);
  }
};
