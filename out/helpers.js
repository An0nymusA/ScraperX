export const applyRegex = (pattern, string, keepIndexes = []) => {
    const regex = new RegExp(pattern);
    const exec = regex.exec(string);
    return exec
        ? exec
            .filter((value, index) => {
            return (value &&
                index != 0 &&
                value.trim() != '' &&
                (keepIndexes.length > 0
                    ? keepIndexes.includes(index - 1)
                    : true));
        })
            .map((value) => value.trim())
        : [];
};
/**
 * Compact an array of objects
 * @param array
 * @returns
 */
export const compact = (array) => {
    return array.reduce((acc, cur) => {
        const entry = Object.entries(cur)[0];
        acc[entry[0]] = entry[1];
        return acc;
    }, {});
};
/**
 * Check if all values in an array are null
 * @param array
 * @returns
 */
export const valuesNull = (array) => {
    return Object.values(array).every((value) => value == null);
};
//# sourceMappingURL=helpers.js.map