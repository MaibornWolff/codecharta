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
	console.log({
		leftEnd: leftThumbPosition - 8, // shift so that middle is on 0
		rightStart: rightThumbPosition - 8
	})
	return {
		leftEnd: leftThumbPosition,
		rightStart: rightThumbPosition
	}
}

type ThumbPosition2ValueArgument = {
	thumbXStart: number
	minValue: number
	maxValue: number
	roundFunction: typeof Math.floor | typeof Math.ceil
}

export const thumbPosition2Value = ({ thumbXStart, minValue, maxValue, roundFunction }: ThumbPosition2ValueArgument) => {
	const xPositionWithinSlider = thumbXStart + 8
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
