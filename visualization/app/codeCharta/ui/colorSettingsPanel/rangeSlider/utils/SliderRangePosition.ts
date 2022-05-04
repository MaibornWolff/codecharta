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
