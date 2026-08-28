import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { FileStoreReadWindow } from "../../../../stores/fileStore/fileStore.facade"
import { Export3DMapDialogComponent, Export3DMapDialogStore } from "../../../3dPrint/facade"
import { HEIGHT_CSS_VARIABLE, PublishesHeightDirective } from "../../../shared/facade"
import { DeltaSelectorComponent } from "../deltaSelector/deltaSelector.component"
import { MapSelectorComponent } from "../mapSelector/mapSelector.component"
import { NavBarFolderButtonComponent } from "../navBarFolderButton/navBarFolderButton.component"
import { NavBarLogoComponent } from "../navBarLogo/navBarLogo.component"
import { SettingsButtonComponent } from "../settingsButton/settingsButton.component"
import { ViewSwitcherComponent } from "../viewSwitcher/viewSwitcher.component"

@Component({
    selector: "cc-nav-bar",
    templateUrl: "./navBar.component.html",
    imports: [
        Export3DMapDialogComponent,
        NavBarLogoComponent,
        NavBarFolderButtonComponent,
        MapSelectorComponent,
        DeltaSelectorComponent,
        SettingsButtonComponent,
        ViewSwitcherComponent
    ],
    hostDirectives: [PublishesHeightDirective],
    providers: [{ provide: HEIGHT_CSS_VARIABLE, useValue: "--cc-bars-height" }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavBarComponent {
    private readonly fileStoreReadWindow = inject(FileStoreReadWindow)
    private readonly export3DMapDialogStore = inject(Export3DMapDialogStore)

    isDeltaState = toSignal(this.fileStoreReadWindow.isDeltaState$, { requireSync: true })

    /** Hosted here rather than in the print button, which the mode bar unmounts on mouse-out. */
    readonly isExportDialogOpen = this.export3DMapDialogStore.isDialogOpen

    closeExportDialog() {
        this.export3DMapDialogStore.closeDialog()
    }
}
