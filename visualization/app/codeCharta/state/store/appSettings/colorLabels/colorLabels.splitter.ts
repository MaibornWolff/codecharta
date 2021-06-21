import { ColorLabelsAction, setColorLabels } from "./colorLabels.actions"
import { colorLabelOptions } from "../../../../codeCharta.model"

export function splitColorLabelsAction(payload: colorLabelOptions): ColorLabelsAction {
	return setColorLabels(payload)
}
