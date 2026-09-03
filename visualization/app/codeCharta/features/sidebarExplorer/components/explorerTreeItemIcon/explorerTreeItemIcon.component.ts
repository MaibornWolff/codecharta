import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"

@Component({
    selector: "cc-explorer-tree-item-icon",
    templateUrl: "./explorerTreeItemIcon.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplorerTreeItemIconComponent {
    private static readonly DEFAULT_FOLDER_COLOR = "#000000"
    private static readonly INACTIVE_ROW_COLOR = "#BDBDBD"

    readonly isFolder = input.required<boolean>()
    readonly isOpen = input.required<boolean>()
    readonly isInactive = input<boolean>(false)
    readonly markingColor = input<string | null>(null)

    readonly iconClass = computed(() => {
        if (!this.isFolder()) {
            return "fa fa-file-o"
        }
        return this.isOpen() ? "fa fa-folder-open" : "fa fa-folder"
    })

    readonly iconColor = computed((): string | undefined => {
        if (this.isInactive()) {
            return ExplorerTreeItemIconComponent.INACTIVE_ROW_COLOR
        }
        if (!this.isFolder()) {
            return undefined
        }
        return this.markingColor() ?? ExplorerTreeItemIconComponent.DEFAULT_FOLDER_COLOR
    })
}
