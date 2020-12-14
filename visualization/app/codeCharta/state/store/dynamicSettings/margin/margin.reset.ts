import { CodeMapNode } from "../../../../codeCharta.model"

const PRESET_MARGIN = 50

export function getResetMargin(dynamicMargin: boolean, map?: CodeMapNode) {
	if (dynamicMargin && map) {
		return PRESET_MARGIN
	}
	return 0
}
