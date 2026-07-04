import { createSelector } from "@ngrx/store"
import { AttributeTypes, PrimaryMetrics } from "../../../codeCharta.model"
import { primaryMetricNamesSelector } from "../../../renderModel/renderModel.facade"
import { attributeTypesSelector } from "./attributeTypes.selector"

export const createAttributeTypeSelector = (metricType: keyof AttributeTypes, metricFor: keyof PrimaryMetrics) =>
    createSelector(primaryMetricNamesSelector, attributeTypesSelector, (primaryMetricNames, attributeTypes) => {
        const metricName = primaryMetricNames[metricFor]
        return attributeTypes[metricType][metricName] === "relative" ? "x͂" : "Σ"
    })
