import { Pipe, PipeTransform } from "@angular/core"

@Pipe({
    name: "truncateText",
    standalone: true
})
export class TruncateTextPipe implements PipeTransform {
    transform(textToTruncate: string, limit, replacerString = "...") {
        return textToTruncate.length > limit ? textToTruncate.slice(0, limit) + replacerString : textToTruncate
    }
}
