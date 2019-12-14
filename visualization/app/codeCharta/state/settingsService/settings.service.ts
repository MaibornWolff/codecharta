import { RecursivePartial, Settings } from "../../codeCharta.model"

export class SettingsService {
	constructor() {
		// unused
	}

	public updateSettings(update: RecursivePartial<Settings>, isSilent: boolean = false) {}

	public getDefaultSettings(): Settings {
		return {} as Settings
	}
}
