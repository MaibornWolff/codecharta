import { AutoFitCodeMapEffect } from "./autoFitCodeMapChange/autoFitCodeMap.effect"
import { RenderCodeMapEffect } from "./renderCodeMapEffect/renderCodeMap.effect"
import { SetLoadingIndicatorEffect } from "./setLoadingIndicator/setLoadingIndicator.effect"

/**
 * The codeMap feature's ngrx effects, registered by the app composition root via the feature facade
 * (Slice 15c). Effect registration order is behaviourally irrelevant — each effect is an independent
 * stream — so bundling per feature only changes where they are declared, not what they do.
 */
export const codeMapEffects = [RenderCodeMapEffect, AutoFitCodeMapEffect, SetLoadingIndicatorEffect]
