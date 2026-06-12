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

export const clampToRange = (value: number, lowerBound: number, upperBound: number) => {
    return Math.min(Math.max(value, lowerBound), upperBound)
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
    const leftEnd = clampToRange(leftFraction * sliderWidth, 0, sliderWidth)
    const rightStart = clampToRange(rightFraction * sliderWidth, leftEnd, sliderWidth)
    return { leftEnd, rightStart }
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
    /** Logical position of the other thumb within the track, NOT a screen coordinate. */
    otherThumbX: number
    sliderBoundingClientRectX: number
    sliderWidth: number
    minValue: number
    maxValue: number
}

export const updateLeftThumb = (argument: UpdateThumbXArgument) => {
    return updateThumb(argument, { lowerBound: 0, upperBound: argument.otherThumbX })
}

export const updateRightThumb = (argument: UpdateThumbXArgument) => {
    return updateThumb(argument, { lowerBound: argument.otherThumbX, upperBound: argument.sliderWidth })
}

type ThumbBounds = {
    lowerBound: number
    upperBound: number
}

const updateThumb = (
    { deltaX, thumbScreenX, thumbRadius, sliderBoundingClientRectX, sliderWidth, minValue, maxValue }: UpdateThumbXArgument,
    { lowerBound, upperBound }: ThumbBounds
) => {
    const movedThumbX = thumbScreenX + deltaX - sliderBoundingClientRectX + thumbRadius
    // Clamping happens in logical track pixels: screen rects can disagree with the logical
    // position by subpixel amounts (zoom, scale animations), which must never cross the thumbs.
    const updatedThumbX = clampToRange(movedThumbX, lowerBound, upperBound)
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
