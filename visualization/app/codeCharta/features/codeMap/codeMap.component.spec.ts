import { ElementRef } from "@angular/core"
import { EMPTY, firstValueFrom, of } from "rxjs"
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
        mockedThreeViewService = { init: jest.fn(), isContextLost$: of(true) } as unknown as ThreeViewerService
        mockedCodeMapMouseEventService = { start: jest.fn() } as unknown as CodeMapMouseEventService
        mockedElementReference = { nativeElement: { querySelector: jest.fn() } }
    })

    function createComponent() {
        return new CodeMapComponent(
            { isVisible: () => true } as unknown as InspectorVisibilityService,
            mockedFileStoreReadWindow,
            mockedThreeViewService,
            mockedCodeMapMouseEventService,
            mockedElementReference
        )
    }

    it("should init threeViewerService and start codeMapMouseService after view init", () => {
        // Arrange
        const codeMapComponent = createComponent()

        // Act
        codeMapComponent.ngAfterViewInit()

        // Assert
        expect(mockedThreeViewService.init).toHaveBeenCalled()
        expect(mockedCodeMapMouseEventService.start).toHaveBeenCalled()
    })

    it("should expose a lost graphics context, so the blank map is explained instead of silent", async () => {
        // Arrange
        const codeMapComponent = createComponent()

        // Act
        const isContextLost = await firstValueFrom(codeMapComponent.isContextLost$)

        // Assert
        expect(isContextLost).toBe(true)
    })
})
