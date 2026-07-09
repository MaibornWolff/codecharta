import { ElementRef } from "@angular/core"
import { EMPTY } from "rxjs"
import { InspectorVisibilityService } from "../../features/sidebarInspector/facade"
import { ThreeViewerService } from "../../renderer/threeViewer/threeViewer.service"
import { CodeMapComponent } from "./codeMap.component"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { CodeMapStore } from "./stores/codeMap.store"

describe("CodeMapComponent", () => {
    let mockedThreeViewService: ThreeViewerService
    let mockedCodeMapMouseEventService: CodeMapMouseEventService
    let mockedElementReference: ElementRef
    const mockedCodeMapStore = {
        isLoadingFile$: EMPTY
    } as unknown as CodeMapStore

    beforeEach(() => {
        mockedThreeViewService = { init: jest.fn() } as unknown as ThreeViewerService
        mockedCodeMapMouseEventService = { start: jest.fn() } as unknown as CodeMapMouseEventService
        mockedElementReference = { nativeElement: { querySelector: jest.fn() } }
    })

    it("should init threeViewerService and start codeMapMouseService after view init", () => {
        // Arrange
        const codeMapComponent = new CodeMapComponent(
            { isVisible: () => true } as unknown as InspectorVisibilityService,
            mockedCodeMapStore,
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
