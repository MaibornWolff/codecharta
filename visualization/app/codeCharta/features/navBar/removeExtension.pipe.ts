import { Pipe, PipeTransform } from "@angular/core"

import { FileNameHelper } from "../../util/fileNameHelper"

@Pipe({
    name: "removeExtension",
    standalone: true
})
export class RemoveExtensionPipe implements PipeTransform {
    transform(fileName: string): string {
        return FileNameHelper.withoutCCExtension(fileName)
    }
}
