import { DomainWord } from "../../../model/codeCharta.model"

export const CANVAS_FILL_RATIO = 0.9

const BOLD_GLYPH_WIDTH_RATIO = 0.62
const MIN_RENDERABLE_FONT_SIZE = 1

export function fitSizeRangeToContainer(
    sizeRange: [number, number],
    words: DomainWord[],
    drawOutOfBound: boolean,
    containerWidth?: number
): [number, number] {
    const [minSize, maxSize] = sizeRange
    if (drawOutOfBound || !containerWidth || words.length === 0) {
        return sizeRange
    }
    const longestWordLength = Math.max(...words.map(word => word.text.length))
    const fittingMaxSize = (containerWidth * CANVAS_FILL_RATIO) / (longestWordLength * BOLD_GLYPH_WIDTH_RATIO)
    const clampedMaxSize = Math.max(Math.min(maxSize, Math.floor(fittingMaxSize)), MIN_RENDERABLE_FONT_SIZE)
    return [Math.min(minSize, clampedMaxSize), clampedMaxSize]
}
