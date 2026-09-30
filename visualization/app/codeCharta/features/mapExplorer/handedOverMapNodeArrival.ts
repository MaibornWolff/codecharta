import { InjectionToken } from "@angular/core"

/** What a view prepares before it selects and reveals a node another view handed over to it. */
export interface HandedOverMapNodeArrival {
    receive(nodePath: string): void
}

export const HANDED_OVER_MAP_NODE_ARRIVAL = new InjectionToken<HandedOverMapNodeArrival>("HANDED_OVER_MAP_NODE_ARRIVAL")
