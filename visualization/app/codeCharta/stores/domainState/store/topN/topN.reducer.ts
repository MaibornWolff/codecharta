import { createReducer, on } from "@ngrx/store"
import { defaultWordCloudSettings, WordCloudSettings } from "../../../../model/wordCloud.model"
import { setState } from "../../../../util/setState.reducer.factory"
import { setDomainStateTopN } from "./topN.actions"

export const defaultTopN: WordCloudSettings["topN"] = defaultWordCloudSettings.topN
export const topN = createReducer(defaultTopN, on(setDomainStateTopN, setState(defaultTopN)))
