import { WordCloudTooltipParams } from "./wordCloudOption.model"

const TFIDF_TOOLTIP_DIGITS = 3

export function buildTooltipFormatter(): (params: WordCloudTooltipParams) => string {
    return ({ name, data }) => {
        const rows = [`<b>${name}</b>`, `Frequency: ${data.frequency}`]
        if (data.tfidf !== undefined) {
            rows.push(`TF-IDF: ${data.tfidf.toFixed(TFIDF_TOOLTIP_DIGITS)}`)
        }
        return rows.join("<br/>")
    }
}
