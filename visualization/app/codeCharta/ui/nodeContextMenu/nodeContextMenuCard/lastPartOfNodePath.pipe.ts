import { Pipe, PipeTransform } from "@angular/core"

@Pipe({
    name: "lastPartOfNodePath",
    standalone: true
})
export class LastPartOfNodePathPipe implements PipeTransform {
    transform(path: string) {
        return `${path.lastIndexOf("/") === 0 ? "" : "..."}${path.slice(path.lastIndexOf("/"))}`
    }
}
