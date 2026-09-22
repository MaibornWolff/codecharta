import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { map } from "rxjs"
import { SCREENSHOT_CAPTURE, ScreenshotButtonComponent, SunburstScreenshotService } from "../../../features/screenshot/facade"
import { CcState } from "../../../model/codeCharta.model"
import {
    findClosestFolder,
    findClosestNode,
    findParentFolder,
    type RightClickedNode,
    SunburstComponent,
    VISIBLE_RING_COUNT
} from "../../../renderer/sunburst/sunburst.facade"
import { FileStoreReadWindow, isDeltaStateSelector } from "../../../stores/fileStore/fileStore.facade"
import {
    currentFocusedNodePathSelector,
    hoveredNodeIdSelector,
    selectedNodePathSelector
} from "../../../stores/sharedView/sharedView.read.facade"
import {
    setHoveredNodeId,
    setRightClickedNodeData,
    setSelectedNodePath,
    unfocusNode
} from "../../../stores/sharedView/sharedView.write.facade"
import {
    BAR_GAP_PX,
    BOTTOM_BAR_HEIGHT_CSS_VARIABLE,
    DEFAULT_BOTTOM_BAR_HEIGHT_PX,
    DEFAULT_FILE_EXTENSION_BAR_HEIGHT_PX,
    FILE_EXTENSION_BAR_HEIGHT_CSS_VARIABLE,
    METRICS_BAR_HEIGHT_CSS_VARIABLE
} from "../../../util/barLayout"
import { sunburstColoringSelector, sunburstMetricsSelector, sunburstTreeSelector } from "./metricsSunburst.selector"

const BOTTOM_INSET_ABOVE_THE_BARS = `calc(${[
    `var(${BOTTOM_BAR_HEIGHT_CSS_VARIABLE}, ${DEFAULT_BOTTOM_BAR_HEIGHT_PX}px)`,
    `var(${FILE_EXTENSION_BAR_HEIGHT_CSS_VARIABLE}, ${DEFAULT_FILE_EXTENSION_BAR_HEIGHT_PX}px)`,
    `var(${METRICS_BAR_HEIGHT_CSS_VARIABLE}, 0px)`,
    `${BAR_GAP_PX}px`
].join(" + ")})`

@Component({
    selector: "cc-metrics-sunburst",
    templateUrl: "./metricsSunburst.component.html",
    imports: [SunburstComponent, ScreenshotButtonComponent],
    providers: [{ provide: SCREENSHOT_CAPTURE, useExisting: SunburstScreenshotService }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: "fixed inset-x-0 z-0 top-[var(--cc-bars-height,49px)]",
        "[style.bottom]": "bottomInset",
        "[class.hidden]": "isLoadingFile()"
    }
})
export class MetricsSunburstComponent {
    protected readonly bottomInset = BOTTOM_INSET_ABOVE_THE_BARS
    private readonly store = inject<Store<CcState>>(Store)

    protected readonly tree = toSignal(this.store.select(sunburstTreeSelector), { requireSync: true })
    protected readonly metrics = toSignal(this.store.select(sunburstMetricsSelector), { requireSync: true })
    protected readonly coloring = toSignal(this.store.select(sunburstColoringSelector), { requireSync: true })
    protected readonly hoveredPath = toSignal(this.store.select(hoveredNodeIdSelector), { requireSync: true })
    protected readonly isDeltaState = toSignal(this.store.select(isDeltaStateSelector), { requireSync: true })
    protected readonly isLoadingFile = toSignal(inject(FileStoreReadWindow).isLoadingFile$, { initialValue: false })
    private readonly selectedPath = toSignal(this.store.select(selectedNodePathSelector), { requireSync: true })
    protected readonly isFocused = toSignal(this.store.select(currentFocusedNodePathSelector).pipe(map(Boolean)), { requireSync: true })

    private readonly requestedCentrePath = signal<string | null>(null)

    protected readonly view = computed(() => {
        const tree = this.tree()
        if (!tree) {
            return null
        }
        const requestedCentrePath = this.requestedCentrePath()
        return { tree, centre: requestedCentrePath === null ? tree : findClosestFolder(tree, requestedCentrePath) }
    })

    constructor() {
        effect(() => this.centreOnTheSelection())
    }

    protected selectFolder(path: string): void {
        this.hover(null)
        this.store.dispatch(setSelectedNodePath({ value: path }))
    }

    protected goUp(): void {
        const view = this.view()
        const parent = view && findParentFolder(view.tree, view.centre.path)
        if (parent) {
            this.selectFolder(parent.path)
        }
    }

    protected selectFile(path: string): void {
        this.store.dispatch(setSelectedNodePath({ value: path }))
    }

    protected openContextMenu({ path, clientX, clientY }: RightClickedNode): void {
        this.store.dispatch(
            setRightClickedNodeData({
                value: { nodeId: path, xPositionOfRightClickEvent: clientX, yPositionOfRightClickEvent: clientY, origin: "sunburst" }
            })
        )
    }

    protected unfocus(): void {
        this.store.dispatch(unfocusNode())
    }

    protected hover(path: string | null): void {
        this.store.dispatch(setHoveredNodeId({ value: path }))
    }

    private centreOnTheSelection(): void {
        const selectedPath = this.selectedPath()
        untracked(() => {
            if (selectedPath !== null && !this.isFileShownAroundTheCentre(selectedPath)) {
                this.requestedCentrePath.set(selectedPath)
            }
        })
    }

    private isFileShownAroundTheCentre(path: string): boolean {
        const view = this.view()
        if (!view) {
            return false
        }
        const shownNode = findClosestNode(view.centre, path, VISIBLE_RING_COUNT)
        return shownNode.isFile && shownNode.path === path
    }
}
