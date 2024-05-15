export const getReadableColorForBackground = (hex: string) => {
    // algorithm taken from https://24ways.org/2010/calculating-color-contrast/
    const r = Number.parseInt(hex.slice(1, 3), 16)
    const g = Number.parseInt(hex.slice(3, 5), 16)
    const b = Number.parseInt(hex.slice(5, 7), 16)
    const yiqRatio = (r * 299 + g * 587 + b * 114) / 1000
    return yiqRatio >= 128 ? "black" : "white"
}
