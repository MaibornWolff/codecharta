import { DomainWord } from "../../../model/codeCharta.model"
import { WordCloudSettings, WordCloudSizingMode } from "../../../model/wordCloud.model"
import { getWordCloudColors, interpolateColor, WordCloudColorPair } from "./color.util"

const EMPHASIS_SHADOW_BLUR = 10
const EMPHASIS_SHADOW_COLOR = "#333"
/** Matches the app font (app/app.scss) so the largest text on screen is not in a foreign typeface. */
const WORD_FONT_FAMILY = 'Roboto, "Helvetica Neue", sans-serif'
/** Hover highlights rather than blacking out: the other words dim, but stay readable. */
const BLURRED_WORD_OPACITY = 0.55
/** The share of the container the layout may fill. */
const CANVAS_FILL_RATIO = 0.9
/** Approximate width of a bold glyph as a fraction of its font size — used to fit the longest word. */
const BOLD_GLYPH_WIDTH_RATIO = 0.62
const TFIDF_TOOLTIP_DIGITS = 3
/** Smallest font size the layout may fall back to; below this a word is no longer a word. */
const MIN_RENDERABLE_FONT_SIZE = 1
/**
 * Share of words the layout may rotate. 1 keeps every word rotation-eligible — the look the cloud has
 * always had. It inflates rotated words' grid bounding boxes by up to √2 and costs 20-40% packing
 * density, so lowering this (wordcloud2's own default is 0.1) is the cheapest way to fit more words;
 * kept at 1 deliberately because the mostly-horizontal look was not wanted. The patch in
 * patches/echarts-wordcloud+2.1.0.patch is what makes this configurable at all.
 */
const ROTATE_RATIO = 1

/**
 * One ECharts word-cloud datum. `textStyle.color` is baked in so each word keeps its gradient stop, and
 * both metrics ride along so the tooltip can report them side by side — `value` alone only carries
 * whichever one currently drives the sizing.
 */
interface WordCloudDatum {
    name: string
    value: number
    frequency: number
    tfidf?: number
    textStyle: { color: string }
}

/** The tooltip payload echarts hands the formatter for a hovered word. */
interface WordCloudTooltipParams {
    name: string
    data: WordCloudDatum
}

/**
 * The subset of the ECharts option the renderer builds. Kept as a plain object (not an `EChartsOption`
 * import) so this builder — and its tests — never touch the echarts runtime.
 */
export interface WordCloudOption {
    aria: { enabled: true }
    tooltip: { show: true; formatter: (params: WordCloudTooltipParams) => string }
    series: [
        {
            type: "wordCloud"
            shape: string
            keepAspect: false
            left: "center"
            top: "center"
            width: string
            height: string
            sizeRange: [number, number]
            rotationRange: [number, number]
            rotationStep: number
            rotateRatio: number
            gridSize: number
            drawOutOfBound: boolean
            shrinkToFit: boolean
            layoutAnimation: boolean
            textStyle: { fontFamily: string; fontWeight: string }
            emphasis: { textStyle: { textShadowBlur: number; textShadowColor: string } }
            blur: { textStyle: { opacity: number } }
            data: WordCloudDatum[]
        }
    ]
}

/**
 * The environment the cloud renders into. Passed in rather than read here so the builder stays pure and
 * unit-testable: the component owns the DOM and the media query.
 */
export interface WordCloudRenderContext {
    colors?: WordCloudColorPair
    /** False when the user asked for reduced motion — see WCAG 2.3.3. */
    layoutAnimation?: boolean
    /** Measured container width in px; the max font size is clamped against it so no top word is dropped. */
    containerWidth?: number
}

/** The value that drives a word's size, per the sizing mode; tfidf falls back to frequency when absent. */
function wordValue(word: DomainWord, sizingMode: WordCloudSizingMode): number {
    if (sizingMode === WordCloudSizingMode.tfidf) {
        return word.tfidf ?? word.frequency
    }
    return word.frequency
}

/**
 * A stable [0, 1) gradient position derived from the word text. Deterministic on purpose: a random stop
 * would recolor the whole cloud on every rebuild, so dragging an unrelated slider would make the words
 * flicker to new hues and destroy object constancy.
 */
