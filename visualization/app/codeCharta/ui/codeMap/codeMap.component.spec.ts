import { ElementRef } from "@angular/core"
import { Subject } from "rxjs"
import { Store } from "../../state/angular-redux/store"
import { sharpnessModeSelector } from "../../state/store/appSettings/sharpnessMode/sharpnessMode.selector"
import { CodeMapComponent } from "./codeMap.component"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { ThreeViewerService } from "./threeViewer/threeViewerService"

describe("CodeMapComponent", () => {
	let mockedThreeViewService: ThreeViewerService
	let mockedCodeMapMouseEventService: CodeMapMouseEventService
	let mockedElementReference: ElementRef
	let mockedSharpnessModeSelector$: Subject<string>
	const mockedStore = {
		select: (selector: unknown) => {
			switch (selector) {
				case sharpnessModeSelector:
					return mockedSharpnessModeSelector$
				default:
					return jest.fn()
			}
		}
	} as unknown as Store

	beforeEach(() => {
		mockedThreeViewService = { init: jest.fn(), restart: jest.fn() } as unknown as ThreeViewerService
		mockedCodeMapMouseEventService = { start: jest.fn() } as unknown as CodeMapMouseEventService
		mockedElementReference = { nativeElement: { querySelector: jest.fn() } }
		mockedSharpnessModeSelector$ = new Subject()
	})

	it("should init threeViewerService and start codeMapMouseService after view init", () => {
		const codeMapComponent = new CodeMapComponent(
			mockedStore,
			mockedThreeViewService,
			mockedCodeMapMouseEventService,
			mockedElementReference
		)
		codeMapComponent.ngAfterViewInit()
		expect(mockedThreeViewService.init).toHaveBeenCalled()
		expect(mockedCodeMapMouseEventService.start).toHaveBeenCalled()
	})

	it("should restart on sharpnessModeChanges but not on first one as it will get started then", () => {
		new CodeMapComponent(mockedStore, mockedThreeViewService, mockedCodeMapMouseEventService, mockedElementReference)
		mockedSharpnessModeSelector$.next("High")
		expect(mockedThreeViewService.restart).not.toHaveBeenCalled()
		expect(mockedCodeMapMouseEventService.start).not.toHaveBeenCalled()

		mockedSharpnessModeSelector$.next("Low")
		expect(mockedThreeViewService.restart).toHaveBeenCalled()
		expect(mockedCodeMapMouseEventService.start).toHaveBeenCalled()
	})
})
