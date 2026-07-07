import { createAction, props } from "@ngrx/store"
import { MarkedPackage } from "../../../../model/codeCharta.model"

export const setMarkedPackages = createAction("SET_MARKED_PACKAGES", props<{ value: MarkedPackage[] }>())
export const markPackages = createAction("MARK_PACKAGES", props<{ packages: MarkedPackage[] }>())
export const unmarkPackage = createAction("UNMARK_PACKAGE", props<{ path: string }>())
