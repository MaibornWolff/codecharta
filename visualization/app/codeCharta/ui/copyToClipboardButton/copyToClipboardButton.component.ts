import "./copyToClipboardButton.component.scss"
import { Component, Inject } from "@angular/core"
import { Store } from "../../state/angular-redux/store"
import { FileState } from "../../model/files/files"
import { visibleFileStatesSelector } from "../../state/selectors/visibleFileStates.selector"
import { getFilenamesWithHighestMetrics } from "./getFilenamesWithHighestMetrics"

@Component({
	selector: "cc-copy-to-clipboard-button",
	template: require("./copyToClipboardButton.component.html")
})
export class CopyToClipboardButtonComponent {
	private files: FileState[]
	constructor(@Inject(Store) store: Store) {
		store.select(visibleFileStatesSelector).subscribe(files => {
			this.files = files
		})
	}

	async copyNamesToClipBoard() {
		const filenames = getFilenamesWithHighestMetrics(this.files)
		await navigator.clipboard.writeText(JSON.stringify(filenames))
	}
}
