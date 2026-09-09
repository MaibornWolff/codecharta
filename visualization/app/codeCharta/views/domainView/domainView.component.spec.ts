import { Component, DebugElement, input, output, signal } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { By } from "@angular/platform-browser"
import { provideRouter } from "@angular/router"
import { provideMockStore } from "@ngrx/store/testing"
import { render } from "@testing-library/angular"
import { firstValueFrom, of } from "rxjs"
import { DomainBarReadStore } from "../../features/domainBar/facade"
import {
    DomainWordOccurrencesReadStore,
    HiddenWordsWriteStore,
    WordSorting,
    WordSortingOption
} from "../../features/domainWordOccurrences/facade"
import { NODE_CONTEXT_MENU_CAPABILITIES, NodeContextMenuForExplorer } from "../../features/nodeContextMenu/facade"
import {
    EXPLORER_CAPABILITIES,
    EXPLORER_CONTEXT_MENU,
    EXPLORER_ROW,
    EXPLORER_TREE,
    EXPLORER_WORD_SEARCH,
    EXPLORER_WORD_SORT,
    ExplorerCollapseService,
    ExplorerModeService,
    ExplorerWidthService,
    FILES_EXPLORER_MODE
} from "../../features/sidebarExplorer/facade"
import { viewIndependentTreeSelector } from "../../lenses/structure/structure.facade"
import { provideMockState } from "../../mocks/state.mocks"
import { CodeMapNode, DomainWord, NodeType, SortingOption } from "../../model/codeCharta.model"
import { defaultWordCloudSettings, WordCloudSettings } from "../../model/wordCloud.model"
import { accumulatedDataSelector } from "../../renderer/renderModel/renderModel.facade"
import { RightClickedWord } from "../../renderer/wordCloud/wordCloud.facade"
import { defaultState } from "../../stores/rootStore/state.manager"
import { CopyToClipboardService } from "../../util/copyToClipboard.service"
import { DomainViewComponent } from "./domainView.component"
import { DOMAIN_EXPLORER_MODES, WORDS_EXPLORER_MODE } from "./explorer/domainExplorerModes"
import { DomainSelectionStore } from "./stores/domainSelection.store"

@Component({ selector: "cc-sidebar-explorer", template: "<ng-content></ng-content>", standalone: true })
class StubExplorerComponent {}

@Component({ selector: "cc-word-cloud", template: "", standalone: true })
class StubWordCloudComponent {
    readonly settings = input<WordCloudSettings>(defaultWordCloudSettings)
    readonly selectedNodePath = input<string | null>(null)
    readonly customShapeMask = input<string | null>(null)
    readonly markedWords = input<readonly string[]>([])
    readonly clearSelection = output<void>()
    readonly backgroundClicked = output<void>()
    readonly wordRightClicked = output<RightClickedWord>()
    readonly wordClicked = output<string>()
}

@Component({ selector: "cc-explorer-count-chip", template: "", standalone: true })
class StubCountChipComponent {
    readonly label = input.required<string>()
    readonly count = input.required<number>()
    readonly popoverId = input<string | undefined>()
    readonly anchorName = input<string | undefined>()
    readonly tooltip = input<string | undefined>()
}

@Component({ selector: "cc-hidden-words-popover", template: "", standalone: true })
class StubHiddenWordsPopoverComponent {
    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()
}

@Component({ selector: "cc-domain-word-menu", template: "", standalone: true })
class StubWordMenuComponent {
    readonly rightClickedWord = input<RightClickedWord | null>(null)
    readonly searchWord = output<string>()
    readonly hideWord = output<string>()
    readonly closed = output<void>()
}

@Component({ selector: "cc-domain-word-list", template: "", standalone: true })
class StubWordListComponent {
    readonly query = input("")
    readonly sorting = input<WordSorting | null>(null)
    readonly expandedWord = input<string | null>(null)
    readonly selectedNodePath = input<string | null>(null)
    readonly wordToggled = output<string>()
    readonly nodeClicked = output<string>()
}

