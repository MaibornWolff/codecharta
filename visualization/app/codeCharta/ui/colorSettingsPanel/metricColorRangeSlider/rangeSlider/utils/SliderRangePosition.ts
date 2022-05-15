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
	if (totalFraction <= 0) {
		return { leftEnd: sliderWidth, rightStart: sliderWidth }
	}

	const leftFraction = (currentLeftValue - minValue) / totalFraction
	const rightFraction = (currentRightValue - minValue) / totalFraction
	const leftThumbPosition = leftFraction * sliderWidth
	const rightThumbPosition = rightFraction * sliderWidth
	return { leftEnd: leftThumbPosition, rightStart: rightThumbPosition }
}

type ThumbPosition2ValueArgument = {
	thumbX: number
	minValue: number
	maxValue: number
	sliderWidth: number
}

export const thumbPosition2Value = ({ thumbX, minValue, maxValue, sliderWidth }: ThumbPosition2ValueArgument) => {
	const valuePerPixel = (maxValue - minValue) / sliderWidth
	const value = minValue + thumbX * valuePerPixel
	return Math.round(value)
}

type UpdateThumbXArgument = {
	deltaX: number
	thumbScreenX: number
	thumbRadius: number
	otherThumbScreenX: number
	sliderBoundingClientRectX: number
	sliderWidth: number
	minValue: number
	maxValue: number
}

export const updateRightThumb = ({
	deltaX,
	thumbScreenX,
	thumbRadius,
	otherThumbScreenX,
	sliderBoundingClientRectX,
	sliderWidth,
	minValue,
	maxValue
}: UpdateThumbXArgument) => {
	let newRightThumbScreenX = thumbScreenX + deltaX

	if (newRightThumbScreenX > sliderBoundingClientRectX + sliderWidth - thumbRadius) {
		newRightThumbScreenX = sliderBoundingClientRectX + sliderWidth - thumbRadius
	}
	if (newRightThumbScreenX < otherThumbScreenX) {
		newRightThumbScreenX = otherThumbScreenX
	}

	return calculateUpdate({
		newThumbScreenX: newRightThumbScreenX,
		sliderBoundingClientRectX,
		thumbRadius,
		sliderWidth,
		minValue,
		maxValue
	})
}

export const updateLeftThumb = ({
	deltaX,
	thumbScreenX,
	thumbRadius,
	otherThumbScreenX,
	sliderBoundingClientRectX,
	sliderWidth,
	minValue,
	maxValue
}: UpdateThumbXArgument) => {
	let newLeftThumbScreenX = thumbScreenX + deltaX

	if (newLeftThumbScreenX < sliderBoundingClientRectX - thumbRadius) {
		newLeftThumbScreenX = sliderBoundingClientRectX - thumbRadius
	}
	if (newLeftThumbScreenX > otherThumbScreenX) {
		newLeftThumbScreenX = otherThumbScreenX
	}

	return calculateUpdate({
		newThumbScreenX: newLeftThumbScreenX,
		sliderBoundingClientRectX,
		thumbRadius,
		sliderWidth,
		minValue,
		maxValue
	})
}

type CalculateUpdateArgument = {
	newThumbScreenX: number
	sliderBoundingClientRectX: number
	thumbRadius: number
	sliderWidth: number
	minValue: number
	maxValue: number
}
const calculateUpdate = ({
	newThumbScreenX,
	sliderBoundingClientRectX,
	thumbRadius,
	sliderWidth,
	minValue,
	maxValue
}: CalculateUpdateArgument) => {
	// own screen.x + thumb radius - sliderStart, so thumb is centered on its value
	const updatedThumbX = newThumbScreenX - sliderBoundingClientRectX + thumbRadius
	return {
		updatedThumbX,
		upcomingValue: thumbPosition2Value({
			thumbX: updatedThumbX,
			minValue,
			maxValue,
			sliderWidth
		})
	}
}
