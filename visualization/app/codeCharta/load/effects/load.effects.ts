import { UnfocusNodesEffect } from "./unfocusNodes/unfocusNodes.effect"
import { SaveCcStateEffect } from "./saveCcState/saveCcState.effect"
import { UpdateQueryParametersEffect } from "./updateQueryParameters/updateQueryParameters.effect"
import { UpdateFileSettingsEffect } from "./updateFileSettings/updateFileSettings.effect"

/**
 * The load/persistence layer's ngrx effects (Slice 15d): view-reset on file change, CcState persistence,
 * browser-URL sync (updateQueryParameters folds into load/ rather than a separate url/ module), and the
 * per-file settings merge that splits attributeTypes into the metrics/dependency lens sources at the load
 * boundary. Registered by the app composition root.
 */
export const loadEffects = [UnfocusNodesEffect, SaveCcStateEffect, UpdateQueryParametersEffect, UpdateFileSettingsEffect]
