//@ts-nocheck

import { FilesService } from "./store/files/files.service"
import { MapSizeService } from "./store/treeMap/mapSize/mapSize.service"
import { MarkedPackagesService } from "./store/fileSettings/markedPackages/markedPackages.service"
import { EdgesService } from "./store/fileSettings/edges/edges.service"
import { BlacklistService } from "./store/fileSettings/blacklist/blacklist.service"
export class InjectorService {
	constructor(
		// We have to inject the services somewhere
		private filesService: FilesService,
		private mapSizeService: MapSizeService,
		private markedPackagesService: MarkedPackagesService,
		private edgesService: EdgesService,
		private blacklistService: BlacklistService
	) {
		"ngInject"
	}
}
