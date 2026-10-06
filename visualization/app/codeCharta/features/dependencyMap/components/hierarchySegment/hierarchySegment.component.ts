import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { DependencyHierarchy } from "../../../../model/dependencyGraph.model"
import { AxisCardComponent } from "../../../shared/facade"
import { DependencyGraphModelStore } from "../../stores/dependencyGraphModel.store"
import { ChoiceListPopoverComponent } from "../choiceListPopover/choiceListPopover.component"
import { Choice } from "../choiceRow/choiceRow.component"
import { labelOf } from "../edgeStyleSegment/edgeStyleChoices"

const HIERARCHY_CHOICES: Choice<DependencyHierarchy>[] = [
    { value: "folders", label: "Folders", hint: "The files in the folders they lie in" },
    { value: "packages", label: "Packages", hint: "The files in the packages their declarations declare" }
]

@Component({
    selector: "cc-hierarchy-segment",
    templateUrl: "./hierarchySegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [AxisCardComponent, ChoiceListPopoverComponent]
})
export class HierarchySegmentComponent {
    private readonly graphModel = inject(DependencyGraphModelStore)

    readonly popoverId = "dependency-bar-hierarchy-popover"
    readonly anchorName = "dependency-bar-hierarchy-card"
    readonly hierarchyChoices = HIERARCHY_CHOICES

    readonly hierarchy = this.graphModel.hierarchy
    readonly hierarchyLabel = computed(() => labelOf(HIERARCHY_CHOICES, this.hierarchy()))

    show(hierarchy: DependencyHierarchy): void {
        this.graphModel.showHierarchy(hierarchy)
    }
}
