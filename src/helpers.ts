module.exports.applyRegex = (
    pattern: RegExp | string,
    string: string,
    keepIndexes: number[] = []
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

module.exports.compact = (array: any[]): any[] => {
    return array.reduce((acc, cur) => {
        const entry = Object.entries(cur)[0];
        acc[entry[0]] = entry[1];
        return acc;
    }, {});
};

module.exports.valuesNull = (array: {}): boolean => {
    return Object.values(array).every((value) => value == null);
};