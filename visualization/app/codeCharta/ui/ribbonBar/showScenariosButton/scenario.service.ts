import { Injectable } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { ColorRange, MapColors, CcState } from "../../../codeCharta.model"
import { metricDataSelector } from "../../../state/selectors/accumulatedData/metricData/metricData.selector"
import { setMapColors } from "../../../state/store/appSettings/mapColors/mapColors.actions"
import { setColorRange } from "../../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { ScenarioHelper } from "./scenarioHelper"
import { ThreeCameraService } from "../../codeMap/threeViewer/threeCamera.service"
import { ThreeOrbitControlsService } from "../../codeMap/threeViewer/threeOrbitControls.service"
import { ErrorDialogComponent } from "../../dialogs/errorDialog/errorDialog.component"
import { Store, State } from "@ngrx/store"
import { setState } from "../../../state/store/state.actions"

@Injectable()
export class ScenarioService {
	constructor(
		private state: State<CcState>,
		private store: Store<CcState>,
		private dialog: MatDialog,
		private threeCameraService: ThreeCameraService,
		private threeOrbitControlsService: ThreeOrbitControlsService
	) {}

	getScenarios() {
		return ScenarioHelper.getScenarioItems(metricDataSelector(this.state.getValue()))
	}

	applyScenario(name: string) {
		const scenario = ScenarioHelper.scenarios.get(name)
		const scenarioSettings = ScenarioHelper.getScenarioSettings(scenario)
		this.store.dispatch(setState({ value: scenarioSettings }))
		this.store.dispatch(setColorRange({ value: scenarioSettings.dynamicSettings.colorRange as ColorRange }))
		this.store.dispatch(setMapColors({ value: scenarioSettings.appSettings.mapColors as MapColors }))

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
