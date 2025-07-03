
export const parseNumericValue = (value: string | undefined | null): number | null => {
    if (!value) return null;

    let numericString = value.toString().toLowerCase().replace(/approx\.|\$|,|sq km|%/g, '').trim();

    const multipliers: { [key: string]: number } = {
        'billion': 1e9,
        'million': 1e6,
        'trillion': 1e12,
        'k': 1e3
    };

    let multiplier = 1;
    for (const key in multipliers) {
        if (numericString.includes(key)) {
            multiplier = multipliers[key];
            numericString = numericString.replace(key, '').trim();
            break;
        }
    }

    const number = parseFloat(numericString);
    if (isNaN(number)) {
        return null;
    }

    return number * multiplier;
}
