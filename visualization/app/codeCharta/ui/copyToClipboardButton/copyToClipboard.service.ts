import { Inject, Injectable } from "@angular/core"
import { State } from "../../state/angular-redux/state"
import { accumulatedDataSelector } from "../../state/selectors/accumulatedData/accumulatedData.selector"
import { buildTextOfFiles } from "./util/clipboardString"
import { getFilenamesWithHighestMetrics } from "./util/getFilenamesWithHighestMetrics"

@Injectable()
export class CopyToClipboardService {
	constructor(@Inject(State) private state: State) {}

	getClipboardText(): string {
		const { unifiedMapNode } = accumulatedDataSelector(this.state.getValue())

		const filesByAttribute = getFilenamesWithHighestMetrics(unifiedMapNode)

		return buildTextOfFiles(filesByAttribute)
	}
}
