import { Component, computed, ElementRef, signal, viewChild } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { Store } from "@ngrx/store"
import { toSignal } from "@angular/core/rxjs-interop"
import { map } from "rxjs"
import { CcState } from "../../../../codeCharta.model"
import { filesSelector } from "../../../../state/store/files/files.selector"
import { getVisibleFiles } from "../../../../model/files/files.helper"
import { ScenariosService } from "../../services/scenarios.service"

@Component({
    selector: "cc-save-scenario-dialog",
    templateUrl: "./saveScenarioDialog.component.html",
    imports: [FormsModule]
})
export class SaveScenarioDialogComponent {
    readonly dialogElement = viewChild.required<ElementRef<HTMLDialogElement>>("dialog")

    readonly name = signal("")
    readonly description = signal("")
    readonly bindToMap = signal(false)
    readonly nameValid = computed(() => this.name().trim().length > 0)

    readonly visibleFileNames = toSignal(
        this.store.select(filesSelector).pipe(map(fileStates => getVisibleFiles(fileStates).map(f => f.fileMeta.fileName))),
        { initialValue: [] as string[] }
    )

    readonly hasFiles = computed(() => this.visibleFileNames().length > 0)

    constructor(
        private readonly scenariosService: ScenariosService,
        private readonly store: Store<CcState>
    ) {}

    open() {
        this.name.set("")
        this.description.set("")
        this.bindToMap.set(false)
        this.dialogElement().nativeElement.showModal()
    }

    close() {
        this.dialogElement().nativeElement.close()
    }

    async save() {
        if (this.nameValid()) {
            const mapFileNames = this.bindToMap() && this.hasFiles() ? this.visibleFileNames() : undefined
            await this.scenariosService.saveScenario(this.name(), this.description() || undefined, mapFileNames)
            this.close()
        }
    }
}
