import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { ExplorerCollapseService } from "../../services/explorerCollapse.service"
import { ExplorerHeaderComponent } from "../explorerHeader/explorerHeader.component"
import { ExplorerSearchBarComponent } from "../explorerSearchBar/explorerSearchBar.component"
import { ExplorerSortControlComponent } from "../explorerSortControl/explorerSortControl.component"
import { ExplorerTreeComponent } from "../explorerTree/explorerTree.component"
import { RulesPopoverComponent } from "../rulesPopover/rulesPopover.component"

@Component({
    selector: "cc-sidebar-explorer",
    templateUrl: "./sidebarExplorer.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ExplorerHeaderComponent,
        ExplorerSearchBarComponent,
        ExplorerSortControlComponent,
        ExplorerTreeComponent,
        RulesPopoverComponent
    ],
    host: {
        class: "fixed left-0 z-[60] w-72 bg-base-100 overflow-hidden flex flex-col shadow-[2px_0_8px_-2px_rgba(0,0,0,0.15)]",
        "[class.rounded-br-md]": "isCollapsed()",
        "[style.top]": "'var(--cc-bars-height, 98px)'",
        "[style.height]": "isCollapsed() ? 'auto' : 'calc(100vh - var(--cc-bars-height, 98px) - var(--cc-bottom-bar-height, 32px))'"
    }
})
export class SidebarExplorerComponent {
    private readonly collapseService = inject(ExplorerCollapseService)

    readonly isCollapsed = this.collapseService.isCollapsed

    toggle() {
        this.collapseService.toggle()
    }
}
