import { ElementRef } from "@angular/core"
import { InspectorVisibilityService } from "../../features/sidebarInspector/facade"
import { CodeMapComponent } from "./codeMap.component"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { ThreeViewerService } from "./threeViewer/threeViewer.service"
import { Store } from "@ngrx/store"
import { CcState } from "../../codeCharta.model"

describe("CodeMapComponent", () => {
    let mockedThreeViewService: ThreeViewerService
    let mockedCodeMapMouseEventService: CodeMapMouseEventService
    let mockedElementReference: ElementRef
    const mockedStore = {
        select: jest.fn()
    } as unknown as Store<CcState>

    beforeEach(() => {
        mockedThreeViewService = { init: jest.fn() } as unknown as ThreeViewerService
        mockedCodeMapMouseEventService = { start: jest.fn() } as unknown as CodeMapMouseEventService
        mockedElementReference = { nativeElement: { querySelector: jest.fn() } }
    })

    it("should init threeViewerService and start codeMapMouseService after view init", () => {
        // Arrange
        const codeMapComponent = new CodeMapComponent(
            { isVisible: () => true } as unknown as InspectorVisibilityService,
            mockedStore,
            mockedThreeViewService,
            mockedCodeMapMouseEventService,
            mockedElementReference
        )

        // Act
        codeMapComponent.ngAfterViewInit()

        // Assert
        expect(mockedThreeViewService.init).toHaveBeenCalled()
        expect(mockedCodeMapMouseEventService.start).toHaveBeenCalled()
    })
})
