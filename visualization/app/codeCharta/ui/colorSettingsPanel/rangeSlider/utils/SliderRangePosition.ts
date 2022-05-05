export type SliderRangePosition = {
	leftEnd: number
	rightStart: number
}

export type CalculateSliderRangePositionArgument = {
	minValue: number
	maxValue: number
	currentLeftValue: number
	currentRightValue: number
	sliderWidth: number
}

export const calculateSliderRangePosition = ({
	minValue,
	maxValue,
	currentLeftValue,
	currentRightValue,
	sliderWidth
}: CalculateSliderRangePositionArgument): SliderRangePosition => {
	const totalFraction = maxValue - minValue
	const leftFraction = (currentLeftValue - minValue) / totalFraction
	const rightFraction = (currentRightValue - minValue) / totalFraction
	return {
		leftEnd: leftFraction * sliderWidth,
		rightStart: rightFraction * sliderWidth
	}
}

type ThumbPosition2ValueArgument = {
	sliderXStart: number
	thumbX: number
	sliderWidth: number
	minValue: number
	maxValue: number
	roundFunction: typeof Math.floor | typeof Math.ceil
}

export const thumbPosition2Value = ({
	sliderXStart,
	thumbX,
	sliderWidth,
	minValue,
	maxValue,
	roundFunction
}: ThumbPosition2ValueArgument) => {
	const xPositionWithinSlider = thumbX - sliderXStart
	const valuePerPixel = (maxValue - minValue) / sliderWidth
	const value = minValue + xPositionWithinSlider * valuePerPixel
	return roundFunction(value)
}

export type SliderValues = {
	minValue: number
	maxValue: number
	currentLeftValue: number
	currentRightValue: number
}

export const areSliderValuesEqual = (sv1: SliderValues, sv2: SliderValues) =>
	sv1.minValue === sv2.minValue &&
	sv1.maxValue === sv2.maxValue &&
	sv1.currentLeftValue === sv2.currentLeftValue &&
	sv1.currentRightValue === sv2.currentRightValue
