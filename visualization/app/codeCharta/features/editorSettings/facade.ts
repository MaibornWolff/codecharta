import { Injectable } from "@angular/core"
import { PreferredEditor } from "../../codeCharta.model"
import { PreferredEditorService } from "./services/preferredEditor.service"
import { LocalFolderPathService } from "./services/localFolderPath.service"

@Injectable({
    providedIn: "root"
})
export class EditorSettingsFacade {
    constructor(
        private readonly preferredEditorService: PreferredEditorService,
        private readonly localFolderPathService: LocalFolderPathService
    ) {}

    preferredEditor$() {
        return this.preferredEditorService.preferredEditor$()
    }

    localFolderPath$() {
        return this.localFolderPathService.localFolderPath$()
    }

    setPreferredEditor(value: PreferredEditor) {
        this.preferredEditorService.setPreferredEditor(value)
    }

    setLocalFolderPath(value: string) {
        this.localFolderPathService.setLocalFolderPath(value)
    }
}
