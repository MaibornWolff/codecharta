// Word-cloud render settings. Kept in the model kernel (not the wordCloud feature) so both the
// stores/domainBar state home that owns them and the wordCloud renderer that consumes them can import
// them without a store→feature edge.

/** The ECharts word-cloud layout shapes (see echarts-wordcloud). */
export enum WordCloudShape {
    circle = "circle",
    cardioid = "cardioid",
    diamond = "diamond",
    triangle = "triangle",
    pentagon = "pentagon",
    star = "star"
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
    /** Keep only the top-N words by value. DLC default. */
    topN: number
    /**
     * What happens to a word the layout cannot place. When true it is shrunk (repeatedly, to 3/4 its
     * weight) until it fits, so the cloud draws the requested word count — at the cost of tail words
     * rendering below `sizeRange[0]`. When false the word is left out, so `sizeRange` is exact but
     * fewer words than `topN` appear.
     */
    shrinkToFit: boolean
}

/** DLC-parity defaults for the word-cloud controls; the domain bar seeds its slices from these. */
export const defaultWordCloudSettings: WordCloudSettings = {
    shape: WordCloudShape.circle,
    sizeRange: [12, 60],
    rotationRange: [-90, 90],
    rotationStep: 45,
    gridSize: 8,
    sizingMode: WordCloudSizingMode.frequency,
    topN: 150,
    shrinkToFit: false
}
