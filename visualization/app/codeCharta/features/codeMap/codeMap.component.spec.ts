import { ElementRef } from "@angular/core"
import { EMPTY } from "rxjs"
import { InspectorVisibilityService } from "../../features/sidebarInspector/facade"
import { ThreeViewerService } from "../../renderer/threeViewer/threeViewer.service"
import { FileStoreReadWindow } from "../../stores/fileStore/fileStore.facade"
import { CodeMapComponent } from "./codeMap.component"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"

describe("CodeMapComponent", () => {
    let mockedThreeViewService: ThreeViewerService
    let mockedCodeMapMouseEventService: CodeMapMouseEventService
    let mockedElementReference: ElementRef
    const mockedFileStoreReadWindow = {
        isLoadingFile$: EMPTY
    } as unknown as FileStoreReadWindow

    beforeEach(() => {
        mockedThreeViewService = { init: jest.fn() } as unknown as ThreeViewerService
        mockedCodeMapMouseEventService = { start: jest.fn() } as unknown as CodeMapMouseEventService
        mockedElementReference = { nativeElement: { querySelector: jest.fn() } }
    })

    it("should init threeViewerService and start codeMapMouseService after view init", () => {
        // Arrange
        const codeMapComponent = new CodeMapComponent(
            { isVisible: () => true } as unknown as InspectorVisibilityService,
            mockedFileStoreReadWindow,
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
