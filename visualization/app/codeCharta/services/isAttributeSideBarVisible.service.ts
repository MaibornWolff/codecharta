import { ThreeSceneService } from "../ui/codeMap/threeViewer/threeSceneService"
import { Inject, Injectable } from "@angular/core"

@Injectable({ providedIn: "root" })
export class IsAttributeSideBarVisibleService {
	isOpen = false

	constructor(@Inject(ThreeSceneService) private threeSceneService: ThreeSceneService) {
		this.threeSceneService.subscribe("onBuildingSelected", () => {
			this.isOpen = true
		})
		this.threeSceneService.subscribe("onBuildingDeselected", () => {
			this.isOpen = false
		})
	}
}
