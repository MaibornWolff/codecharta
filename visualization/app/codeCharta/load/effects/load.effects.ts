import { ReconcileAfterLoadEffect } from "./reconcileAfterLoad/reconcileAfterLoad.effect"
import { SaveCcStateEffect } from "./saveCcState/saveCcState.effect"
import { UpdateQueryParametersEffect } from "./updateQueryParameters/updateQueryParameters.effect"

/**
 * ReconcileAfterLoadEffect owns the whole post-load sequence. It replaced UnfocusNodesEffect and
 * UpdateFileSettingsEffect here, and the metric/colorRange/top-label resets in the feature bundles.
 */
export const loadEffects = [ReconcileAfterLoadEffect, SaveCcStateEffect, UpdateQueryParametersEffect]
