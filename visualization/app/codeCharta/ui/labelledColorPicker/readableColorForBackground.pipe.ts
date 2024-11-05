import { Pipe } from "@angular/core"
import { getReadableColorForBackground } from "../../util/color/getReadableColorForBackground"

@Pipe({
    name: "readableColorForBackground",
    standalone: true
})
export class ReadableColorForBackgroundPipe {
    transform(hexColor: string) {
        return getReadableColorForBackground(hexColor)
    }
}
