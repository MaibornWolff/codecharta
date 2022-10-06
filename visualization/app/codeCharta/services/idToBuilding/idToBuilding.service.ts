import { Injectable } from "@angular/core"
import { CodeMapBuilding } from "../../ui/codeMap/rendering/codeMapBuilding"

@Injectable({ providedIn: "root" })
export class IdToBuildingService {
	private idToBuilding = new Map<number, CodeMapBuilding>()

	setIdToBuilding(buildings: CodeMapBuilding[]) {
		this.idToBuilding = new Map<number, CodeMapBuilding>()
		for (const building of buildings) {
			this.idToBuilding.set(building.node.id, building)
		}
	}

	/** id is buildings' node.id */
	get(id: number) {
		return this.idToBuilding.get(id)
	}
}
