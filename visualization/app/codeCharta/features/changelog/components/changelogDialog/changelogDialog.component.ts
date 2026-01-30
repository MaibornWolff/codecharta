import { Component, computed, effect, ElementRef, viewChild } from "@angular/core"
import { NgClass } from "@angular/common"
import { ChangelogFacade } from "../../facade"
import { ChangelogCategory } from "../../services/changelogParser.service"

const CATEGORY_CONFIG: Record<string, { emoji: string; label: string; type: string }> = {
    "Added 🚀": { emoji: "🚀", label: "Added", type: "added" },
    "Fixed 🐞": { emoji: "🐞", label: "Fixed", type: "fixed" },
    Changed: { emoji: "✨", label: "Changed", type: "changed" },
    "Removed 🗑": { emoji: "🗑", label: "Removed", type: "removed" },
    "Chore 👨‍💻 👩‍💻": { emoji: "🔧", label: "Maintenance", type: "chore" }
}

const CATEGORY_STYLES: Record<string, { header: string; icon: string; count: string }> = {
    added: {
        header: "bg-success/5",
        icon: "bg-success/10",
        count: "bg-success/10 text-success"
    },
    fixed: {
        header: "bg-info/5",
        icon: "bg-info/10",
        count: "bg-info/10 text-info"
    },
    changed: {
        header: "bg-warning/5",
        icon: "bg-warning/10",
        count: "bg-warning/10 text-warning"
    },
    removed: {
        header: "bg-error/5",
        icon: "bg-error/10",
        count: "bg-error/10 text-error"
    },
    chore: {
        header: "bg-neutral/5",
        icon: "bg-neutral/10",
        count: "bg-neutral/10 text-neutral"
    }
}

@Component({
    selector: "cc-changelog-dialog",
    templateUrl: "./changelogDialog.component.html",
    imports: [NgClass]
})
export class ChangelogDialogComponent {
    dialogElement = viewChild.required<ElementRef<HTMLDialogElement>>("dialog")

    previousVersion = this.changelogFacade.previousVersion
    currentVersion = this.changelogFacade.currentVersion
    shouldShowChangelog = this.changelogFacade.shouldShowChangelog

    changes = computed<ChangelogCategory[]>(() => {
        const prev = this.previousVersion()
        if (!prev) {
            return []
        }
        return this.changelogFacade.parseChangesBetweenVersions(prev, this.currentVersion)
    })

    constructor(private readonly changelogFacade: ChangelogFacade) {
        effect(() => {
            if (this.shouldShowChangelog()) {
                this.open()
            }
        })
    }

    open() {
        this.dialogElement().nativeElement.showModal()
    }

    close() {
        this.changelogFacade.acknowledgeChangelog()
        this.dialogElement().nativeElement.close()
    }

    getCategoryEmoji(title: string): string {
        return CATEGORY_CONFIG[title]?.emoji ?? "📝"
    }

    getCategoryLabel(title: string): string {
        return CATEGORY_CONFIG[title]?.label ?? title
    }

    getCategoryType(title: string): string {
        return CATEGORY_CONFIG[title]?.type ?? "default"
    }

    getCategoryHeaderClass(title: string): string {
        const type = this.getCategoryType(title)
        return CATEGORY_STYLES[type]?.header ?? "bg-base-200"
    }

    getCategoryIconClass(title: string): string {
        const type = this.getCategoryType(title)
        return CATEGORY_STYLES[type]?.icon ?? "bg-base-300"
    }

    getCategoryCountClass(title: string): string {
        const type = this.getCategoryType(title)
        return CATEGORY_STYLES[type]?.count ?? "bg-base-300 text-base-content"
    }

    getChangeCount(changesHtml: string): number {
        return (changesHtml.match(/<li>/gi) || []).length
    }
}
