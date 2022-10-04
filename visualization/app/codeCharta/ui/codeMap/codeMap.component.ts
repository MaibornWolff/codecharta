import "./codeMap.component.scss"
import { Component, Inject, AfterViewInit, ElementRef, OnDestroy } from "@angular/core"
import { Store } from "../../state/angular-redux/store"
import { isLoadingFileSelector } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.selector"
import { ThreeViewerService } from "./threeViewer/threeViewer.service"
import { CodeMapMouseEventServiceToken } from "../../services/ajs-upgraded-providers"
import { sharpnessModeSelector } from "../../state/store/appSettings/sharpnessMode/sharpnessMode.selector"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { skip, tap } from "rxjs"
import { IsAttributeSideBarVisibleService } from "../../services/isAttributeSideBarVisible.service"

@Component({
	selector: "cc-code-map",
	template: require("./codeMap.component.html")
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
		@Inject(IsAttributeSideBarVisibleService) public isAttributeSideBarVisibleService: IsAttributeSideBarVisibleService,
		@Inject(Store) private store: Store,
		@Inject(ThreeViewerService) private threeViewerService: ThreeViewerService,
		@Inject(CodeMapMouseEventServiceToken) private codeMapMouseEventService: CodeMapMouseEventService,
		@Inject(ElementRef) private elementReference: ElementRef
	) {}

	ngAfterViewInit(): void {
		this.threeViewerService.init(this.elementReference.nativeElement.querySelector("#codeMap"))
		this.codeMapMouseEventService.start()
	}

	ngOnDestroy(): void {
		this.restartOnSharpnessModeChangesSubscription.unsubscribe()
	}
}
