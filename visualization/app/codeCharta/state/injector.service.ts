import { BlacklistService } from "./store/fileSettings/blacklist/blacklist.service"

export class InjectorService {
	/* @ngInject */
	constructor(
		// tslint:disable-next-line
		private blacklistService: BlacklistService // We have to inject it somewhere
	) {}
}
