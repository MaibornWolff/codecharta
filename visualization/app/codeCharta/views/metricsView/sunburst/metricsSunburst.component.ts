import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { SCREENSHOT_CAPTURE, ScreenshotButtonComponent, SunburstScreenshotService } from "../../../features/screenshot/facade"
import { CcState } from "../../../model/codeCharta.model"
import {
    findClosestFolder,
    findClosestNode,
    findFolder,
    parentPath,
    type RightClickedNode,
    SunburstComponent,
    VISIBLE_RING_COUNT
} from "../../../renderer/sunburst/sunburst.facade"
import { FileStoreReadWindow, isDeltaStateSelector } from "../../../stores/fileStore/fileStore.facade"
import { hoveredNodeIdSelector, selectedBuildingIdSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { setHoveredNodeId, setRightClickedNodeData, setSelectedBuildingId } from "../../../stores/sharedView/sharedView.write.facade"
import { sunburstColoringSelector, sunburstMetricsSelector, sunburstTreeSelector } from "./metricsSunburst.selector"

@Component({
    selector: "cc-metrics-sunburst",
    templateUrl: "./metricsSunburst.component.html",
    imports: [SunburstComponent, ScreenshotButtonComponent],
    providers: [{ provide: SCREENSHOT_CAPTURE, useExisting: SunburstScreenshotService }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: "fixed inset-x-0 z-0 top-[var(--cc-bars-height,49px)] bottom-[calc(var(--cc-bottom-bar-height,32px)+var(--cc-file-extension-bar-height,17px)+var(--cc-metrics-bar-height,0px)+12px)]",
        "[class.hidden]": "isLoadingFile()"
    }
})
export class MetricsSunburstComponent {
    private readonly store = inject<Store<CcState>>(Store)

    protected readonly tree = toSignal(this.store.select(sunburstTreeSelector), { requireSync: true })
    protected readonly metrics = toSignal(this.store.select(sunburstMetricsSelector), { requireSync: true })
    protected readonly coloring = toSignal(this.store.select(sunburstColoringSelector), { requireSync: true })
    protected readonly hoveredPath = toSignal(this.store.select(hoveredNodeIdSelector), { requireSync: true })
    protected readonly isDeltaState = toSignal(this.store.select(isDeltaStateSelector), { requireSync: true })
    protected readonly isLoadingFile = toSignal(inject(FileStoreReadWindow).isLoadingFile$, { initialValue: false })
    private readonly selectedPath = toSignal(this.store.select(selectedBuildingIdSelector), { requireSync: true })

    private readonly requestedCentrePath = signal<string | null>(null)

    protected readonly centrePath = computed(() => {
        const tree = this.tree()
        const requestedCentrePath = this.requestedCentrePath()
        if (!tree) {
            return null
        }
        return requestedCentrePath === null ? tree.path : findClosestFolder(tree, requestedCentrePath).path
    })

    constructor() {
        effect(() => this.centreOnTheSelection())
    }

    protected selectFolder(path: string): void {
        this.hover(null)
        this.store.dispatch(setSelectedBuildingId({ value: path }))
    }

    protected goUp(): void {
        const centrePath = this.centrePath()
        if (centrePath === null || centrePath === this.tree().path) {
            return
        }
        this.selectFolder(parentPath(centrePath))
    }

    protected selectFile(path: string): void {
        this.store.dispatch(setSelectedBuildingId({ value: path }))
    }

    protected openContextMenu({ path, clientX, clientY }: RightClickedNode): void {
        this.store.dispatch(
            setRightClickedNodeData({
                value: { nodeId: path, xPositionOfRightClickEvent: clientX, yPositionOfRightClickEvent: clientY, origin: "sunburst" }
            })
        )
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
        const tree = this.tree()
        const centrePath = this.centrePath()
        if (!tree || centrePath === null) {
            return false
        }
        const shownNode = findClosestNode(findFolder(tree, centrePath) ?? tree, path, VISIBLE_RING_COUNT)
        return shownNode.isFile && shownNode.path === path
    }
}
