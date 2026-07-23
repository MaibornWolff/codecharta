export interface WordCloudDatum {
    name: string
    value: number
    frequency: number
    tfidf?: number
    textStyle: { color: string }
}

export interface WordCloudTooltipParams {
    name: string
    data: WordCloudDatum
}

export interface WordCloudOption {
    aria: { enabled: true }
    tooltip: { show: true; formatter: (params: WordCloudTooltipParams) => string }
    series: [
        {
            type: "wordCloud"
            shape: string
            maskImage?: object
            keepAspect: boolean
            left: "center"
            top: "center"
            width: string
            height: string
            sizeRange: [number, number]
            rotationRange: [number, number]
            rotationStep: number
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

export interface WordCloudRenderContext {
    layoutAnimation?: boolean
    containerWidth?: number
    maskImage?: object
}
