export const applyRegex = (
    pattern: RegExp | string,
    string: string,
    keepIndexes: number[] = [],
): string[] => {
    const regex = new RegExp(pattern);
    const exec = regex.exec(string);

    return exec
        ? exec
              .filter((value, index) => {
                  return (
                      value &&
                      index != 0 &&
                      value.trim() != '' &&
                      (keepIndexes.length > 0
                          ? keepIndexes.includes(index - 1)
                          : true)
                  );
              })
              .map((value) => value.trim())
        : [];
};

/**
 * Compact an array of objects
 * @param array
 * @returns
 */
export const compact = <T>(array: T[]): T[] => {
    return array.reduce((acc, cur) => {
        const entry = Object.entries(cur)[0];
        acc[entry[0]] = entry[1];
        return acc;
    }, {} as T[]);
};

/**
 * Check if all values in an array are null
 * @param array
 * @returns
 */
export const valuesNull = <T>(array: T[]): boolean => {
    return Object.values(array).every((value) => value == null);
};
