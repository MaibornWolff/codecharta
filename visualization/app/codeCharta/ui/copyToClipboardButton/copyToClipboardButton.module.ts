import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { ActionIconModule } from "../actionIcon/actionIcon.module"
import { CopyToClipboardService } from "./copyToClipboard.service"
import { CopyToClipboardButtonComponent } from "./copyToClipboardButton.component"

@NgModule({
	imports: [CommonModule, ActionIconModule],
	declarations: [CopyToClipboardButtonComponent],
	exports: [CopyToClipboardButtonComponent],
	providers: [CopyToClipboardService]
})
export class CopyToClipboardButtonModule {}
