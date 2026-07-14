import { Injectable } from "@angular/core"
import { CcState } from "../../model/codeCharta.model"
import { deleteCcState, readCcState } from "../../stores/rootStore/indexedDB/indexedDBWriter"

export interface PersistedCcStateRead {
    state: CcState | null
    error: Error | null
}

/**
 * The load pipeline's window onto the persisted cc state. The boot reads it exactly once and
 * threads the result through every branch, so `read` reports a failure instead of throwing:
 * the two boot branches raise different error dialogs for the same failure, and each has to
 * stay in charge of its own message.
 */
@Injectable({ providedIn: "root" })
export class CcStatePersistence {
    async read(): Promise<PersistedCcStateRead> {
        try {
            return { state: (await readCcState()) ?? null, error: null }
        } catch (error) {
            return { state: null, error: error as Error }
        }
    }

    async delete(): Promise<void> {
        await deleteCcState()
    }
}
