import { metricThresholdsByLanguage } from "./artificialIntelligence.metricThresholds"

export function getAssociatedMetricThresholds(programmingLanguage: string) {
    return programmingLanguage === "java" ? metricThresholdsByLanguage.java : metricThresholdsByLanguage.miscellaneous
}
