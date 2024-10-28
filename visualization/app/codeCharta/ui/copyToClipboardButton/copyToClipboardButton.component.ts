import { Component } from "@angular/core"
import { CopyToClipboardService } from "./copyToClipboard.service"
import { ActionIconComponent } from "../actionIcon/actionIcon.component"

@Component({
    selector: "cc-copy-to-clipboard-button",
    templateUrl: "./copyToClipboardButton.component.html",
    standalone: true,
    imports: [ActionIconComponent]
})
export class CopyToClipboardButtonComponent {
    constructor(private copyToClipboardService: CopyToClipboardService) {}

    async copyNamesToClipBoard() {
        await navigator.clipboard.writeText(this.copyToClipboardService.getClipboardText())
    }
}
