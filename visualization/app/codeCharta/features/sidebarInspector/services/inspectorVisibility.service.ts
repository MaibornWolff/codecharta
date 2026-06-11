import { computed, inject, Injectable, signal } from "@angular/core"
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop"
import { filter } from "rxjs"
import { InspectorSelectedNodeStore } from "../stores/selectedNode.store"

@Injectable({ providedIn: "root" })
export class InspectorVisibilityService {
    private readonly selectedNodeStore = inject(InspectorSelectedNodeStore)

    private readonly manuallyClosed = signal(false)
    private readonly selectedNode = toSignal(this.selectedNodeStore.selectedNode$, { initialValue: undefined })

    readonly isVisible = computed(() => this.selectedNode() != null && !this.manuallyClosed())

    constructor() {
        this.selectedNodeStore.selectedBuildingId$
            .pipe(
                filter(selectedBuildingId => selectedBuildingId != null),
                takeUntilDestroyed()
            )
            .subscribe(() => this.manuallyClosed.set(false))
    }

    close() {
        this.manuallyClosed.set(true)
    }
}
