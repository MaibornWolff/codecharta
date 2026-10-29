import { ToastService } from "../../shared/facade"
import { FolderChoice } from "./localSource.service"

export const FOLDER_DOES_NOT_FIT_MAP_MESSAGE = "The chosen folder contains none of the map's files"

export function reportFolderChoice(toast: ToastService, choice: FolderChoice) {
    if (choice.status === "chosen") {
        toast.show(`Local folder "${choice.folder.directory.name}" set for this map`, "success")
    } else if (choice.status === "doesNotFitMap") {
        toast.show(FOLDER_DOES_NOT_FIT_MAP_MESSAGE, "warning")
    }
}
