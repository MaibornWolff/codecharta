import { Component, computed, ElementRef, signal, viewChild } from "@angular/core"
import { FormsModule } from "@angular/forms"
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
    readonly nameValid = computed(() => this.name().trim().length > 0)

    constructor(private readonly scenariosService: ScenariosService) {}

    open() {
        this.name.set("")
        this.description.set("")
        this.dialogElement().nativeElement.showModal()
    }

    close() {
        this.dialogElement().nativeElement.close()
    }

    async save() {
        if (this.nameValid()) {
            await this.scenariosService.saveScenario(this.name(), this.description() || undefined)
            this.close()
        }
    }
}
