import { NodeMetricData } from "../../../../../model/codeCharta.model"

export const getDefaultDistribution = (nodeMetricData: Pick<NodeMetricData, "name">[]) =>
    nodeMetricData.some(element => element.name === "rloc") ? "rloc" : "unary"
