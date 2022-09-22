import "./codeMap.component.scss"
import { Component, Inject, AfterViewInit, ElementRef } from "@angular/core"
import { Store } from "../../state/angular-redux/store"
import { isLoadingFileSelector } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.selector"
import { isAttributeSideBarVisibleSelector } from "../../state/store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.selector"
import { ThreeViewerService } from "./threeViewer/threeViewerService"
import { CodeMapMouseEventServiceToken, ThreeViewerServiceToken } from "../../services/ajs-upgraded-providers"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { onStoreChanged } from "../../state/angular-redux/onStoreChanged/onStoreChanged"
import { sharpnessModeSelector } from "../../state/store/appSettings/sharpnessMode/sharpnessMode.selector"

@Component({
	selector: "cc-code-map",
	template: require("./codeMap.component.html")
})
export class CodeMapComponent implements AfterViewInit {
	isLoadingFile$ = this.store.select(isLoadingFileSelector)
	isAttributeSidebarVisible$ = this.store.select(isAttributeSideBarVisibleSelector)

	constructor(
		@Inject(Store) private store: Store,
		@Inject(ThreeViewerServiceToken) private threeViewerService: ThreeViewerService,
		@Inject(CodeMapMouseEventServiceToken) private codeMapMouseEventService: CodeMapMouseEventService,
		@Inject(ElementRef) private elementReference: ElementRef
	) {}

	ngAfterViewInit(): void {
		this.initMap()
		onStoreChanged(sharpnessModeSelector, oldValue => {
			if (!oldValue) {
				// skip initial change as this is already handled within ngAfterViewInit
				return
			}
			this.threeViewerService.stopAnimate()
			this.threeViewerService.destroy()
			this.initMap()
			this.threeViewerService.autoFitTo()
			this.threeViewerService.animate()
			this.threeViewerService.animateStats()
		})
	}

	private initMap() {
		this.threeViewerService.init(this.elementReference.nativeElement.querySelector("#codeMap"))
		this.codeMapMouseEventService.start()
	}
}
