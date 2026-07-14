import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core"
import { BlacklistItem } from "../../../../model/codeCharta.model"
import { SidebarExplorerWriteStore } from "../../stores/sidebarExplorer.write.store"

@Component({
    selector: "cc-rule-row",
    templateUrl: "./ruleRow.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "flex items-center gap-2 px-2 py-1.5 hover:bg-base-200 transition-colors border-b border-base-200 last:border-b-0" }
})
export class RuleRowComponent {
    private readonly writeStore = inject(SidebarExplorerWriteStore)

    readonly item = input.required<BlacklistItem>()
    readonly affectedCount = input.required<number>()
    readonly kind = input.required<"RULE" | "MANUAL">()

    remove() {
        this.writeStore.removeBlacklistItem(this.item())
    }
}
