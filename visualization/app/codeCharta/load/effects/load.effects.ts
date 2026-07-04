import { UnfocusNodesEffect } from "./unfocusNodes/unfocusNodes.effect"
import { SaveCcStateEffect } from "./saveCcState/saveCcState.effect"
import { UpdateQueryParametersEffect } from "./updateQueryParameters/updateQueryParameters.effect"

/**
 * The load/persistence layer's ngrx effects (Slice 15d): view-reset on file change, CcState persistence,
 * and browser-URL sync (updateQueryParameters folds into load/ rather than a separate url/ module).
 * Registered by the app composition root. updateFileSettings joins this bundle in 15d-3.
 */
export const loadEffects = [UnfocusNodesEffect, SaveCcStateEffect, UpdateQueryParametersEffect]
