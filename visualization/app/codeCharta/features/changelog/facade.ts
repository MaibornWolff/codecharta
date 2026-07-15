import { Injectable } from "@angular/core"
import { ChangelogParserService } from "./services/changelogParser.service"
import { VersionService } from "./services/version.service"

// Dialog mounted by the CodeCharta page (views/).
export { ChangelogDialogComponent } from "./components/changelogDialog/changelogDialog.component"

@Injectable({ providedIn: "root" })
export class ChangelogFacade {
    constructor(
        private readonly versionService: VersionService,
        private readonly changelogParserService: ChangelogParserService
    ) {}

    get currentVersion() {
        return this.versionService.currentVersion
    }

    get previousVersion() {
        return this.versionService.previousVersion
    }

    get shouldShowChangelog() {
        return this.versionService.shouldShowChangelog
    }

    synchronizeVersion() {
        this.versionService.synchronizeVersion()
    }

    acknowledgeChangelog() {
        this.versionService.acknowledgeChangelog()
    }

    parseChangesBetweenVersions(previousVersion: string, currentVersion: string) {
        return this.changelogParserService.parseChangesBetweenVersions(previousVersion, currentVersion)
    }
}
