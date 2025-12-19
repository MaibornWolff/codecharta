import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, PreferredEditor } from "../../../codeCharta.model"
import { preferredEditorSelector } from "../selectors/editorSettings.selectors"
import { setPreferredEditor } from "../../../state/store/appSettings/preferredEditor/preferredEditor.actions"

@Injectable({
    providedIn: "root"
})
export class PreferredEditorStore {
    constructor(private readonly store: Store<CcState>) {}

    preferredEditor$ = this.store.select(preferredEditorSelector)

    setPreferredEditor(value: PreferredEditor) {
        this.store.dispatch(setPreferredEditor({ value }))
    }
}