function gradientFactorOf(text: string): number {
    const HASH_PRIME = 31
    const HASH_MODULO = 1_000
    let hash = 0
    for (const character of text) {
        hash = (hash * HASH_PRIME + (character.codePointAt(0) ?? 0)) % HASH_MODULO
    }
    return hash / HASH_MODULO
}

/**
 * With `drawOutOfBound` off, echarts silently skips any word wider than the canvas — and because size
 * maps to rank, that would be the single most important word. Shrink the range until the longest word
 * fits the drawable width. With `drawOutOfBound` on nothing is skipped, so the range is kept as-is and
 * an oversized word overflows the edge instead.
 */
function fitSizeRange(
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

/**
 * The words the cloud actually draws: ranked by whatever drives their size, then truncated to the top-N.
 * Exported because the accessible alternatives must name the SAME words in the SAME order as the canvas —
 * ranking them independently (by raw frequency, say) makes the screen-reader list disagree with the screen.
 */
export function selectTopWords(words: DomainWord[], sizingMode: WordCloudSizingMode, topN: number): DomainWord[] {
    return [...words].sort((a, b) => wordValue(b, sizingMode) - wordValue(a, sizingMode)).slice(0, topN)
}

/**
 * Reports BOTH metrics for the hovered word, not just the one driving its size: how often the word
 * occurs and how distinctive it is answer different questions, and the cloud can only encode one of
 * them. The tfidf row is dropped entirely when the data carries no score, rather than showing a blank.
 */
function buildTooltipFormatter(): (params: WordCloudTooltipParams) => string {
    return ({ name, data }) => {
        const rows = [`<b>${name}</b>`, `Frequency: ${data.frequency}`]
        if (data.tfidf !== undefined) {
            rows.push(`TF-IDF: ${data.tfidf.toFixed(TFIDF_TOOLTIP_DIGITS)}`)
        }
        return rows.join("<br/>")
    }
}

/**
 * Builds the ECharts word-cloud option from the domain words and the settings. Words are ranked by their
 * sizing value and truncated to the top-N; each surviving word is painted a gradient stop between the two
 * theme colors, derived from its text so the color is stable across rebuilds.
 */
export function buildWordCloudOption(
    words: DomainWord[],
    settings: WordCloudSettings,
    context: WordCloudRenderContext = {}
): WordCloudOption {
    const [startColor, endColor] = context.colors ?? getWordCloudColors()
    const topWords = selectTopWords(words, settings.sizingMode, settings.topN)

    const data: WordCloudDatum[] = topWords.map(word => ({
        name: word.text,
        value: wordValue(word, settings.sizingMode),
        frequency: word.frequency,
        tfidf: word.tfidf,
        textStyle: { color: interpolateColor(startColor, endColor, gradientFactorOf(word.text)) }
    }))

    return {
        aria: { enabled: true },
        tooltip: { show: true, formatter: buildTooltipFormatter() },
        series: [
            {
                type: "wordCloud",
                shape: settings.shape,
                keepAspect: false,
                left: "center",
                top: "center",
                width: `${CANVAS_FILL_RATIO * 100}%`,
                height: `${CANVAS_FILL_RATIO * 100}%`,
                sizeRange: fitSizeRange(settings.sizeRange, topWords, settings.drawOutOfBound, context.containerWidth),
                rotationRange: settings.rotationRange,
                rotationStep: settings.rotationStep,
                rotateRatio: ROTATE_RATIO,
                gridSize: settings.gridSize,
                drawOutOfBound: settings.drawOutOfBound,
                // With drawOutOfBound false, this is what decides the fate of a word that will not fit:
                // shrink it until it does, or leave it out entirely. See WordCloudSettings.shrinkToFit.
                shrinkToFit: settings.shrinkToFit,
                layoutAnimation: context.layoutAnimation ?? true,
                textStyle: { fontFamily: WORD_FONT_FAMILY, fontWeight: "bold" },
                emphasis: { textStyle: { textShadowBlur: EMPHASIS_SHADOW_BLUR, textShadowColor: EMPHASIS_SHADOW_COLOR } },
                blur: { textStyle: { opacity: BLURRED_WORD_OPACITY } },
                data
            }
        ]
    }
}
