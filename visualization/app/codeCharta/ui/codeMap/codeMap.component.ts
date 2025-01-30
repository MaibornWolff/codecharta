import { Component, AfterViewInit, ElementRef, OnDestroy } from "@angular/core"
import { isLoadingFileSelector } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.selector"
import { ThreeViewerService } from "./threeViewer/threeViewer.service"
import { sharpnessModeSelector } from "../../state/store/appSettings/sharpnessMode/sharpnessMode.selector"
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
    standalone: true,
    imports: [ViewCubeComponent, AttributeSideBarComponent, AsyncPipe]
})
export class CodeMapComponent implements AfterViewInit, OnDestroy {
    isLoadingFile$ = this.store.select(isLoadingFileSelector)
    restartOnSharpnessModeChangesSubscription = this.store
        .select(sharpnessModeSelector)
        .pipe(
            skip(1),
            tap(() => {
                this.threeViewerService.restart(this.elementReference.nativeElement.querySelector("#codeMap"))
                this.codeMapMouseEventService.start()
            })
        )
        .subscribe()

    constructor(
        public isAttributeSideBarVisibleService: IsAttributeSideBarVisibleService,
        private readonly store: Store<CcState>,
        private readonly threeViewerService: ThreeViewerService,
        private readonly codeMapMouseEventService: CodeMapMouseEventService,
        private readonly elementReference: ElementRef
    ) {}

    ngAfterViewInit(): void {
        this.threeViewerService.init(this.elementReference.nativeElement.querySelector("#codeMap"))
        this.codeMapMouseEventService.start()
    }

    ngOnDestroy(): void {
        this.restartOnSharpnessModeChangesSubscription.unsubscribe()
    }
}
