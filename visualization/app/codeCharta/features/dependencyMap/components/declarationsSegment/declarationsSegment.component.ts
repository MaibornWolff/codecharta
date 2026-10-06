import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { DeclarationArrangement } from "../../../../model/dependencyGraph.model"
import { AxisCardComponent } from "../../../shared/facade"
import { DependencyMapReadStore } from "../../stores/dependencyMap.read.store"
import { DependencyMapWriteStore } from "../../stores/dependencyMap.write.store"
import { ChoiceListPopoverComponent } from "../choiceListPopover/choiceListPopover.component"
import { labelOf } from "../edgeStyleSegment/edgeStyleChoices"
import { DECLARATION_ARRANGEMENT_CHOICES } from "./declarationChoices"

@Component({
    selector: "cc-declarations-segment",
    templateUrl: "./declarationsSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [AxisCardComponent, ChoiceListPopoverComponent]
})
export class DeclarationsSegmentComponent {
    private readonly writeStore = inject(DependencyMapWriteStore)
    private readonly settings = toSignal(inject(DependencyMapReadStore).persistedSettings$, { requireSync: true })

    readonly popoverId = "dependency-bar-declarations-popover"
    readonly anchorName = "dependency-bar-declarations-card"
    readonly arrangementChoices = DECLARATION_ARRANGEMENT_CHOICES

    readonly arrangement = computed(() => this.settings().declarationArrangement)
    readonly arrangementLabel = computed(() => labelOf(DECLARATION_ARRANGEMENT_CHOICES, this.arrangement()))

    arrangeAs(declarationArrangement: DeclarationArrangement): void {
        this.writeStore.changeSettings({ declarationArrangement })
    }
}
