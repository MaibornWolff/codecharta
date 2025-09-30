import { NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { FormsModule } from "@angular/forms"
import { AlgoUiComponent } from "./algo-ui.component"

@NgModule({
    declarations: [AlgoUiComponent],
    imports: [BrowserModule, FormsModule],
    bootstrap: [AlgoUiComponent]
})
export class AlgoUiModule {}
