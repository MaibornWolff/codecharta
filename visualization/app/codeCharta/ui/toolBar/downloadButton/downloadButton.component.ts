import { Component } from "@angular/core"

@Component({
	selector: "cc-download-button",
	template: require("./downloadButton.component.html")
})
export class DownloadButtonComponent {
	download() {
		console.log("hi")
	}
}
