import { ChangeDetectionStrategy, Component, computed, ElementRef, effect, inject, viewChild } from "@angular/core"
import { ColumnResizeHandleDirective } from "../../../shared/facade"
import { EXPLORER_CAPABILITIES } from "../../explorerCapabilities"
import { EXPLORER_METRIC_RULES } from "../../explorerMetricRules.port"
import { ExplorerCollapseService } from "../../services/explorerCollapse.service"
import { ExplorerModeService } from "../../services/explorerMode.service"
import { ExplorerScrollHostService } from "../../services/explorerScrollHost.service"
import { ExplorerWidthService } from "../../services/explorerWidth.service"
import { ExplorerFocusBannerComponent } from "../explorerFocusBanner/explorerFocusBanner.component"
import { ExplorerHeaderComponent } from "../explorerHeader/explorerHeader.component"
import { ExplorerSearchBarComponent } from "../explorerSearchBar/explorerSearchBar.component"
import { ExplorerSortControlComponent } from "../explorerSortControl/explorerSortControl.component"
import { ExplorerTreeComponent } from "../explorerTree/explorerTree.component"
import { MetricRuleEditorComponent } from "../metricRuleEditor/metricRuleEditor.component"
import { RulesPopoverComponent } from "../rulesPopover/rulesPopover.component"

export const COLLAPSED_STRIP_WIDTH_PX = 300

@Component({
    selector: "cc-sidebar-explorer",
    templateUrl: "./sidebarExplorer.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ColumnResizeHandleDirective,
        ExplorerFocusBannerComponent,
        ExplorerHeaderComponent,
        ExplorerSearchBarComponent,
        ExplorerSortControlComponent,
        ExplorerTreeComponent,
        MetricRuleEditorComponent,
        RulesPopoverComponent
    ],
    host: {
        class: "fixed left-0 z-[60] bg-base-100 flex flex-col shadow-[2px_0_8px_-2px_rgba(0,0,0,0.15)]",
        "[class.overflow-hidden]": "!isCollapsed()",
        "[class.rounded-br-md]": "isCollapsed()",
        "[style.width.px]": "displayWidth()",
        "[style.top]": "'var(--cc-bars-height, 49px)'",
        "[style.height]":
            "isCollapsed() ? 'auto' : 'calc(100vh - var(--cc-bars-height, 49px) - var(--cc-file-extension-bar-height, 0px) - var(--cc-bottom-bar-height, 32px))'"
    }
})
export class SidebarExplorerComponent {
    private readonly collapseService = inject(ExplorerCollapseService)
    private readonly widthService = inject(ExplorerWidthService)
    private readonly scrollHostService = inject(ExplorerScrollHostService)
    private readonly modeService = inject(ExplorerModeService)

    private readonly scrollHost = viewChild<ElementRef<HTMLElement>>("scrollHost")

    readonly capabilities = inject(EXPLORER_CAPABILITIES)

    /** Only views that provide metric values can offer the metric rule editor. */
    readonly hasMetricRules = inject(EXPLORER_METRIC_RULES, { optional: true }) !== null

    readonly isCollapsed = this.collapseService.isCollapsed
    readonly isFilesMode = this.modeService.isFilesMode
    readonly width = this.widthService.width
    readonly displayWidth = computed(() => (this.isCollapsed() ? COLLAPSED_STRIP_WIDTH_PX : this.width()))

    constructor() {
        effect(() => this.scrollHostService.register(this.scrollHost()?.nativeElement ?? null))
    }

    toggle() {
        this.collapseService.toggle()
    }

    setWidth(width: number) {
        this.widthService.setWidth(width)
    }

    resetWidth() {
        this.widthService.reset()
    }
}
