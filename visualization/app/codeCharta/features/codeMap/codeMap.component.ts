import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy } from "@angular/core"
import { ThreeViewerService } from "./threeViewer/threeViewer.service"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { InspectorVisibilityService } from "../../features/sidebarInspector/facade"
import { CodeMapStore } from "./stores/codeMap.store"
import { ViewCubeComponent } from "../../ui/viewCube/viewCube.component"
import { AsyncPipe } from "@angular/common"

@Component({
    selector: "cc-code-map",
    templateUrl: "./codeMap.component.html",
    imports: [ViewCubeComponent, AsyncPipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeMapComponent implements AfterViewInit, OnDestroy {
    isLoadingFile$ = this.codeMapStore.isLoadingFile$

    private barsResizeObserver?: ResizeObserver

    constructor(
        public inspectorVisibilityService: InspectorVisibilityService,
        private readonly codeMapStore: CodeMapStore,
        private readonly threeViewerService: ThreeViewerService,
        private readonly codeMapMouseEventService: CodeMapMouseEventService,
        private readonly elementReference: ElementRef
    ) {}

    ngAfterViewInit(): void {
        this.threeViewerService.init(this.elementReference.nativeElement.querySelector("#codeMap"))
        this.codeMapMouseEventService.start()
        this.observeBarsHeight()
    }

    ngOnDestroy(): void {
        this.threeViewerService.stopAnimate()
        this.threeViewerService.destroy()
        this.barsResizeObserver?.disconnect()
    }

    private observeBarsHeight(): void {
        const bars = ["cc-nav-bar"]
            .map(selector => document.querySelector(selector) as HTMLElement | null)
            .filter((el): el is HTMLElement => el !== null)
        if (bars.length === 0) {
            return
        }
        const updateHeight = () => {
            const total = bars.reduce((sum, el) => sum + el.getBoundingClientRect().height, 0)
            document.documentElement.style.setProperty("--cc-bars-height", `${Math.round(total)}px`)
        }
        updateHeight()
        this.barsResizeObserver = new ResizeObserver(updateHeight)
        for (const bar of bars) {
            this.barsResizeObserver.observe(bar)
        }
    }
}
