/**
 * Machine-readable reason attached to every numeric error as `error.code`.
 *
 * - `ERR_INVALID_NUMBER`   (TypeError)  not a finite number, bigint or numeric string
 * - `ERR_NOT_INTEGER`      (TypeError)  an integer is required
 * - `ERR_DIVISION_BY_ZERO` (RangeError) divisor or modulus is 0
 * - `ERR_OVERFLOW`         (RangeError) input or result is too large
 * - `ERR_UNDERFLOW`        (RangeError) a non-zero result is too small for a `number`
 * - `ERR_OUT_OF_RANGE`     (RangeError) an argument is outside its supported range
 * - `ERR_PRECISION_LOSS`   (RangeError) the runtime cannot represent the value exactly
 */
export type NumericErrorCode =
  | "ERR_INVALID_NUMBER"
  | "ERR_NOT_INTEGER"
  | "ERR_DIVISION_BY_ZERO"
  | "ERR_OVERFLOW"
  | "ERR_UNDERFLOW"
  | "ERR_OUT_OF_RANGE"
  | "ERR_PRECISION_LOSS";

/** Thrown for a value of the wrong kind. Extends `TypeError`, so `instanceof TypeError` still works. */
export class NumericTypeError extends TypeError {
  readonly code: NumericErrorCode;
  constructor(code: NumericErrorCode, message: string) {
    super(message);
    this.name = "NumericTypeError";
    this.code = code;
  }
}

/** Thrown for a value outside the supported range. Extends `RangeError`, so `instanceof RangeError` still works. */
export class NumericRangeError extends RangeError {
  readonly code: NumericErrorCode;
  constructor(code: NumericErrorCode, message: string) {
    super(message);
    this.name = "NumericRangeError";
    this.code = code;
  }
}
