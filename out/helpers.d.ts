export declare const applyRegex: (pattern: RegExp | string, string: string, keepIndexes?: number[]) => string[];
/**
 * Compact an array of objects
 * @param array
 * @returns
 */
export declare const compact: <T>(array: T[]) => T[];
/**
 * Check if all values in an array are null
 * @param array
 * @returns
 */
export declare const valuesNull: <T>(array: T[]) => boolean;
