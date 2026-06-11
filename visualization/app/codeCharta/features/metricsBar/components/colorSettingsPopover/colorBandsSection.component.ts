import { ChangeDetectionStrategy, Component } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { CodeMapRenderService } from "../../../../ui/codeMap/codeMap.render.service"
import { IsDeltaStateService } from "../../services/isDeltaState.service"
import { ColorBandRowComponent } from "./colorBandRow.component"

@Component({
    selector: "cc-color-bands-section",
    templateUrl: "./colorBandsSection.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [ColorBandRowComponent]
})
export class ColorBandsSectionComponent {
    constructor(
        private readonly isDeltaStateService: IsDeltaStateService,
        private readonly codeMapRenderService: CodeMapRenderService
    ) {}

    readonly isDeltaState = toSignal(this.isDeltaStateService.isDeltaState$(), { initialValue: false })
    readonly colorCategoryCounts = toSignal(this.codeMapRenderService.colorCategoryCounts$, {
        initialValue: { positive: 0, neutral: 0, negative: 0 }
    })
}
