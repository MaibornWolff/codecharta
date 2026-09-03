import { Component, DebugElement, input, output, signal } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { By } from "@angular/platform-browser"
import { provideRouter } from "@angular/router"
import { provideMockStore } from "@ngrx/store/testing"
import { render } from "@testing-library/angular"
import { firstValueFrom } from "rxjs"
import { DomainBarReadStore } from "../../features/domainBar/facade"
import { WordSorting, WordSortingOption } from "../../features/domainWordOccurrences/facade"
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
    ExplorerWidthService
} from "../../features/sidebarExplorer/facade"
import { viewIndependentTreeSelector } from "../../lenses/structure/structure.facade"
import { provideMockState } from "../../mocks/state.mocks"
import { CodeMapNode, NodeType, SortingOption } from "../../model/codeCharta.model"
import { defaultWordCloudSettings, WordCloudSettings } from "../../model/wordCloud.model"
import { accumulatedDataSelector } from "../../renderer/renderModel/renderModel.facade"
import { RightClickedWord } from "../../renderer/wordCloud/wordCloud.facade"
import { defaultState } from "../../stores/rootStore/state.manager"
import { DomainViewComponent } from "./domainView.component"
import { DOMAIN_EXPLORER_MODES, WORDS_EXPLORER_MODE } from "./explorer/domainExplorerModes"

@Component({ selector: "cc-sidebar-explorer", template: "<ng-content></ng-content>", standalone: true })
class StubExplorerComponent {}

@Component({ selector: "cc-word-cloud", template: "", standalone: true })
class StubWordCloudComponent {
    readonly settings = input<WordCloudSettings>(defaultWordCloudSettings)
    readonly selectedNodePath = input<string | null>(null)
    readonly inspectedWord = input<string | null>(null)
    readonly clearSelection = output<void>()
    readonly wordRightClicked = output<RightClickedWord>()
    readonly wordClicked = output<string>()
}

@Component({ selector: "cc-domain-word-menu", template: "", standalone: true })
class StubWordMenuComponent {
    readonly rightClickedWord = input<RightClickedWord | null>(null)
    readonly showOccurrences = output<string>()
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

function inspectWordThroughTheMenu(fixture: { debugElement: DebugElement }, detectChanges: () => void) {
    fixture.debugElement.query(By.directive(StubWordMenuComponent)).componentInstance.showOccurrences.emit("invoice")
    detectChanges()
}

function wordList(fixture: { debugElement: DebugElement }) {
    return fixture.debugElement.query(By.directive(StubWordListComponent)).componentInstance
}

function wordCloud(fixture: { debugElement: DebugElement }) {
    return fixture.debugElement.query(By.directive(StubWordCloudComponent)).componentInstance
}

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
                    StubNodeContextMenuComponent
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
                { provide: DomainBarReadStore, useValue: { settings: signal(settings) } }
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

    it("should expand the word the menu asks about in the explorer's word list", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()

        // Act
        inspectWordThroughTheMenu(fixture, detectChanges)

        // Assert
        expect(wordList(fixture).expandedWord()).toBe("invoice")
    })

    it("should switch the explorer to its word mode when the menu asks about a word", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()
        const modeService = fixture.debugElement.injector.get(ExplorerModeService)

        // Act
        inspectWordThroughTheMenu(fixture, detectChanges)

        // Assert
        expect(modeService.activeMode()).toBe(WORDS_EXPLORER_MODE)
    })

    it("should expand a collapsed explorer when the menu asks about a word, so the list is in sight", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()
        const collapseService = fixture.debugElement.injector.get(ExplorerCollapseService)
        collapseService.toggle()

        // Act
        inspectWordThroughTheMenu(fixture, detectChanges)

        // Assert
        expect(collapseService.isCollapsed()).toBe(false)
    })

    it("should search for the word the menu asks about, so the list narrows to it", async () => {
        // Arrange — whatever was searched before must not keep the word out of the list
        const { fixture, detectChanges } = await setup()
        fixture.debugElement.injector.get(EXPLORER_WORD_SEARCH).setPattern("billing")

        // Act
        inspectWordThroughTheMenu(fixture, detectChanges)

        // Assert
        expect(wordList(fixture).query()).toBe("invoice")
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

    it("should inspect the word that was clicked in the cloud", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()

        // Act
        wordCloud(fixture).wordClicked.emit("invoice")
        detectChanges()

        // Assert
        expect(wordList(fixture).expandedWord()).toBe("invoice")
    })

    it("should mark the inspected word in the cloud, so both halves of the view say the same thing", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()

        // Act
        inspectWordThroughTheMenu(fixture, detectChanges)

        // Assert
        expect(wordCloud(fixture).inspectedWord()).toBe("invoice")
    })

    it("should drop the inspection when the clicked word is clicked again", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()
        wordCloud(fixture).wordClicked.emit("invoice")
        detectChanges()

        // Act
        wordCloud(fixture).wordClicked.emit("invoice")
        detectChanges()

        // Assert
        expect(wordCloud(fixture).inspectedWord()).toBeNull()
    })

    it("should collapse an expanded word when its row is toggled again", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()
        inspectWordThroughTheMenu(fixture, detectChanges)

        // Act
        wordList(fixture).wordToggled.emit("invoice")
        detectChanges()

        // Assert
        expect(wordList(fixture).expandedWord()).toBeNull()
    })

    it("should select the node the word list was clicked on, so the cloud scopes to it", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()
        inspectWordThroughTheMenu(fixture, detectChanges)

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
