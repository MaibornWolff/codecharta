import { Pipe, PipeTransform } from "@angular/core"
import { getReadableColorForBackground } from "../../util/color/getReadableColorForBackground"

@Pipe({
    name: "readableColorForBackground",
    standalone: true
})
export class ReadableColorForBackgroundPipe implements PipeTransform {
    transform(hexColor: string) {
        return getReadableColorForBackground(hexColor)
    }
}
