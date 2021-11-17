import { Component, Input } from "@angular/core"
import { FilePanelState } from "../filePanel.component"

@Component({
	selector: "cc-file-panel-state-buttons",
	template: require("./filePanelStateButtons.component.html")
})
export class FilePanelStateButtonsComponent {
	@Input() state: FilePanelState
}
