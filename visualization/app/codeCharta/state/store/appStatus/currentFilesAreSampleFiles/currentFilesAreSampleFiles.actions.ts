import { createAction, props } from "@ngrx/store"

export const setCurrentFilesAreSampleFiles = createAction("CURRENT_FILES_ARE_SAMPLE_FILES", props<{ value: boolean }>())
