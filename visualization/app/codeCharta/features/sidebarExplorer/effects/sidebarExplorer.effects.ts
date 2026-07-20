import { BlacklistSearchPatternEffect } from "./blacklistSearchPattern/blacklistSearchPattern.effect"
import { RevealSelectedNodeAfterLoadEffect } from "./revealSelectedNodeAfterLoad/revealSelectedNodeAfterLoad.effect"

/** The sidebarExplorer feature's ngrx effects, registered by the app composition root (Slice 15c). */
export const sidebarExplorerEffects = [BlacklistSearchPatternEffect, RevealSelectedNodeAfterLoadEffect]
