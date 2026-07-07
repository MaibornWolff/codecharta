import { createSelector } from "@ngrx/store"
import { AttributeTypes, PrimaryMetrics } from "../../../model/codeCharta.model"
import { primaryMetricNamesSelector } from "../../../renderer/renderModel/renderModel.facade"
import { attributeTypesSelector } from "./attributeTypes.selector"

export const createAttributeTypeSelector = (metricType: keyof AttributeTypes, metricFor: keyof PrimaryMetrics) =>
    createSelector(primaryMetricNamesSelector, attributeTypesSelector, (primaryMetricNames, attributeTypes) => {
        const metricName = primaryMetricNames[metricFor]
        return attributeTypes[metricType][metricName] === "relative" ? "x͂" : "Σ"
    })
