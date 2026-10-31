import { computed, Injectable, inject, signal } from "@angular/core"
import { EXPLORER_CAPABILITIES, EXPLORER_CONDITIONAL_MODES } from "../explorerCapabilities"
import { FILES_EXPLORER_MODE } from "../explorerModes"

@Injectable()
export class ExplorerModeService {
    private readonly permanentModes = inject(EXPLORER_CAPABILITIES).modes
    private readonly conditionalModes = inject(EXPLORER_CONDITIONAL_MODES, { optional: true })

    readonly modes = computed(() => [...this.permanentModes, ...(this.conditionalModes?.() ?? [])])

    private readonly activeModeId = signal(this.permanentModes[0].id)

    // A conditional mode that goes away while it is open hands over to the mode the explorer opens in.
    readonly activeMode = computed(() => this.modes().find(mode => mode.id === this.activeModeId()) ?? this.permanentModes[0])
    readonly isFilesMode = computed(() => this.activeMode().id === FILES_EXPLORER_MODE.id)
    readonly showsListTools = computed(() => !this.activeMode().hidesListTools)

    activate(modeId: string) {
        if (this.modes().some(mode => mode.id === modeId)) {
            this.activeModeId.set(modeId)
        }
    }
}
