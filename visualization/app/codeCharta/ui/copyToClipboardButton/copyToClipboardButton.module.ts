import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"

import { CopyToClipboardService } from "./copyToClipboard.service"
import { CopyToClipboardButtonComponent } from "./copyToClipboardButton.component"

@NgModule({
    imports: [CommonModule, CopyToClipboardButtonComponent],
    exports: [CopyToClipboardButtonComponent],
    providers: [CopyToClipboardService]
})
export class CopyToClipboardButtonModule {}
