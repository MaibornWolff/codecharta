import { Component, AfterViewInit, ElementRef, effect, Signal } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { isLoadingFileSelector } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.selector"
import { ThreeViewerService } from "./threeViewer/threeViewer.service"
import { GlobalSettingsFacade } from "../../features/globalSettings/facade"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { IsAttributeSideBarVisibleService } from "../../services/isAttributeSideBarVisible.service"
import { Store } from "@ngrx/store"
import { CcState } from "../../codeCharta.model"
import { ViewCubeComponent } from "../viewCube/viewCube.component"
import { AttributeSideBarComponent } from "../attributeSideBar/attributeSideBar.component"

@Component({
    selector: "cc-code-map",
    templateUrl: "./codeMap.component.html",
    imports: [ViewCubeComponent, AttributeSideBarComponent]
})
export class CodeMapComponent implements AfterViewInit {
    isLoadingFile: Signal<boolean | undefined>
    sharpnessMode: Signal<string | undefined>

    private isFirstSharpnessModeChange = true

    constructor(
        public isAttributeSideBarVisibleService: IsAttributeSideBarVisibleService,
        private readonly store: Store<CcState>,
        private readonly threeViewerService: ThreeViewerService,
        private readonly codeMapMouseEventService: CodeMapMouseEventService,
        private readonly elementReference: ElementRef,
        private readonly globalSettingsFacade: GlobalSettingsFacade
    ) {
        this.isLoadingFile = toSignal(this.store.select(isLoadingFileSelector))
        this.sharpnessMode = toSignal(this.globalSettingsFacade.sharpnessMode$())

        effect(() => {
            this.sharpnessMode()
            if (this.isFirstSharpnessModeChange) {
                this.isFirstSharpnessModeChange = false
                return
            }
            this.threeViewerService.restart(this.elementReference.nativeElement.querySelector("#codeMap"))
            this.codeMapMouseEventService.start()
        })
    }

    ngAfterViewInit(): void {
        this.threeViewerService.init(this.elementReference.nativeElement.querySelector("#codeMap"))
        this.codeMapMouseEventService.start()
    }
}
