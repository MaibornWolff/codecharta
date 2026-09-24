import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { LayoutAlgorithm } from "../../../../model/codeCharta.model"
import {
    findClosestFolder,
    findClosestNode,
    findParentFolder,
    RadialChartComponent,
    type RightClickedNode,
    radialTreemapShape,
    sunburstShape
} from "../../../../renderer/radialMap/radialMap.facade"
import { FileStoreReadWindow } from "../../../../stores/fileStore/fileStore.facade"
import {
    BAR_GAP_PX,
    BOTTOM_BAR_HEIGHT_CSS_VARIABLE,
    DEFAULT_BOTTOM_BAR_HEIGHT_PX,
    DEFAULT_FILE_EXTENSION_BAR_HEIGHT_PX,
    FILE_EXTENSION_BAR_HEIGHT_CSS_VARIABLE,
    METRICS_BAR_HEIGHT_CSS_VARIABLE
} from "../../../../util/barLayout"
import { RadialMapScreenshotService, SCREENSHOT_CAPTURE, ScreenshotButtonComponent } from "../../../screenshot/facade"
import { RadialMapReadStore } from "../../stores/radialMap.read.store"
import { RadialMapWriteStore } from "../../stores/radialMap.write.store"

const BOTTOM_INSET_ABOVE_THE_BARS = `calc(${[
    `var(${BOTTOM_BAR_HEIGHT_CSS_VARIABLE}, ${DEFAULT_BOTTOM_BAR_HEIGHT_PX}px)`,
    `var(${FILE_EXTENSION_BAR_HEIGHT_CSS_VARIABLE}, ${DEFAULT_FILE_EXTENSION_BAR_HEIGHT_PX}px)`,
    `var(${METRICS_BAR_HEIGHT_CSS_VARIABLE}, 0px)`,
    `${BAR_GAP_PX}px`
].join(" + ")})`

@Component({
    selector: "cc-radial-map",
    templateUrl: "./radialMap.component.html",
    imports: [RadialChartComponent, ScreenshotButtonComponent],
    providers: [{ provide: SCREENSHOT_CAPTURE, useExisting: RadialMapScreenshotService }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: "fixed inset-x-0 z-0 top-[var(--cc-bars-height,49px)]",
        "[style.bottom]": "bottomInset",
        "[class.hidden]": "isLoadingFile()"
    }
})
export class RadialMapComponent {
    protected readonly bottomInset = BOTTOM_INSET_ABOVE_THE_BARS
    private readonly readStore = inject(RadialMapReadStore)
    private readonly writeStore = inject(RadialMapWriteStore)

    protected readonly tree = toSignal(this.readStore.tree$, { requireSync: true })
    private readonly layoutAlgorithm = toSignal(this.readStore.layoutAlgorithm$, { requireSync: true })
    private readonly radialLevels = toSignal(this.readStore.radialLevels$, { requireSync: true })
    protected readonly shape = computed(() =>
        this.layoutAlgorithm() === LayoutAlgorithm.RadialTreeMap
            ? radialTreemapShape(this.radialLevels())
            : sunburstShape(this.radialLevels())
    )
    protected readonly metrics = toSignal(this.readStore.metrics$, { requireSync: true })
    protected readonly coloring = toSignal(this.readStore.coloring$, { requireSync: true })
    protected readonly hoveredPath = toSignal(this.readStore.hoveredNodePath$, { requireSync: true })
    protected readonly isDeltaState = toSignal(this.readStore.isDeltaState$, { requireSync: true })
    protected readonly isFocused = toSignal(this.readStore.isFocused$, { requireSync: true })
    protected readonly isLoadingFile = toSignal(inject(FileStoreReadWindow).isLoadingFile$, { initialValue: false })
    private readonly selectedPath = toSignal(this.readStore.selectedNodePath$, { requireSync: true })

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

    protected selectNode(path: string): void {
        this.writeStore.selectNode(path)
    }

    protected goUp(): void {
        const view = this.view()
        const parent = view && findParentFolder(view.tree, view.centre.path)
        if (parent) {
            this.selectNode(parent.path)
        }
    }

    protected openContextMenu({ path, clientX, clientY }: RightClickedNode): void {
        this.writeStore.openContextMenu(path, clientX, clientY)
    }

    protected unfocus(): void {
        this.writeStore.unfocus()
    }

    protected hover(path: string | null): void {
        this.writeStore.hoverNode(path)
    }

    private centreOnTheSelection(): void {
        const selectedPath = this.selectedPath()
        const { visibleDepth } = this.shape()
        untracked(() => {
            if (selectedPath !== null && !this.isFileShownAroundTheCentre(selectedPath, visibleDepth)) {
                this.requestedCentrePath.set(selectedPath)
            }
        })
    }

    private isFileShownAroundTheCentre(path: string, visibleDepth: number): boolean {
        const view = this.view()
        if (!view) {
            return false
        }
        const shownNode = findClosestNode(view.centre, path, visibleDepth)
        return shownNode.isFile && shownNode.path === path
    }
}
