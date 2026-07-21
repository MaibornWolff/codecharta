import { createReducer, on } from "@ngrx/store"
import { defaultWordCloudSettings, WordCloudSettings } from "../../../../model/wordCloud.model"
import { setState } from "../../../../util/setState.reducer.factory"
import { setDomainStateShrinkToFit } from "./shrinkToFit.actions"

export const defaultShrinkToFit: WordCloudSettings["shrinkToFit"] = defaultWordCloudSettings.shrinkToFit
export const shrinkToFit = createReducer(defaultShrinkToFit, on(setDomainStateShrinkToFit, setState(defaultShrinkToFit)))
