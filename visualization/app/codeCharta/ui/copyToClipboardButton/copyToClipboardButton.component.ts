import { Component, ViewEncapsulation } from "@angular/core"
import { CopyToClipboardService } from "./copyToClipboard.service"

@Component({
	selector: "cc-copy-to-clipboard-button",
	templateUrl: "./copyToClipboardButton.component.html",
	encapsulation: ViewEncapsulation.None
})
export class CopyToClipboardButtonComponent {
	constructor(private copyToClipboardService: CopyToClipboardService) {}

	async copyNamesToClipBoard() {
		await navigator.clipboard.writeText(this.copyToClipboardService.getClipboardText())
	}
}
