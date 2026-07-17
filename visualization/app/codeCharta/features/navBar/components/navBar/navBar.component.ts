import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { FileStoreReadWindow } from "../../../../stores/fileStore/fileStore.facade"
import { DeltaSelectorComponent } from "../deltaSelector/deltaSelector.component"
import { MapSelectorComponent } from "../mapSelector/mapSelector.component"
import { ModeToggleComponent } from "../modeToggle/modeToggle.component"
import { NavBarFolderButtonComponent } from "../navBarFolderButton/navBarFolderButton.component"
import { NavBarLogoComponent } from "../navBarLogo/navBarLogo.component"
import { Print3DButtonComponent } from "../print3DButton/print3DButton.component"
import { SettingsButtonComponent } from "../settingsButton/settingsButton.component"

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
        SettingsButtonComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavBarComponent {
    private readonly fileStoreReadWindow = inject(FileStoreReadWindow)

    isDeltaState = toSignal(this.fileStoreReadWindow.isDeltaState$, { requireSync: true })
}
