import { AsyncPipe } from "@angular/common"
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy } from "@angular/core"
import { InspectorVisibilityService } from "../../features/sidebarInspector/facade"
import { ThreeViewerService } from "../../renderer/threeViewer/threeViewer.facade"
import { FileStoreReadWindow } from "../../stores/fileStore/fileStore.facade"
import { ViewCubeComponent } from "../viewCube/facade"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"

@Component({
    selector: "cc-code-map",
    templateUrl: "./codeMap.component.html",
    imports: [ViewCubeComponent, AsyncPipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeMapComponent implements AfterViewInit, OnDestroy {
    isLoadingFile$ = this.fileStoreReadWindow.isLoadingFile$

    constructor(
        public inspectorVisibilityService: InspectorVisibilityService,
        private readonly fileStoreReadWindow: FileStoreReadWindow,
        private readonly threeViewerService: ThreeViewerService,
        private readonly codeMapMouseEventService: CodeMapMouseEventService,
        private readonly elementReference: ElementRef
    ) {}

    ngAfterViewInit(): void {
        this.threeViewerService.init(this.elementReference.nativeElement.querySelector("#codeMap"))
        this.codeMapMouseEventService.start()
    }

    ngOnDestroy(): void {
        this.threeViewerService.stopAnimate()
        this.threeViewerService.destroy()
    }
}
