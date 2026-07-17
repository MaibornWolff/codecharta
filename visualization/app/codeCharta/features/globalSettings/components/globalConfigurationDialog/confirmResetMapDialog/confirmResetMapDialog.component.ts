import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from "@angular/core"
import { CcStatePersistence, LoadFilesUseCase } from "../../../../../load/load.facade"
import { MapResetStore } from "../../../stores/mapReset.store"

@Component({
    selector: "cc-confirm-reset-map-dialog",
    templateUrl: "./confirmResetMapDialog.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmResetMapDialogComponent {
    readonly dialogElement = viewChild.required<ElementRef<HTMLDialogElement>>("dialog")

    constructor(
        private readonly mapResetStore: MapResetStore,
        private readonly ccStatePersistence: CcStatePersistence,
        private readonly loadFilesUseCase: LoadFilesUseCase
    ) {}

    open() {
        this.dialogElement().nativeElement.showModal()
    }

    close() {
        this.dialogElement().nativeElement.close()
    }

    async confirmReset() {
        this.close()
        await this.resetMap()
    }

    async resetMap() {
        await this.ccStatePersistence.delete()
        this.mapResetStore.resetState()
        await this.loadFilesUseCase.reloadAfterReset()
    }
}
