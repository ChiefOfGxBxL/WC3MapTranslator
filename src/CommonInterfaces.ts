/**
 * @type angle - An angle is measured in degrees, 0 <= angle < 360
 */
export type angle = number;

// TranslationError is reserved for future use in case
// additional constraints are added to translated output,
// like if WC3 has maximum string lengths, or if certain
// values must be in a specific range
export interface TranslationError {
    message: string
}

export interface WarResult {
    buffer: Buffer,
    errors?: TranslationError[]
}

export interface JsonResult<T = object> {
    json: T,
    errors?: TranslationError[]
}
