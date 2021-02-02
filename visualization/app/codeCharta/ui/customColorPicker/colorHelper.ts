export const isSameHexColor = (hex1: string, hex2: string) => normalizeHex(hex1) === normalizeHex(hex2)

export const normalizeHex = (hex: string) => (hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex)

export const hasValidHexLength = (hex: string) => hex.length === 4 || hex.length === 7

export const getReadableColorForBackground = (hex: string) => {
	// algorithm taken from https://24ways.org/2010/calculating-color-contrast/
	const r = Number.parseInt(hex.slice(1, 3), 16)
	const g = Number.parseInt(hex.slice(3, 5), 16)
	const b = Number.parseInt(hex.slice(5, 7), 16)
	const yiqRatio = (r * 299 + g * 587 + b * 114) / 1000
	return yiqRatio >= 128 ? 'black' : 'white'
}
