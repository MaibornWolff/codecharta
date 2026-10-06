import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { DeclarationArrangement, DeclarationKindMark } from "../../../../model/dependencyGraph.model"
import { AxisCardComponent } from "../../../shared/facade"
import { DependencyMapReadStore } from "../../stores/dependencyMap.read.store"
import { DependencyMapWriteStore } from "../../stores/dependencyMap.write.store"
import { ChoiceListPopoverComponent } from "../choiceListPopover/choiceListPopover.component"
import { ChoiceRowComponent } from "../choiceRow/choiceRow.component"
import { labelOf } from "../edgeStyleSegment/edgeStyleChoices"
import { DECLARATION_ARRANGEMENT_CHOICES, DECLARATION_KIND_MARK_CHOICES } from "./declarationChoices"

@Component({
    selector: "cc-declarations-segment",
    templateUrl: "./declarationsSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [AxisCardComponent, ChoiceListPopoverComponent, ChoiceRowComponent]
})
export class DeclarationsSegmentComponent {
    private readonly writeStore = inject(DependencyMapWriteStore)
    private readonly settings = toSignal(inject(DependencyMapReadStore).persistedSettings$, { requireSync: true })

    readonly popoverId = "dependency-bar-declarations-popover"
    readonly anchorName = "dependency-bar-declarations-card"
    readonly arrangementChoices = DECLARATION_ARRANGEMENT_CHOICES
    readonly kindMarkChoices = DECLARATION_KIND_MARK_CHOICES

    readonly arrangement = computed(() => this.settings().declarationArrangement)
    readonly arrangementLabel = computed(() => labelOf(DECLARATION_ARRANGEMENT_CHOICES, this.arrangement()))

    readonly kindMark = computed(() => this.settings().declarationKindMark)

    arrangeAs(declarationArrangement: DeclarationArrangement): void {
        this.writeStore.changeSettings({ declarationArrangement })
    }

    markKindBy(declarationKindMark: DeclarationKindMark): void {
        this.writeStore.changeSettings({ declarationKindMark })
    }
}
