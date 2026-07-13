import { SaveCcStateEffect } from "./saveCcState/saveCcState.effect"
import { UnfocusNodesEffect } from "./unfocusNodes/unfocusNodes.effect"
import { UpdateFileSettingsEffect } from "./updateFileSettings/updateFileSettings.effect"
import { UpdateQueryParametersEffect } from "./updateQueryParameters/updateQueryParameters.effect"

export const loadEffects = [UnfocusNodesEffect, SaveCcStateEffect, UpdateQueryParametersEffect, UpdateFileSettingsEffect]
