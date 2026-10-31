import { TestBed } from "@angular/core/testing"
import { BehaviorSubject } from "rxjs"
import { ThreeSceneService } from "../../../renderer/threeViewer/threeViewer.facade"
import { SharedViewReadWindow } from "../../../stores/sharedView/sharedView.read.facade"
import { NodeInteraction } from "../../../stores/sharedView/sharedView.write.facade"
import { CodeMapRenderService } from "../../codeMap/facade"
import { ClusterHighlightService } from "./clusterHighlight.service"

describe("ClusterHighlightService", () => {
    let kept$: BehaviorSubject<string[]>
    let service: ClusterHighlightService
    const setGreysOutsideKeptHighlight = jest.fn()
    const showLabelsOnlyFor = jest.fn()

    beforeEach(() => {
        setGreysOutsideKeptHighlight.mockClear()
        showLabelsOnlyFor.mockClear()
        kept$ = new BehaviorSubject<string[]>([])
        const nodeInteraction: Partial<NodeInteraction> = {
            keepHighlight: (paths: string[]) => kept$.next([...new Set([...kept$.value, ...paths])]),
            removeKeptHighlight: (paths: string[]) => kept$.next(kept$.value.filter(path => !paths.includes(path)))
        }
        TestBed.configureTestingModule({
            providers: [
                { provide: NodeInteraction, useValue: nodeInteraction },
                { provide: ThreeSceneService, useValue: { setGreysOutsideKeptHighlight } },
                { provide: CodeMapRenderService, useValue: { showLabelsOnlyFor } },
                { provide: SharedViewReadWindow, useValue: { keptHighlightPaths$: kept$ } }
            ]
        })
        service = TestBed.inject(ClusterHighlightService)
    })

    it("should light the files while hovering and put them out afterwards", () => {
        // Arrange & Act
        service.hover(["/a", "/b"])
        const whileHovering = kept$.value
        service.endHover()

        // Assert
        expect(whileHovering).toEqual(["/a", "/b"])
        expect(kept$.value).toEqual([])
    })

    it("should leave a file kept by other means lit when the hover ends", () => {
        // Arrange
        kept$.next(["/a"])

        // Act
        service.hover(["/a", "/b"])
        service.endHover()

        // Assert
        expect(kept$.value).toEqual(["/a"])
    })

    it("should keep the files lit after the hover ends once a click pinned them", () => {
        // Arrange
        service.hover(["/a"])

        // Act
        service.togglePin("cluster", ["/a"])
        service.endHover()

        // Assert
        expect(kept$.value).toEqual(["/a"])
        expect(service.pinnedClusterId()).toBe("cluster")
    })

    it("should put the files out when a second click unpins them", () => {
        // Arrange
        service.hover(["/a"])
        service.togglePin("cluster", ["/a"])

        // Act
        service.togglePin("cluster", ["/a"])

        // Assert
        expect(kept$.value).toEqual([])
        expect(service.pinnedClusterId()).toBeNull()
    })

    it("should move the pin to the cluster clicked next", () => {
        // Arrange
        service.togglePin("first", ["/a", "/shared"])

        // Act
        service.togglePin("second", ["/b", "/shared"])

        // Assert
        expect(kept$.value.sort()).toEqual(["/b", "/shared"])
        expect(service.pinnedClusterId()).toBe("second")
    })

    it("should leave a file kept by other means lit when unpinning", () => {
        // Arrange
        kept$.next(["/a"])
        service.togglePin("cluster", ["/a", "/b"])

        // Act
        service.togglePin("cluster", ["/a", "/b"])

        // Assert
        expect(kept$.value).toEqual(["/a"])
    })

    it("should end the pin when something else clears the kept highlight", () => {
        // Arrange
        service.togglePin("cluster", ["/a"])

        // Act
        kept$.next([])

        // Assert
        expect(service.pinnedClusterId()).toBeNull()
    })

    it("should grey the rest of the map only while hovering", () => {
        // Arrange & Act
        service.hover(["/a"])
        const whileHovering = setGreysOutsideKeptHighlight.mock.lastCall
        service.endHover()

        // Assert
        expect(whileHovering).toEqual([true])
        expect(setGreysOutsideKeptHighlight).toHaveBeenLastCalledWith(false)
    })

    it("should keep the rest of the map grey while pinned, after the hover ended", () => {
        // Arrange
        service.hover(["/a"])

        // Act
        service.togglePin("cluster", ["/a"])
        service.endHover()

        // Assert
        expect(setGreysOutsideKeptHighlight).toHaveBeenLastCalledWith(true)
    })

    it("should stop greying when unpinned", () => {
        // Arrange
        service.togglePin("cluster", ["/a"])
        service.endHover()

        // Act
        service.togglePin("cluster", ["/a"])
        service.endHover()

        // Assert
        expect(setGreysOutsideKeptHighlight).toHaveBeenLastCalledWith(false)
    })

    it("should stop greying when something else ends the pin", () => {
        // Arrange
        service.togglePin("cluster", ["/a"])

        // Act
        kept$.next([])
        TestBed.tick()

        // Assert
        expect(setGreysOutsideKeptHighlight).toHaveBeenLastCalledWith(false)
    })

    it("should label only the hovered files and every file again afterwards", () => {
        // Arrange & Act
        service.hover(["/a"])
        const whileHovering = showLabelsOnlyFor.mock.lastCall
        service.endHover()

        // Assert
        expect(whileHovering).toEqual([new Set(["/a"])])
        expect(showLabelsOnlyFor).toHaveBeenLastCalledWith(null)
    })

    it("should label the pinned and the hovered files together, and the pinned ones once the hover ended", () => {
        // Arrange
        service.togglePin("pinned", ["/a"])

        // Act
        service.hover(["/b"])
        const whileHovering = showLabelsOnlyFor.mock.lastCall
        service.endHover()

        // Assert
        expect(whileHovering).toEqual([new Set(["/b", "/a"])])
        expect(showLabelsOnlyFor).toHaveBeenLastCalledWith(new Set(["/a"]))
    })

    it("should label every file again when something else ends the pin", () => {
        // Arrange
        service.togglePin("cluster", ["/a"])

        // Act
        kept$.next([])
        TestBed.tick()

        // Assert
        expect(showLabelsOnlyFor).toHaveBeenLastCalledWith(null)
    })
})
