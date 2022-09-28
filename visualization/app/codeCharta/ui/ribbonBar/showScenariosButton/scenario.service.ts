import { Inject, Injectable } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { ColorRange, MapColors } from "../../../codeCharta.model"
import { ThreeCameraServiceToken, ThreeOrbitControlsServiceToken } from "../../../services/ajs-upgraded-providers"
import { State } from "../../../state/angular-redux/state"
import { Store } from "../../../state/angular-redux/store"
import { metricDataSelector } from "../../../state/selectors/accumulatedData/metricData/metricData.selector"
import { setMapColors } from "../../../state/store/appSettings/mapColors/mapColors.actions"
import { setColorRange } from "../../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { setState } from "../../../state/store/state.actions"
import { ScenarioHelper } from "./scenarioHelper"
import { ThreeCameraService } from "../../codeMap/threeViewer/threeCamera.service"
import { ThreeOrbitControlsService } from "../../codeMap/threeViewer/threeOrbitControlsService"
import { ErrorDialogComponent } from "../../dialogs/errorDialog/errorDialog.component"

@Injectable()
export class ScenarioService {
	constructor(
		@Inject(State) private state: State,
		@Inject(Store) private store: Store,
		@Inject(MatDialog) private dialog: MatDialog,
		@Inject(ThreeCameraServiceToken) private threeCameraService: ThreeCameraService,
		@Inject(ThreeOrbitControlsServiceToken) private threeOrbitControlsService: ThreeOrbitControlsService
	) {}

	getScenarios() {
		return ScenarioHelper.getScenarioItems(metricDataSelector(this.state.getValue()))
	}

	applyScenario(name: string) {
		const scenario = ScenarioHelper.scenarios.get(name)
		const scenarioSettings = ScenarioHelper.getScenarioSettings(scenario)
		this.store.dispatch(setState(scenarioSettings))
		this.store.dispatch(setColorRange(scenarioSettings.dynamicSettings.colorRange as ColorRange))
		this.store.dispatch(setMapColors(scenarioSettings.appSettings.mapColors as MapColors))

		if (scenario.camera) {
			// @ts-ignore -- we know that it is not a partial when it is set
			this.threeCameraService.setPosition(scenario.camera.camera)
			// @ts-ignore -- we know that it is not a partial when it is set
			this.threeOrbitControlsService.setControlTarget(scenario.camera.cameraTarget)
		}
	}

	removeScenario(name) {
		if (name !== "Complexity") {
			ScenarioHelper.deleteScenario(name)
			this.dialog.open(ErrorDialogComponent, {
				data: {
					title: "Info",
					message: `${name} deleted.`
				}
			})
		} else {
			this.dialog.open(ErrorDialogComponent, {
				data: {
					title: "Error",
					message: `${name} cannot be deleted as it is the default Scenario.`
				}
			})
		}
	}
}
