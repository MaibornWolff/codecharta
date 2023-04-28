import { Injectable } from "@angular/core"
import { State } from "@ngrx/store"
import { CcState } from "../../codeCharta.model"
import { accumulatedDataSelector } from "../../state/selectors/accumulatedData/accumulatedData.selector"
import { buildTextOfFiles } from "./util/clipboardString"
import { getFilenamesWithHighestMetrics } from "./util/getFilenamesWithHighestMetrics"

@Injectable()
export class CopyToClipboardService {
	constructor(private state: State<CcState>) {}

	private getUnifiedMapNode() {
		const { unifiedMapNode } = accumulatedDataSelector(this.state.getValue())
		return unifiedMapNode
	}

	getClipboardText(): string {
		const node = this.getUnifiedMapNode()
		const filesByAttribute = getFilenamesWithHighestMetrics(node)

		return buildTextOfFiles(filesByAttribute)
	}
}
