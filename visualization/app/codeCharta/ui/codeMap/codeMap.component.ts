import "./codeMap.component.scss"
import { Component, Inject, AfterViewInit, ElementRef, OnDestroy } from "@angular/core"
import { Store } from "../../state/angular-redux/store"
import { isLoadingFileSelector } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.selector"
import { isAttributeSideBarVisibleSelector } from "../../state/store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.selector"
import { ThreeViewerService } from "./threeViewer/threeViewerService"
import { CodeMapMouseEventServiceToken, ThreeViewerServiceToken } from "../../services/ajs-upgraded-providers"
import { sharpnessModeSelector } from "../../state/store/appSettings/sharpnessMode/sharpnessMode.selector"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { skip, tap } from "rxjs"

@Component({
	selector: "cc-code-map",
	template: require("./codeMap.component.html")
})
export class CodeMapComponent implements AfterViewInit, OnDestroy {
	isLoadingFile$ = this.store.select(isLoadingFileSelector)
	isAttributeSidebarVisible$ = this.store.select(isAttributeSideBarVisibleSelector)
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
		@Inject(Store) private store: Store,
		@Inject(ThreeViewerServiceToken) private threeViewerService: ThreeViewerService,
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