@Component({ selector: "cc-node-context-menu", template: "", standalone: true })
class StubNodeContextMenuComponent {}

@Component({ selector: "cc-domain-bar", template: "", standalone: true })
class StubDomainBarComponent {}

@Component({ selector: "cc-bottom-bar", template: "", standalone: true })
class StubBottomBarComponent {
    readonly showSelectedWhenNotHovered = input(false)
    readonly selectedNodePath = input<string | null | undefined>(undefined)
}

const SOME_NODE = { name: "a.ts", path: "/root/a.ts", id: 1, type: NodeType.FILE, attributes: {} } as unknown as CodeMapNode
const VIEW_INDEPENDENT_ROOT = { name: "root", path: "/root", type: NodeType.FOLDER, attributes: {}, children: [] } as CodeMapNode
const RENDER_MODEL_ROOT = { name: "map", path: "/map", type: NodeType.FOLDER, attributes: {}, children: [] } as CodeMapNode

function openWordFromTheCloud(fixture: { debugElement: DebugElement }, detectChanges: () => void) {
    wordCloud(fixture).wordClicked.emit("invoice")
    detectChanges()
}

function searchWordThroughTheMenu(fixture: { debugElement: DebugElement }, detectChanges: () => void) {
    fixture.debugElement.query(By.directive(StubWordMenuComponent)).componentInstance.searchWord.emit("invoice")
    detectChanges()
}

function wordList(fixture: { debugElement: DebugElement }) {
    return fixture.debugElement.query(By.directive(StubWordListComponent)).componentInstance
}

function wordCloud(fixture: { debugElement: DebugElement }) {
    return fixture.debugElement.query(By.directive(StubWordCloudComponent)).componentInstance
}

const PROJECT_WORDS: DomainWord[] = [
    { text: "payment", frequency: 30 },
    { text: "prepaid", frequency: 12 },
    { text: "invoice", frequency: 42 }
]

