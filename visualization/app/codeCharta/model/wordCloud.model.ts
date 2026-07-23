// Word-cloud render settings. Kept in the model kernel (not the wordCloud feature) so both the
// stores/domainState state home that owns them and the wordCloud renderer that consumes them can import
// them without a store→feature edge.

import type { DomainWord } from "./domain.model"

/**
 * The value that drives a word's size, per the sizing mode; tfidf falls back to frequency when absent.
 *
 * Shared so that everything ranking or sizing words agrees: tfidf mode is enabled when *any* word
 * carries a score, so in a mixed dataset a scoreless word must still fall back to its frequency.
 */
export function wordSizingValue(word: DomainWord, sizingMode: WordCloudSizingMode): number {
    if (sizingMode === WordCloudSizingMode.tfidf) {
        return word.tfidf ?? word.frequency
    }
    return word.frequency
}

/** The ECharts word-cloud layout shapes (see echarts-wordcloud). */
export enum WordCloudShape {
    circle = "circle",
    cardioid = "cardioid",
    diamond = "diamond",
    triangle = "triangle",
    pentagon = "pentagon",
    star = "star"
}

/**
 * User-facing labels for the layout shapes. The enum values are the raw echarts-wordcloud API strings;
 * 'cardioid' in particular is math jargon (heart-shaped) that no user vocabulary contains, so the UI
 * shows these instead of the enum value verbatim.
 */
export const wordCloudShapeLabels: Record<WordCloudShape, string> = {
    [WordCloudShape.circle]: "Circle",
    [WordCloudShape.cardioid]: "Heart",
    [WordCloudShape.diamond]: "Diamond",
    [WordCloudShape.triangle]: "Triangle",
    [WordCloudShape.pentagon]: "Pentagon",
    [WordCloudShape.star]: "Star"
}

/** Which word metric drives a word's rendered size. `tfidf` is only offered when the data carries it. */
export enum WordCloudSizingMode {
    frequency = "frequency",
    tfidf = "tfidf"
}

/**
 * The render controls the domain settings bar owns and the word-cloud renderer consumes. A pure value
 * object so the option builder is unit-testable without a live chart (see wordCloudOption.builder).
 */
export interface WordCloudSettings {
    shape: WordCloudShape
    /** [min, max] font size in px. */
    sizeRange: [number, number]
    /** [min, max] word rotation in degrees. */
    rotationRange: [number, number]
    /** Rotation quantization step in degrees. */
    rotationStep: number
    /** Layout grid spacing in px — larger means fewer, more spread-out words. */
    gridSize: number
    sizingMode: WordCloudSizingMode
    /** Keep only the top-N words by value. Matches the DomainLanguageCharta default. */
    topN: number
    /**
     * What happens to a word the layout cannot place. When true it is shrunk (repeatedly, to 3/4 its
     * weight) until it fits, so the cloud draws the requested word count — at the cost of tail words
     * rendering below `sizeRange[0]`. When false the word is left out, so `sizeRange` is exact but
     * fewer words than `topN` appear.
     */
    shrinkToFit: boolean
    /**
     * Allows words to render partially outside the layout canvas instead of being dropped or shrunk
     * when they only fit overlapping the edge. Trades clean edges for word count.
     */
    drawOutOfBound: boolean
}

/**
 * Defaults for the word-cloud controls. Most values match DomainLanguageCharta (the tool this renderer
 * was ported from) so a project looks the same in both. The domain bar seeds its slices from these.
 *
 * Rotation intentionally diverges from that parity for legibility: DomainLanguageCharta's `rotationStep`
 * of 45° makes four of five reachable angles diagonal, so nearly every word is tilted and hard to read.
 * Widening the step to 90° over the same [-90, 90] range leaves only -90°, 0° and 90° — words are drawn
 * horizontal or vertical, never diagonally. Because echarts-wordcloud picks the angle by rounding a
 * uniform draw onto the step grid, 0° sits in the fat middle bucket and lands ~50% of the time, so
 * horizontal is the dominant orientation and the rest split evenly between the two vertical directions
 * (the standard word-cloud convention: mostly horizontal with a few vertical).
 */
export const defaultWordCloudSettings: WordCloudSettings = {
    shape: WordCloudShape.circle,
    sizeRange: [12, 60],
    rotationRange: [-90, 90],
    rotationStep: 90,
    gridSize: 8,
    sizingMode: WordCloudSizingMode.frequency,
    topN: 150,
    // Defaults to shrinking rather than dropping: with both this and drawOutOfBound off, the layout
    // silently leaves out every word it cannot place, so the cloud shows fewer words than topN.
    shrinkToFit: true,
    drawOutOfBound: false
}

/** Replace one end of a [min, max] range while keeping the other — one home for the tuple-index bookkeeping. */
export const withRangeMin = (range: [number, number], min: number): [number, number] => [min, range[1]]
export const withRangeMax = (range: [number, number], max: number): [number, number] => [range[0], max]
