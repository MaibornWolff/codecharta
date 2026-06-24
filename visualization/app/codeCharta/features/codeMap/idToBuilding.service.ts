import { Injectable } from "@angular/core"
import { BehaviorSubject } from "rxjs"
import { CodeMapBuilding } from "./rendering/codeMapBuilding"

@Injectable({ providedIn: "root" })
export class IdToBuildingService {
    private idToBuilding = new Map<number, CodeMapBuilding>()
    private readonly buildingIdsSubject = new BehaviorSubject<ReadonlySet<number>>(new Set())

    readonly buildingIds$ = this.buildingIdsSubject.asObservable()

    setIdToBuilding(buildings: CodeMapBuilding[]) {
        this.idToBuilding = new Map<number, CodeMapBuilding>()
        for (const building of buildings) {
            this.idToBuilding.set(building.node.id, building)
        }
        this.buildingIdsSubject.next(new Set(this.idToBuilding.keys()))
    }

    /** id is buildings' node.id */
    get(id: number) {
        return this.idToBuilding.get(id)
    }

    has(id: number) {
        return this.idToBuilding.has(id)
    }
}
