import { NumericTypeError } from "../../utils/errors";
import { assertInteger } from "../../utils/validate";
import { assertRandom, draw } from "../../utils/random";
import { checkBigInt, guardBigInt, outOfRange } from "../../utils/numeric";

/** Largest span a `number` range may cover: beyond 2^53 a double cannot hit every integer. */
const MAX_NUMBER_SPAN = 2 ** 53;
/** Draws made before falling back to a modulo reduction (only a degenerate `random` ever gets there). */
const MAX_REJECTIONS = 64;
/** Spans up to this size are drawn directly from a single `random()` value. */
const DIRECT_SPAN = 2n ** 32n;

const bitLength = (value: bigint): number => (value === 0n ? 0 : value.toString(16).length * 4);

/** Bigint in [0, span): one draw for small spans, otherwise uniform from 32-bit chunks by rejection sampling. */
const randomBelow = (span: bigint, random: () => number): bigint => {
  // Same `floor(random() * span)` convention as the number overload; the bias for a
  // span below 2^32 is under 2^-21 of a count.
  if (span <= DIRECT_SPAN) return BigInt(Math.floor(draw(random) * Number(span)));
  const bits = bitLength(span - 1n) || 1;
  const chunks = Math.ceil(bits / 32);
  const excess = BigInt(chunks * 32 - bits);
  let candidate = 0n;
  for (let attempt = 0; attempt < MAX_REJECTIONS; attempt++) {
    candidate = 0n;
    for (let i = 0; i < chunks; i++) {
      const word = Math.floor(draw(random) * 4294967296);
      candidate = (candidate << 32n) | BigInt(word >>> 0);
    }
    candidate >>= excess;
    if (candidate < span) return candidate;
  }
  return candidate % span;
};

/**
 * Random integer in the inclusive range `[min, max]`.
 *
 * - `number` bounds: a span of up to 2^53 values, drawn as `min + floor(random() * span)`.
 * - `bigint` bounds: any size, drawn uniformly from 32-bit chunks of `random()`.
 *
 * `random` defaults to `Math.random`, which is not cryptographically secure; inject
 * `() => crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32` when that matters.
 */
export function randomInt(min: number, max: number, random?: () => number): number;
export function randomInt(min: bigint, max: bigint, random?: () => number): bigint;
export function randomInt(min: number | bigint, max: number | bigint, random: () => number = Math.random): number | bigint {
  assertRandom(random);
  if (typeof min === "bigint" && typeof max === "bigint") {
    checkBigInt(min, "min");
    checkBigInt(max, "max");
    if (min > max) throw outOfRange("min must be less than or equal to max");
    return guardBigInt(() => min + randomBelow(max - min + 1n, random));
  }
  if (typeof min === "bigint" || typeof max === "bigint") {
    throw new NumericTypeError("ERR_INVALID_NUMBER", "min and max must both be numbers or both be bigints");
  }
  assertInteger(min, "min");
  assertInteger(max, "max");
  if (min > max) throw outOfRange("min must be less than or equal to max");
  const span = max - min + 1;
  if (span > MAX_NUMBER_SPAN) {
    throw outOfRange("The range is wider than 2^53; pass bigint bounds instead");
  }
  return min + Math.floor(draw(random) * span);
}
