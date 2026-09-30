import { Store } from "@ngrx/store"
import { BehaviorSubject, NEVER, Observable, of } from "rxjs"
import { pathsWithDependencyLevelsSelector } from "../../../lenses/dependency/dependencyLens.facade"
import { hasDomainDataSelector, pathsWithDomainWordsSelector } from "../../../lenses/domain/domainLens.facade"
import { CcState, CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { rightClickedCodeMapNodeSelector } from "../../../renderer/renderModel/renderModel.facade"
import { isDeltaStateSelector } from "../../../stores/fileStore/fileStore.facade"
import { NodeContextMenuReadStore } from "./nodeContextMenu.read.store"

describe("NodeContextMenuReadStore", () => {
    const rightClickedNode = { name: "a.ts", path: "/root/src/a.ts", type: NodeType.FILE, attributes: {} } as CodeMapNode

    type TrackedSelection = { stream: Observable<ReadonlySet<string>>; activeSubscriptions: () => number }

    function trackedSelection(paths: ReadonlySet<string>): TrackedSelection {
        let activeSubscriptions = 0
        const stream = new Observable<ReadonlySet<string>>(subscriber => {
            activeSubscriptions++
            subscriber.next(paths)
            return () => activeSubscriptions--
        })
        return { stream, activeSubscriptions: () => activeSubscriptions }
    }

    function setup({ hasDomainData = true, isDeltaState = false } = {}) {
        const rightClickedNode$ = new BehaviorSubject<CodeMapNode | null>(null)
        const domainIndex = trackedSelection(new Set([rightClickedNode.path]))
        const dependencyPaths = trackedSelection(new Set([rightClickedNode.path]))
        const streamsBySelector = new Map<unknown, Observable<unknown>>([
            [rightClickedCodeMapNodeSelector, rightClickedNode$],
            [hasDomainDataSelector, of(hasDomainData)],
            [pathsWithDomainWordsSelector, domainIndex.stream],
            [isDeltaStateSelector, of(isDeltaState)],
            [pathsWithDependencyLevelsSelector, dependencyPaths.stream]
        ])
        const store = { select: (selector: unknown) => streamsBySelector.get(selector) ?? NEVER }
        const readStore = new NodeContextMenuReadStore(store as unknown as Store<CcState>)
        return { readStore, rightClickedNode$, domainIndex, dependencyPaths }
    }

    it("should not subscribe to the domain word index while the menu is closed", () => {
        // Arrange
        const { readStore, domainIndex } = setup()
        const emissions: boolean[] = []

        // Act
        readStore.isRightClickedNodeInDomainLens$.subscribe(isInLens => emissions.push(isInLens))

        // Assert
        expect(domainIndex.activeSubscriptions()).toBe(0)
        expect(emissions).toEqual([false])
    })

    it("should look the right-clicked node up in the domain word index while the menu is open", () => {
        // Arrange
        const { readStore, rightClickedNode$, domainIndex } = setup()
        const emissions: boolean[] = []
        readStore.isRightClickedNodeInDomainLens$.subscribe(isInLens => emissions.push(isInLens))

        // Act
        rightClickedNode$.next(rightClickedNode)

        // Assert
        expect(domainIndex.activeSubscriptions()).toBe(1)
        expect(emissions).toEqual([false, true])
    })

    it("should let go of the domain word index once the menu closes", () => {
        // Arrange
        const { readStore, rightClickedNode$, domainIndex } = setup()
        readStore.isRightClickedNodeInDomainLens$.subscribe()
        rightClickedNode$.next(rightClickedNode)

        // Act
        rightClickedNode$.next(null)

        // Assert
        expect(domainIndex.activeSubscriptions()).toBe(0)
    })

    it("should not build the domain word index when the loaded files carry no domain words", () => {
        // Arrange
        const { readStore, rightClickedNode$, domainIndex } = setup({ hasDomainData: false })
        const emissions: boolean[] = []
        readStore.isRightClickedNodeInDomainLens$.subscribe(isInLens => emissions.push(isInLens))

        // Act
        rightClickedNode$.next(rightClickedNode)

        // Assert
        expect(domainIndex.activeSubscriptions()).toBe(0)
        expect(emissions).toEqual([false])
    })

    it("should not subscribe to the dependency paths while the menu is closed", () => {
        // Arrange
        const { readStore, dependencyPaths } = setup()
        const emissions: boolean[] = []

        // Act
        readStore.isRightClickedNodeInDependencyLens$.subscribe(isInLens => emissions.push(isInLens))

        // Assert
        expect(dependencyPaths.activeSubscriptions()).toBe(0)
        expect(emissions).toEqual([false])
    })

    it("should look the right-clicked node up in the dependency paths while the menu is open", () => {
        // Arrange
        const { readStore, rightClickedNode$, dependencyPaths } = setup()
        const emissions: boolean[] = []
        readStore.isRightClickedNodeInDependencyLens$.subscribe(isInLens => emissions.push(isInLens))

        // Act
        rightClickedNode$.next(rightClickedNode)

        // Assert
        expect(dependencyPaths.activeSubscriptions()).toBe(1)
        expect(emissions).toEqual([false, true])
    })

    it("should not look up the dependency paths in compare mode, which the dependency view cannot show", () => {
        // Arrange
        const { readStore, rightClickedNode$, dependencyPaths } = setup({ isDeltaState: true })
        const emissions: boolean[] = []
        readStore.isRightClickedNodeInDependencyLens$.subscribe(isInLens => emissions.push(isInLens))

        // Act
        rightClickedNode$.next(rightClickedNode)

        // Assert
        expect(dependencyPaths.activeSubscriptions()).toBe(0)
        expect(emissions).toEqual([false])
    })
})
