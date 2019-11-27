// Plop: Append service import here
import { BlacklistService } from "./store/fileSettings/blacklist/blacklist.service"

export class InjectorService {
	/* @ngInject */
	constructor(
		// tslint:disable:no-unused-variable
		// We have to inject the services somewhere
		// Plop: Append service injection here
		private blacklistService: BlacklistService
	) {}
}
