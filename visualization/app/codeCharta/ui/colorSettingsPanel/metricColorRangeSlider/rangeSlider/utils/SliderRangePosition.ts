import { sliderWidth } from "../rangeSlider.component"

export type SliderRangePosition = {
	leftEnd: number
	rightStart: number
}

export type CalculateSliderRangePositionArgument = {
	minValue: number
	maxValue: number
	currentLeftValue: number
	currentRightValue: number
}

export const calculateSliderRangePosition = ({
	minValue,
	maxValue,
	currentLeftValue,
	currentRightValue
}: CalculateSliderRangePositionArgument): SliderRangePosition => {
	const totalFraction = maxValue - minValue
	const leftFraction = (currentLeftValue - minValue) / totalFraction
	const rightFraction = (currentRightValue - minValue) / totalFraction
	const leftThumbPosition = leftFraction * sliderWidth
	const rightThumbPosition = rightFraction * sliderWidth
	return {
		leftEnd: leftThumbPosition,
		rightStart: rightThumbPosition
	}
}

type ThumbPosition2ValueArgument = {
	thumbX: number
	minValue: number
	maxValue: number
}

export const thumbPosition2Value = ({ thumbX, minValue, maxValue }: ThumbPosition2ValueArgument) => {
	const valuePerPixel = (maxValue - minValue) / sliderWidth
	const value = minValue + thumbX * valuePerPixel
	return Math.round(value)
}
