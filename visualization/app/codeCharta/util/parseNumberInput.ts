export const parseNumberInput = (event: InputEvent, min: number, max: number) => {
	const value = Number.parseInt((event.target as HTMLInputElement).value)
	if (value < min) {
		return min
	}
	if (value > max) {
		return max
	}
	return value
}
