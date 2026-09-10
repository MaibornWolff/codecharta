import { createSelector } from "@ngrx/store"
import { AttributeTypes, PrimaryMetrics } from "../../../model/codeCharta.model"
import { attributeTypesSelector, primaryMetricNamesSelector } from "../../../renderer/renderModel/renderModel.facade"

export const createAttributeTypeSelector = (metricType: keyof AttributeTypes, metricFor: keyof PrimaryMetrics) =>
    createSelector(primaryMetricNamesSelector, attributeTypesSelector, (primaryMetricNames, attributeTypes) => {
        const metricName = primaryMetricNames[metricFor]
        return attributeTypes[metricType][metricName] === "relative" ? "x͂" : "Σ"
    })
