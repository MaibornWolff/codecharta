import { Component, Input } from "@angular/core"

@Component({
	selector: "cc-file-panel-state-buttons",
	template: require("./filePanelStateButtons.component.html")
})
export class FilePanelStateButtonsComponent {
	@Input() isDeltaState: boolean
	@Input() handleStandardButtonClicked: () => void
	@Input() handleDeltaButtonClicked: () => void
}
