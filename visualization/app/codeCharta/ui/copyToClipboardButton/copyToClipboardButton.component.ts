import "./copyToClipboardButton.component.scss"
import { Component, Inject } from "@angular/core"
import { Store } from "../../state/angular-redux/store"
import { getFilenamesWithHighestMetrics } from "./getFilenamesWithHighestMetrics"
import { accumulatedDataSelector } from "../../state/selectors/accumulatedData/accumulatedData.selector"
import { CodeMapNode } from "../../codeCharta.model"

@Component({
	selector: "cc-copy-to-clipboard-button",
	template: require("./copyToClipboardButton.component.html")
})
export class CopyToClipboardButtonComponent {
	private files: CodeMapNode
	constructor(@Inject(Store) store: Store) {
		store.select(accumulatedDataSelector).subscribe(files => {
			this.files = files.unifiedMapNode
		})
	}

	async copyNamesToClipBoard() {
		const filenames = getFilenamesWithHighestMetrics(this.files)
		await navigator.clipboard.writeText(JSON.stringify(filenames))
	}
}
