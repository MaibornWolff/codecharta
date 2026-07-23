import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { ActiveViewStore } from "../../../../routing/activeView.store"
import { FileStoreReadWindow } from "../../../../stores/fileStore/fileStore.facade"
import { HEIGHT_CSS_VARIABLE, PublishesHeightDirective } from "../../../shared/facade"
import { viewNavBarControls } from "../../viewNavBarControls"
import { DeltaSelectorComponent } from "../deltaSelector/deltaSelector.component"
import { MapSelectorComponent } from "../mapSelector/mapSelector.component"
import { ModeToggleComponent } from "../modeToggle/modeToggle.component"
import { NavBarDividerComponent } from "../navBarDivider/navBarDivider.component"
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
        NavBarDividerComponent,
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

    private readonly activeView = toSignal(this.activeViewStore.activeView$, { requireSync: true })

    readonly trailingControls = computed(() => viewNavBarControls[this.activeView()])
}
