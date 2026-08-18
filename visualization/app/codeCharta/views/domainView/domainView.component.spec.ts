import { Component, input, output, signal } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { By } from "@angular/platform-browser"
import { provideMockStore } from "@ngrx/store/testing"
import { render } from "@testing-library/angular"
import { DomainBarReadStore } from "../../features/domainBar/facade"
import {
    EXPLORER_CAPABILITIES,
    EXPLORER_CONTEXT_MENU,
    EXPLORER_ROW,
    ExplorerCollapseService,
    ExplorerWidthService
} from "../../features/sidebarExplorer/facade"
import { CodeMapNode, NodeType, SortingOption } from "../../model/codeCharta.model"
import { defaultWordCloudSettings, WordCloudSettings } from "../../model/wordCloud.model"
import { defaultState } from "../../stores/rootStore/state.manager"
import { DomainViewComponent } from "./domainView.component"

@Component({ selector: "cc-sidebar-explorer", template: "<ng-content></ng-content>", standalone: true })
class StubExplorerComponent {}

@Component({ selector: "cc-word-cloud", template: "", standalone: true })
class StubWordCloudComponent {
    readonly settings = input<WordCloudSettings>(defaultWordCloudSettings)
    readonly selectedNodePath = input<string | null>(null)
    readonly clearSelection = output<void>()
}

@Component({ selector: "cc-domain-bar", template: "", standalone: true })
class StubDomainBarComponent {}

@Component({ selector: "cc-bottom-bar", template: "", standalone: true })
class StubBottomBarComponent {
    readonly showSelectedWhenNotHovered = input(false)
    readonly selectedNodePath = input<string | null | undefined>(undefined)
}

const SOME_NODE = { name: "a.ts", path: "/root/a.ts", id: 1, type: NodeType.FILE, attributes: {} } as unknown as CodeMapNode

describe("DomainViewComponent", () => {
    async function setup(settings = defaultWordCloudSettings) {
        TestBed.overrideComponent(DomainViewComponent, {
            set: { imports: [StubExplorerComponent, StubWordCloudComponent, StubDomainBarComponent, StubBottomBarComponent] }
        })
        return render(DomainViewComponent, {
            providers: [
                provideMockStore({ initialState: defaultState }),
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
            sortOptions: [SortingOption.NAME, SortingOption.NUMBER_OF_FILES]
        })
        expect(injector.get(EXPLORER_CONTEXT_MENU, null)).toBeNull()
        expect(injector.get(EXPLORER_ROW).project(SOME_NODE).isSelectable).toBe(true)
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

    it("should render the domain settings bar", async () => {
        // Arrange & Act
        const { container } = await setup()

        // Assert
        expect(container.querySelector("cc-domain-bar")).not.toBe(null)
    })
})
