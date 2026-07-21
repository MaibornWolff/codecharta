import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { ActiveViewStore } from "../../../../routing/activeView.store"
import { FileStoreReadWindow } from "../../../../stores/fileStore/fileStore.facade"
import { HEIGHT_CSS_VARIABLE, PublishesHeightDirective } from "../../../shared/components/publishesHeight/publishesHeight.directive"
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
    hostDirectives: [PublishesHeightDirective],
    providers: [{ provide: HEIGHT_CSS_VARIABLE, useValue: "--cc-bars-height" }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavBarComponent {
    private readonly fileStoreReadWindow = inject(FileStoreReadWindow)
    private readonly activeViewStore = inject(ActiveViewStore)

    isDeltaState = toSignal(this.fileStoreReadWindow.isDeltaState$, { requireSync: true })

    /**
     * The active view has to come from the URL rather than from view lifecycle: the route-reuse strategy
     * detaches views instead of destroying them, so every view stays alive once visited.
     */
    private readonly activeView = toSignal(this.activeViewStore.activeView$, { requireSync: true })

    readonly trailingControls = computed(() => viewNavBarControls[this.activeView()])
}
