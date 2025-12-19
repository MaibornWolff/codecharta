import { Injectable } from "@angular/core"
import { PreferredEditor } from "../../../codeCharta.model"
import { PreferredEditorStore } from "../stores/preferredEditor.store"

@Injectable({
    providedIn: "root"
})
export class PreferredEditorService {
    constructor(private readonly preferredEditorStore: PreferredEditorStore) {}

    preferredEditor$() {
        return this.preferredEditorStore.preferredEditor$
    }

    setPreferredEditor(value: PreferredEditor) {
        this.preferredEditorStore.setPreferredEditor(value)
    }
}
