import { NgModule } from "@angular/core"
import { TruncateTextPipe } from "./truncateText.pipe"

@NgModule({
    declarations: [TruncateTextPipe],
    exports: [TruncateTextPipe]
})
export class TruncateTextPipeModule {}
