import "./copyToClipboardButton.component.scss"
import { Component } from "@angular/core"

@Component({
	selector: "cc-copy-to-clipboard-button",
	template: require("./copyToClipboardButton.component.html")
})
export class CopyToClipboardButtonComponent {
	async copyNamesToClipBoard() {
		await navigator.clipboard.writeText("There will be filenames")
	}
}
