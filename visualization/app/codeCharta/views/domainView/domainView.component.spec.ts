import { Component, input, signal } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { By } from "@angular/platform-browser"
import { provideMockStore } from "@ngrx/store/testing"
import { render } from "@testing-library/angular"
import { DomainBarReadStore } from "../../features/domainBar/facade"
import { ExplorerCollapseService, ExplorerWidthService } from "../../features/sidebarExplorer/facade"
import { defaultWordCloudSettings, WordCloudSettings } from "../../model/wordCloud.model"
import { defaultState } from "../../stores/rootStore/state.manager"
import { DomainViewComponent } from "./domainView.component"
import { DomainExplorerHost } from "./explorerHost/domainExplorerHost"

@Component({ selector: "cc-sidebar-explorer", template: "", standalone: true })
class StubExplorerComponent {}

@Component({ selector: "cc-word-cloud", template: "", standalone: true })
class StubWordCloudComponent {
    readonly settings = input<WordCloudSettings>(defaultWordCloudSettings)
}

@Component({ selector: "cc-domain-bar", template: "", standalone: true })
class StubDomainBarComponent {}

@Component({ selector: "cc-bottom-bar", template: "", standalone: true })
class StubBottomBarComponent {
    readonly showSelectedWhenNotHovered = input(false)
}

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
        const host = fixture.debugElement.injector.get(DomainExplorerHost)

        // Assert
        expect(host.capabilities).toEqual({ showRules: false, showSearch: false, showCounts: false })
        expect(host.hasContextMenu()).toBe(false)
        // No 3D map here, so nothing gates selection on a building existing
        expect(host.isSelectable()).toBe(true)
    })

    it("should inset the cloud container by the explorer width so the explorer cannot occlude the cloud", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup()
        const widthService = TestBed.inject(ExplorerWidthService)

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
        const collapseService = TestBed.inject(ExplorerCollapseService)

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
