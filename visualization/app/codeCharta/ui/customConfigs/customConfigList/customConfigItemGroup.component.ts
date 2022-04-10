import { Component, Inject, Input } from "@angular/core"
import { CustomConfigHelper } from "../../../util/customConfigHelper"
import { CustomConfigItemGroup } from "../customConfigs.component"
import { Store } from "../../../state/angular-redux/store"
import { setState } from "../../../state/store/state.actions"
import { setColorRange } from "../../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { ColorRange } from "../../../codeCharta.model"
import { setMargin } from "../../../state/store/dynamicSettings/margin/margin.actions"
import { setCamera } from "../../../state/store/appSettings/camera/camera.actions"
import { setCameraTarget } from "../../../state/store/appSettings/cameraTarget/cameraTarget.actions"
import { Vector3 } from "three"

@Component({
	selector: "cc-custom-config-item-group",
	template: require("./customConfigItemGroup.component.html")
})
export class CustomConfigItemGroupComponent {
	@Input() customConfigItemGroups: Map<string, CustomConfigItemGroup>
	@Input() isApplicable: boolean
	isCollapsed = false

	constructor(@Inject(Store) private store: Store) {}

	applyCustomConfig(configId: string) {
		const customConfig = CustomConfigHelper.getCustomConfigSettings(configId)

		this.store.dispatch(setState(customConfig.stateSettings))
		this.store.dispatch(setColorRange(customConfig.stateSettings.dynamicSettings.colorRange as ColorRange))
		this.store.dispatch(setMargin(customConfig.stateSettings.dynamicSettings.margin))

		//Now camera position is not set yet
		this.store.dispatch(setCamera(customConfig.stateSettings.appSettings.camera as Vector3))
		this.store.dispatch(setCameraTarget(customConfig.stateSettings.appSettings.cameraTarget as Vector3))

		//CustomConfigHelper.applyCustomConfig(configId, this.store, this.threeCameraService, this.threeOrbitControlsService)
	}

	removeCustomConfig(configId: string) {
		CustomConfigHelper.deleteCustomConfig(configId)
	}
}