describe("DomainViewComponent", () => {
    async function setup(settings = defaultWordCloudSettings) {
        TestBed.overrideComponent(DomainViewComponent, {
            set: {
                imports: [
                    StubExplorerComponent,
                    StubWordCloudComponent,
                    StubDomainBarComponent,
                    StubBottomBarComponent,
                    StubWordMenuComponent,
                    StubWordListComponent,
                    StubNodeContextMenuComponent,
                    StubCountChipComponent,
                    StubHiddenWordsPopoverComponent
                ]
            }
        })
        return render(DomainViewComponent, {
            providers: [
                provideRouter([]),
                provideMockState(),
                provideMockStore({
                    initialState: defaultState,
                    selectors: [
                        { selector: viewIndependentTreeSelector, value: VIEW_INDEPENDENT_ROOT },
                        { selector: accumulatedDataSelector, value: { unifiedMapNode: RENDER_MODEL_ROOT } }
                    ]
                }),
                { provide: DomainBarReadStore, useValue: { settings: signal(settings) } },
                { provide: DomainWordOccurrencesReadStore, useValue: { projectWords$: of(PROJECT_WORDS) } }
            ]
        })
    }

    it("should supply the domain reading of an explorer row, with the map-only chrome switched off", async () => {
        // Arrange & Act
        const { fixture } = await setup()
        const injector = fixture.debugElement.injector

        // Assert
        expect(injector.get(EXPLORER_CAPABILITIES)).toEqual({
            showRules: false,
            showSearch: true,
            showCounts: false,
            modes: DOMAIN_EXPLORER_MODES
        })
        expect(injector.get(NODE_CONTEXT_MENU_CAPABILITIES)).toEqual({ showMapActions: false, jumpTargetView: "metrics" })
        expect(injector.get(EXPLORER_ROW).project(SOME_NODE).isSelectable).toBe(true)
    })

    it("should offer the node context menu on every explorer row", async () => {
        // Arrange
        const { fixture } = await setup()

        // Act
        const contextMenu = fixture.debugElement.injector.get(EXPLORER_CONTEXT_MENU)

        // Assert
        expect(contextMenu).toBeInstanceOf(NodeContextMenuForExplorer)
        expect(contextMenu.isEnabledFor(SOME_NODE.path)).toBe(true)
    })

    it("should read the view-independent tree, so the map's blacklist cannot shape the domain explorer", async () => {
        // Arrange
        const { fixture } = await setup()
        const explorerTree = fixture.debugElement.injector.get(EXPLORER_TREE)

        // Act
        const rootNode = await firstValueFrom(explorerTree.rootNodeFor(SortingOption.NAME, true))

        // Assert
        expect(rootNode.path).toBe(VIEW_INDEPENDENT_ROOT.path)
    })

    it("should inset the cloud container by the explorer width so the explorer cannot occlude the cloud", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()
        const widthService = fixture.debugElement.injector.get(ExplorerWidthService)

        // Act
        widthService.setWidth(480)
        detectChanges()

        // Assert
        const cloudContainer = fixture.debugElement.query(By.directive(StubWordCloudComponent)).nativeElement.parentElement
        expect(cloudContainer.style.left).toBe("480px")
    })

    it("should drop the inset while the explorer is collapsed, since it then only covers a short bar", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()
        const collapseService = fixture.debugElement.injector.get(ExplorerCollapseService)

        // Act
        collapseService.toggle()
        detectChanges()

        // Assert
        const cloudContainer = fixture.debugElement.query(By.directive(StubWordCloudComponent)).nativeElement.parentElement
        expect(cloudContainer.style.left).toBe("0px")
    })

    it("should bind the domain-bar settings into the word cloud", async () => {
        // Arrange & Act
        const settings = { ...defaultWordCloudSettings, topN: 42 }
        const { fixture } = await setup(settings)
        const wordCloud = fixture.debugElement.query(By.directive(StubWordCloudComponent))

        // Assert
        expect(wordCloud).not.toBe(null)
        expect(wordCloud.componentInstance.settings()).toBe(settings)
    })

    it("should hand a right-clicked word to the word menu, so it opens at the pointer", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()
        const rightClickedWord: RightClickedWord = { word: "invoice", clientX: 40, clientY: 80 }

        // Act
        fixture.debugElement.query(By.directive(StubWordCloudComponent)).componentInstance.wordRightClicked.emit(rightClickedWord)
        detectChanges()

        // Assert
        expect(fixture.debugElement.query(By.directive(StubWordMenuComponent)).componentInstance.rightClickedWord()).toBe(rightClickedWord)
    })

    it("should expand no word in the list before one is inspected", async () => {
        // Arrange & Act
        const { fixture } = await setup()

        // Assert
        expect(wordList(fixture).expandedWord()).toBeNull()
    })

    it("should expand the word clicked in the cloud in the explorer's word list", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()

        // Act
        openWordFromTheCloud(fixture, detectChanges)

        // Assert
        expect(wordList(fixture).expandedWord()).toBe("invoice")
    })

    it("should switch the explorer to its word mode when a word is clicked in the cloud", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()
        const modeService = fixture.debugElement.injector.get(ExplorerModeService)

        // Act
        openWordFromTheCloud(fixture, detectChanges)

        // Assert
        expect(modeService.activeMode()).toBe(WORDS_EXPLORER_MODE)
    })

    it("should expand a collapsed explorer when a word is clicked in the cloud, so the list is in sight", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()
        const collapseService = fixture.debugElement.injector.get(ExplorerCollapseService)
        collapseService.toggle()

        // Act
        openWordFromTheCloud(fixture, detectChanges)

        // Assert
        expect(collapseService.isCollapsed()).toBe(false)
    })

    it("should leave the search box as the reader left it when a word is clicked in the cloud", async () => {
        // Arrange — writing the word into the box would mark it for a search nobody typed
        const { fixture, detectChanges } = await setup()
        fixture.debugElement.injector.get(EXPLORER_WORD_SEARCH).setPattern("billing")

        // Act
        openWordFromTheCloud(fixture, detectChanges)

        // Assert
        expect(wordList(fixture).query()).toBe("billing")
    })

    it("should filter the word list by the explorer's word search", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()

        // Act
        fixture.debugElement.injector.get(EXPLORER_WORD_SEARCH).setPattern("invo")
        detectChanges()

        // Assert
        expect(wordList(fixture).query()).toBe("invo")
    })

    it("should order the word list by the explorer's word sort", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()

        // Act
        fixture.debugElement.injector.get(EXPLORER_WORD_SORT).setOption(WordSortingOption.NAME)
        detectChanges()

        // Assert
        expect(wordList(fixture).sorting()).toEqual({ option: WordSortingOption.NAME, ascending: true })
    })

    it("should show the occurrences of the word that was clicked in the cloud", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()
        const modeService = fixture.debugElement.injector.get(ExplorerModeService)

        // Act
        wordCloud(fixture).wordClicked.emit("invoice")
        detectChanges()

        // Assert — the click opens the word on its own, and the search box is left alone so the whole
        // list stays in reach.
        expect(modeService.activeMode().id).toBe(WORDS_EXPLORER_MODE.id)
        expect(wordList(fixture).expandedWord()).toBe("invoice")
        expect(wordList(fixture).query()).toBe("")
    })

    it("should mark every word the explorer's search matched, not just the inspected one", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()
        fixture.debugElement.injector.get(ExplorerModeService).activate(WORDS_EXPLORER_MODE.id)

        // Act
        fixture.debugElement.injector.get(EXPLORER_WORD_SEARCH).setPattern("pa")
        detectChanges()

        // Assert
        expect(wordCloud(fixture).markedWords()).toEqual(["payment", "prepaid"])
    })

    it("should stop marking the search matches once the explorer browses files, where the query is out of sight", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()
        fixture.debugElement.injector.get(ExplorerModeService).activate(WORDS_EXPLORER_MODE.id)
        fixture.debugElement.injector.get(EXPLORER_WORD_SEARCH).setPattern("pa")
        detectChanges()

        // Act
        fixture.debugElement.injector.get(ExplorerModeService).activate(FILES_EXPLORER_MODE.id)
        detectChanges()

        // Assert
        expect(wordCloud(fixture).markedWords()).toEqual([])
    })

    it("should let the broken-down word and the scoped node go when the cloud is clicked beside every word", async () => {
        // Arrange — a word broken down and the cloud scoped to a node, the state a click builds up
        const { fixture, detectChanges } = await setup()
        openWordFromTheCloud(fixture, detectChanges)
        fixture.debugElement.injector.get(DomainSelectionStore).select("/root/ParentLeaf")
        detectChanges()

        // Act
        wordCloud(fixture).backgroundClicked.emit()
        detectChanges()

        // Assert
        expect(wordList(fixture).expandedWord()).toBe(null)
        expect(wordCloud(fixture).selectedNodePath()).toBe(null)
    })

    it("should keep marking what the search matched when the cloud is clicked beside every word", async () => {
        // Arrange — the search box still says "pa", so its matches are the reader's own state
        const { fixture, detectChanges } = await setup()
        fixture.debugElement.injector.get(ExplorerModeService).activate(WORDS_EXPLORER_MODE.id)
        fixture.debugElement.injector.get(EXPLORER_WORD_SEARCH).setPattern("pa")
        detectChanges()

        // Act
        wordCloud(fixture).backgroundClicked.emit()
        detectChanges()

        // Assert
        expect(wordCloud(fixture).markedWords()).toEqual(["payment", "prepaid"])
    })

    it("should mark the inspected word in the cloud, so both halves of the view say the same thing", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()

        // Act
        openWordFromTheCloud(fixture, detectChanges)

        // Assert
        expect(wordCloud(fixture).markedWords()).toContain("invoice")
    })

    it("should search for the word the menu asks to search, so the list narrows to it", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()

        // Act
        searchWordThroughTheMenu(fixture, detectChanges)

        // Assert
        expect(wordList(fixture).query()).toBe("invoice")
    })

    it("should not pin the word the menu searches for, since searching is not opening", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()

        // Act
        searchWordThroughTheMenu(fixture, detectChanges)

        // Assert
        expect(wordList(fixture).expandedWord()).toBeNull()
    })

    it("should switch the explorer to its word mode when the menu searches for a word", async () => {
        // Arrange — the search box filters paths while the explorer browses files, so the query would
        // land where nobody can see it
        const { fixture, detectChanges } = await setup()
        const modeService = fixture.debugElement.injector.get(ExplorerModeService)

        // Act
        searchWordThroughTheMenu(fixture, detectChanges)

        // Assert
        expect(modeService.activeMode()).toBe(WORDS_EXPLORER_MODE)
    })

    it("should close the word menu when it dismisses itself", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()
        fixture.debugElement.query(By.directive(StubWordMenuComponent)).componentInstance.closed.emit()
        detectChanges()

        // Act
        const rightClickedWord = fixture.debugElement.query(By.directive(StubWordMenuComponent)).componentInstance.rightClickedWord()

        // Assert
        expect(rightClickedWord).toBeNull()
    })

    it("should put the cloud back on the whole project when it asks to show the whole map", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()
        fixture.debugElement.injector.get(DomainSelectionStore).select("/root/ParentLeaf")
        detectChanges()

        // Act
        wordCloud(fixture).clearSelection.emit()
        detectChanges()

        // Assert
        expect(wordCloud(fixture).selectedNodePath()).toBeNull()
    })

    it("should copy the selected node's path", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()
        const clipboard = fixture.debugElement.injector.get(CopyToClipboardService)
        const copy = jest.spyOn(clipboard, "copy").mockResolvedValue()
        fixture.debugElement.injector.get(DomainSelectionStore).select("/root/ParentLeaf")
        detectChanges()

        // Act
        await fixture.componentInstance.copySelectedPath()

        // Assert
        expect(copy).toHaveBeenCalledWith("/root/ParentLeaf")
    })

    it("should copy nothing while no node is selected", async () => {
        // Arrange
        const { fixture } = await setup()
        const clipboard = fixture.debugElement.injector.get(CopyToClipboardService)
        const copy = jest.spyOn(clipboard, "copy").mockResolvedValue()

        // Act
        await fixture.componentInstance.copySelectedPath()

        // Assert
        expect(copy).not.toHaveBeenCalled()
    })

    it("should hide the word the menu asks to hide", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()
        const hiddenWordsStore = fixture.debugElement.injector.get(HiddenWordsWriteStore)
        const hide = jest.spyOn(hiddenWordsStore, "hide")

        // Act
        fixture.debugElement.query(By.directive(StubWordMenuComponent)).componentInstance.hideWord.emit("invoice")
        detectChanges()

        // Assert
        expect(hide).toHaveBeenCalledWith("invoice")
    })

    it("should stop inspecting a word that is hidden, since it has left both the cloud and the list", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()
        openWordFromTheCloud(fixture, detectChanges)

        // Act
        fixture.debugElement.query(By.directive(StubWordMenuComponent)).componentInstance.hideWord.emit("invoice")
        detectChanges()

        // Assert
        expect(wordList(fixture).expandedWord()).toBeNull()
    })

    it("should collapse an expanded word when its row is toggled again", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()
        openWordFromTheCloud(fixture, detectChanges)

        // Act
        wordList(fixture).wordToggled.emit("invoice")
        detectChanges()

        // Assert
        expect(wordList(fixture).expandedWord()).toBeNull()
    })

    it("should select the node the word list was clicked on, so the cloud scopes to it", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()
        openWordFromTheCloud(fixture, detectChanges)

        // Act
        wordList(fixture).nodeClicked.emit("/root/billing")
        detectChanges()

        // Assert
        expect(wordList(fixture).selectedNodePath()).toBe("/root/billing")
    })

    it("should render the domain settings bar", async () => {
        // Arrange & Act
        const { container } = await setup()

        // Assert
        expect(container.querySelector("cc-domain-bar")).not.toBe(null)
    })
})
