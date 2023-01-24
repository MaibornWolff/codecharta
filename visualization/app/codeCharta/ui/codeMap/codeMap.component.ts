import { Component, AfterViewInit, ElementRef, OnDestroy, ViewEncapsulation } from "@angular/core"
import { Store } from "../../state/angular-redux/store"
import { isLoadingFileSelector } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.selector"
import { ThreeViewerService } from "./threeViewer/threeViewer.service"
import { sharpnessModeSelector } from "../../state/store/appSettings/sharpnessMode/sharpnessMode.selector"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { skip, tap } from "rxjs"
import { IsAttributeSideBarVisibleService } from "../../services/isAttributeSideBarVisible.service"

@Component({
	selector: "cc-code-map",
	templateUrl: "./codeMap.component.html",
	styleUrls: ["./codeMap.component.scss"],
	encapsulation: ViewEncapsulation.None
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
		private store: Store,
		private threeViewerService: ThreeViewerService,
		private codeMapMouseEventService: CodeMapMouseEventService,
		private elementReference: ElementRef
	) {}

	ngAfterViewInit(): void {
		this.threeViewerService.init(this.elementReference.nativeElement.querySelector("#codeMap"))
		this.codeMapMouseEventService.start()
	}

	ngOnDestroy(): void {
		this.restartOnSharpnessModeChangesSubscription.unsubscribe()
	}
}
