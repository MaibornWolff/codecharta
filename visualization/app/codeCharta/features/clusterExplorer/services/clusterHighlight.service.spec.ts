import { TestBed } from "@angular/core/testing"
import { BehaviorSubject } from "rxjs"
import { ThreeSceneService } from "../../../renderer/threeViewer/threeViewer.facade"
import { SharedViewReadWindow } from "../../../stores/sharedView/sharedView.read.facade"
import { NodeInteraction } from "../../../stores/sharedView/sharedView.write.facade"
import { ClusterHighlightService } from "./clusterHighlight.service"

describe("ClusterHighlightService", () => {
    let kept$: BehaviorSubject<string[]>
    let service: ClusterHighlightService
    const setKeptHighlightFocus = jest.fn()

    beforeEach(() => {
        setKeptHighlightFocus.mockClear()
        kept$ = new BehaviorSubject<string[]>([])
        const nodeInteraction: Partial<NodeInteraction> = {
            replaceKeptHighlight: (paths: string[]) => kept$.next(paths)
        }
        TestBed.configureTestingModule({
            providers: [
                { provide: NodeInteraction, useValue: nodeInteraction },
                { provide: ThreeSceneService, useValue: { setKeptHighlightFocus } },
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

    it("should show only the hovered files and bring back what was kept when the hover ends", () => {
        // Arrange
        kept$.next(["/kept"])

        // Act
        service.hover(["/a"])
        const whileHovering = kept$.value
        service.endHover()

        // Assert
        expect(whileHovering).toEqual(["/a"])
        expect(kept$.value).toEqual(["/kept"])
    })

    it("should override a pinned cluster while another one is hovered, and keep the pin", () => {
        // Arrange
        service.togglePin("pinned", ["/a"])

        // Act
        service.hover(["/b"])
        const whileHovering = kept$.value
        const pinWhileHovering = service.pinnedClusterId()
        const focusWhileHovering = setKeptHighlightFocus.mock.lastCall
        service.endHover()

        // Assert
        expect(whileHovering).toEqual(["/b"])
        expect(pinWhileHovering).toBe("pinned")
        expect(focusWhileHovering).toEqual([new Set(["/b"])])
        expect(kept$.value).toEqual(["/a"])
        expect(setKeptHighlightFocus).toHaveBeenLastCalledWith(new Set(["/a"]))
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

    it("should put the files out when unpinned, once the hover ends", () => {
        // Arrange
        service.hover(["/a"])
        service.togglePin("cluster", ["/a"])

        // Act
        service.togglePin("cluster", ["/a"])
        const whileStillHovering = kept$.value
        service.endHover()

        // Assert
        expect(whileStillHovering).toEqual(["/a"])
        expect(kept$.value).toEqual([])
        expect(service.pinnedClusterId()).toBeNull()
    })

    it("should move the pin to the cluster clicked next", () => {
        // Arrange
        service.togglePin("first", ["/a", "/shared"])

        // Act
        service.togglePin("second", ["/b", "/shared"])

        // Assert
        expect([...kept$.value].sort()).toEqual(["/b", "/shared"])
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
        TestBed.tick()

        // Assert
        expect(service.pinnedClusterId()).toBeNull()
        expect(setKeptHighlightFocus).toHaveBeenLastCalledWith(null)
    })

    it("should focus the map on the pinned files while pinned and end that when unpinned", () => {
        // Arrange & Act
        service.togglePin("cluster", ["/a"])
        const whilePinned = setKeptHighlightFocus.mock.lastCall
        service.togglePin("cluster", ["/a"])

        // Assert
        expect(whilePinned).toEqual([new Set(["/a"])])
        expect(setKeptHighlightFocus).toHaveBeenLastCalledWith(null)
    })

    it("should ignore the end of a hover that never began", () => {
        // Arrange
        kept$.next(["/kept"])

        // Act
        service.endHover()

        // Assert
        expect(kept$.value).toEqual(["/kept"])
    })
})
