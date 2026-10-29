import { computed, Injectable, inject, signal } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { PreferencesReadWindow } from "../../../stores/preferences/preferences.read.facade"
import { ToastService } from "../../shared/facade"
import { canOpenFoldersHere } from "./fileSystemAccess"

export const BLOCKED_MESSAGE = "This browser does not let CodeCharta open local folders here, so the local source entries are hidden"

@Injectable({ providedIn: "root" })
export class LocalSourceAvailability {
    private readonly toast = inject(ToastService)
    private readonly isSwitchedOn = toSignal(inject(PreferencesReadWindow).localSourceEnabled$, { requireSync: true })
    private readonly canOpenFolders = canOpenFoldersHere()
    /** A policy only shows once the picker is tried; it holds for the rest of the session. */
    private readonly isBlocked = signal(false)

    readonly isAvailable = computed(() => this.canOpenFolders && this.isSwitchedOn() && !this.isBlocked())

    reportBlocked(): void {
        if (this.isBlocked()) {
            return
        }
        this.isBlocked.set(true)
        this.toast.show(BLOCKED_MESSAGE, "warning")
    }
}
