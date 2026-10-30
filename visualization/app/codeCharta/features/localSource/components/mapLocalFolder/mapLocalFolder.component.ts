import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from "@angular/core"
import { LocalFolderDescription, LocalSourceService } from "../../services/localSource.service"

@Component({
    selector: "cc-map-local-folder",
    templateUrl: "./mapLocalFolder.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapLocalFolderComponent {
    private readonly localSource = inject(LocalSourceService)

    readonly mapFileName = input.required<string>()

    readonly isAvailable = this.localSource.isAvailable
    readonly folder = signal<LocalFolderDescription | null>(null)

    constructor() {
        effect(() => {
            this.localSource.folderChanges()
            if (this.isAvailable()) {
                void this.describeFolder(this.mapFileName())
            }
        })
    }

    private async describeFolder(mapFileName: string) {
        const description = await this.localSource.describeFolder(mapFileName)
        if (mapFileName === this.mapFileName()) {
            this.folder.set(description)
        }
    }
}
