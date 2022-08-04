import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { ActionIconModule } from "../actionIcon/actionIcon.module"
import { CopyToClipboardButtonComponent } from "./copyToClipboardButton.component"

@NgModule({
	imports: [CommonModule, ActionIconModule],
	declarations: [CopyToClipboardButtonComponent],
	exports: [CopyToClipboardButtonComponent],
	entryComponents: [CopyToClipboardButtonComponent]
})
export class CopyToClipboardButtonModule {}
