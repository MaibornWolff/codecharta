import { Pipe, PipeTransform } from "@angular/core"

import { FileNameHelper } from "../fileNameHelper"

@Pipe({ name: "removeExtension" })
export class RemoveExtensionPipe implements PipeTransform {
    transform(fileName: string): string {
        return FileNameHelper.withoutCCExtension(fileName)
    }
}
