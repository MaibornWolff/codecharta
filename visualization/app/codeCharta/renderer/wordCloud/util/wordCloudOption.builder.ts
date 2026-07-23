import { DomainWord } from "../../../model/codeCharta.model"
import { WordCloudSettings, WordCloudShape, wordSizingValue } from "../../../model/wordCloud.model"
import { getWordCloudColors } from "./color.util"
import { selectTopWords } from "./topWords"
import { WordCloudDatum, WordCloudOption, WordCloudRenderContext } from "./wordCloudOption.model"
import { CANVAS_FILL_RATIO, fitSizeRangeToContainer } from "./wordCloudSizeRange"
import { buildTooltipFormatter } from "./wordCloudTooltip"
import { colorForWord } from "./wordCloudWordColor"

const EMPHASIS_SHADOW_BLUR = 10
const EMPHASIS_SHADOW_COLOR = "#333"
const WORD_FONT_FAMILY = 'Roboto, "Helvetica Neue", sans-serif'
const BLURRED_WORD_OPACITY = 0.55

export function buildWordCloudOption(
    words: DomainWord[],
    settings: WordCloudSettings,
    context: WordCloudRenderContext = {}
): WordCloudOption {
    const topWords = selectTopWords(words, settings.sizingMode, settings.topN)
    const sizeRange = fitSizeRangeToContainer(settings.sizeRange, topWords, settings.drawOutOfBound, context.containerWidth)
    const { shape, maskImage, keepAspect } = resolveLayoutShape(settings.shape, context.maskImage)

    return {
        aria: { enabled: true },
        tooltip: { show: true, formatter: buildTooltipFormatter() },
        series: [
            {
                type: "wordCloud",
                shape,
                maskImage,
                keepAspect,
                left: "center",
                top: "center",
                width: `${CANVAS_FILL_RATIO * 100}%`,
                height: `${CANVAS_FILL_RATIO * 100}%`,
                sizeRange,
                rotationRange: settings.rotationRange,
                rotationStep: settings.rotationStep,
                gridSize: settings.gridSize,
                drawOutOfBound: settings.drawOutOfBound,
                shrinkToFit: settings.shrinkToFit,
                layoutAnimation: context.layoutAnimation ?? true,
                textStyle: { fontFamily: WORD_FONT_FAMILY, fontWeight: "bold" },
                emphasis: { textStyle: { textShadowBlur: EMPHASIS_SHADOW_BLUR, textShadowColor: EMPHASIS_SHADOW_COLOR } },
                blur: { textStyle: { opacity: BLURRED_WORD_OPACITY } },
                data: toWordCloudData(topWords, settings)
            }
        ]
    }
}

function toWordCloudData(topWords: DomainWord[], settings: WordCloudSettings): WordCloudDatum[] {
    const [startColor, endColor] = getWordCloudColors()
    return topWords.map(word => ({
        name: word.text,
        value: wordSizingValue(word, settings.sizingMode),
        frequency: word.frequency,
        tfidf: word.tfidf,
        textStyle: { color: colorForWord(word.text, startColor, endColor) }
    }))
}

function resolveLayoutShape(
    configuredShape: WordCloudShape,
    maskImage: object | undefined
): { shape: string; maskImage?: object; keepAspect: boolean } {
    const laysWordsOutInsideMask = configuredShape === WordCloudShape.logoM
    if (!laysWordsOutInsideMask) {
        return { shape: configuredShape, maskImage: undefined, keepAspect: false }
    }
    return { shape: WordCloudShape.circle, maskImage, keepAspect: true }
}
