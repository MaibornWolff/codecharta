import { Injectable } from "@angular/core"
import { State } from "@ngrx/store"
import { CcState } from "../../codeCharta.model"
import { accumulatedDataSelector } from "../../state/selectors/accumulatedData/accumulatedData.selector"
import { buildTextOfFiles } from "./util/clipboardString"
import { getFilenamesWithHighestMetrics } from "./util/getFilenamesWithHighestMetrics"

@Injectable()
export class CopyToClipboardService {
    constructor(private state: State<CcState>) {}

    getClipboardText(): string {
        const node = this.getUnifiedMapNode()
        const attributeDescriptors = this.state.getValue().fileSettings.attributeDescriptors
        const filesByAttribute = getFilenamesWithHighestMetrics(node, attributeDescriptors)

        return buildTextOfFiles(filesByAttribute)
    }

    private getUnifiedMapNode() {
        const { unifiedMapNode } = accumulatedDataSelector(this.state.getValue())
        return unifiedMapNode
    }
}
