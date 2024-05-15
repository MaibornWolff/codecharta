import { Pipe, PipeTransform } from "@angular/core"

import { CodeMapNode } from "../../../codeCharta.model"

@Pipe({ name: "areaMetricValid" })
export class AreaMetricValidPipe implements PipeTransform {
    transform(node: CodeMapNode, areaMetric: string): boolean {
        return isAreaValid(node, areaMetric)
    }
}

export function isAreaValid(node: CodeMapNode, areaMetric: string): boolean {
    return node.deltas?.[areaMetric] < 0 || node.attributes?.[areaMetric] > 0
}
