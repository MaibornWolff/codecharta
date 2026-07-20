import { AfterViewInit, ChangeDetectionStrategy, Component, computed, ElementRef, inject, OnDestroy } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { ActiveViewStore } from "../../../../routing/activeView.store"
import { FileStoreReadWindow } from "../../../../stores/fileStore/fileStore.facade"
import { viewNavBarControls } from "../../viewNavBarControls"
import { DeltaSelectorComponent } from "../deltaSelector/deltaSelector.component"
import { MapSelectorComponent } from "../mapSelector/mapSelector.component"
import { ModeToggleComponent } from "../modeToggle/modeToggle.component"
import { NavBarFolderButtonComponent } from "../navBarFolderButton/navBarFolderButton.component"
import { NavBarLogoComponent } from "../navBarLogo/navBarLogo.component"
import { Print3DButtonComponent } from "../print3DButton/print3DButton.component"
import { SettingsButtonComponent } from "../settingsButton/settingsButton.component"
import { ViewSwitcherComponent } from "../viewSwitcher/viewSwitcher.component"

@Component({
    selector: "cc-nav-bar",
    templateUrl: "./navBar.component.html",
    imports: [
        NavBarLogoComponent,
        NavBarFolderButtonComponent,
        MapSelectorComponent,
        DeltaSelectorComponent,
        ModeToggleComponent,
        Print3DButtonComponent,
        SettingsButtonComponent,
        ViewSwitcherComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavBarComponent implements AfterViewInit, OnDestroy {
    private readonly fileStoreReadWindow = inject(FileStoreReadWindow)
    private readonly activeViewStore = inject(ActiveViewStore)
    private readonly elementReference = inject(ElementRef<HTMLElement>)
    private resizeObserver?: ResizeObserver

    isDeltaState = toSignal(this.fileStoreReadWindow.isDeltaState$, { requireSync: true })

    /**
     * The active view has to come from the URL rather than from view lifecycle: the route-reuse strategy
     * detaches views instead of destroying them, so every view stays alive once visited.
     */
    private readonly activeView = toSignal(this.activeViewStore.activeView$, { requireSync: true })

    readonly trailingControls = computed(() => viewNavBarControls[this.activeView()])

    /**
     * The nav bar publishes its own height (as bottomBar and fileExtensionBar do), so every view that
     * offsets below it gets a live value — including views that never mount the code map, which used to
     * own this observer and left the variable unset on a direct domain-view deep link.
     */
    ngAfterViewInit(): void {
        const measuredElement = this.elementReference.nativeElement as HTMLElement
        const updateHeight = () => {
            const height = measuredElement.getBoundingClientRect().height
            document.documentElement.style.setProperty("--cc-bars-height", `${Math.round(height)}px`)
        }
        updateHeight()
        if (typeof ResizeObserver !== "undefined") {
            this.resizeObserver = new ResizeObserver(updateHeight)
            this.resizeObserver.observe(measuredElement)
        }
    }

    ngOnDestroy(): void {
        this.resizeObserver?.disconnect()
        document.documentElement.style.removeProperty("--cc-bars-height")
    }
}
