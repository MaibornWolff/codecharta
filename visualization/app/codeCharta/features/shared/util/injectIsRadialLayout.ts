import { inject, Signal } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { MapStateReadWindow } from "../../../stores/mapState/mapState.read.facade"

export function injectIsRadialLayout(): Signal<boolean> {
    return toSignal(inject(MapStateReadWindow).isRadialLayout$, { requireSync: true })
}
