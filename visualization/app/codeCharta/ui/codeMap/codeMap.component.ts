import { Component, AfterViewInit, ElementRef, OnDestroy } from "@angular/core"
import { isLoadingFileSelector } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.selector"
import { ThreeViewerService } from "./threeViewer/threeViewer.service"
import { GlobalSettingsFacade } from "../../features/globalSettings/facade"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { skip, tap } from "rxjs"
import { IsAttributeSideBarVisibleService } from "../../services/isAttributeSideBarVisible.service"
import { Store } from "@ngrx/store"
import { CcState } from "../../codeCharta.model"
import { ViewCubeComponent } from "../viewCube/viewCube.component"
import { AttributeSideBarComponent } from "../attributeSideBar/attributeSideBar.component"
import { AsyncPipe } from "@angular/common"

@Component({
    selector: "cc-code-map",
    templateUrl: "./codeMap.component.html",
    styleUrls: ["./codeMap.component.scss"],
    imports: [ViewCubeComponent, AttributeSideBarComponent, AsyncPipe]
})
export class CodeMapComponent implements AfterViewInit, OnDestroy {
    isLoadingFile$ = this.store.select(isLoadingFileSelector)
    restartOnSharpnessModeChangesSubscription = this.globalSettingsFacade
        .sharpnessMode$()
        .pipe(
            skip(1),
            tap(() => {
                this.threeViewerService.restart(this.elementReference.nativeElement.querySelector("#codeMap"))
                this.codeMapMouseEventService.start()
            })
        )
        .subscribe()

    private barsResizeObserver?: ResizeObserver

    constructor(
        public isAttributeSideBarVisibleService: IsAttributeSideBarVisibleService,
        private readonly store: Store<CcState>,
        private readonly threeViewerService: ThreeViewerService,
        private readonly codeMapMouseEventService: CodeMapMouseEventService,
        private readonly elementReference: ElementRef,
        private readonly globalSettingsFacade: GlobalSettingsFacade
    ) {}

    ngAfterViewInit(): void {
        this.threeViewerService.init(this.elementReference.nativeElement.querySelector("#codeMap"))
        this.codeMapMouseEventService.start()
        this.observeBarsHeight()
    }

    ngOnDestroy(): void {
        this.restartOnSharpnessModeChangesSubscription.unsubscribe()
        this.threeViewerService.stopAnimate()
        this.threeViewerService.destroy()
        this.barsResizeObserver?.disconnect()
    }

    private observeBarsHeight(): void {
        const bars = ["cc-nav-bar", "cc-ribbon-bar", "cc-file-extension-bar"]
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
