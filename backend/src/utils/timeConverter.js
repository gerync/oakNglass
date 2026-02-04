export default function ConvertNumberWithUnit(numberwUnit) {
    const units = {
        's': 1,
        'm': 60,
        'h': 60 * 60,
        'd': 24 * 60 * 60,
        'w': 7 * 24 * 60 * 60,
        'M': 30 * 24 * 60 * 60,
        'y': 365 * 24 * 60 * 60
    };
    const unit = numberwUnit.slice(-1);
    const number = parseInt(numberwUnit.slice(0, -1));
    if (isNaN(number) || !units[unit]) {
        throw new Error('Invalid time format');
    }
    return number * units[unit];
}