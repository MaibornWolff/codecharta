import { computed, Injectable, inject, signal } from "@angular/core"
import { EXPLORER_CAPABILITIES } from "../explorerCapabilities"
import { FILES_EXPLORER_MODE } from "../explorerModes"

@Injectable()
export class ExplorerModeService {
    readonly modes = inject(EXPLORER_CAPABILITIES).modes

    private readonly active = signal(this.modes[0])

    readonly activeMode = this.active.asReadonly()
    readonly isFilesMode = computed(() => this.activeMode().id === FILES_EXPLORER_MODE.id)

    activate(modeId: string) {
        const mode = this.modes.find(candidate => candidate.id === modeId)
        if (mode) {
            this.active.set(mode)
        }
    }
}
