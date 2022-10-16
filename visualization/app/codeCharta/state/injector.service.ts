//@ts-nocheck

import { FilesService } from "./store/files/files.service"
import { IsLoadingFileService } from "./store/appSettings/isLoadingFile/isLoadingFile.service"
import { MapSizeService } from "./store/treeMap/mapSize/mapSize.service"
import { ScalingService } from "./store/appSettings/scaling/scaling.service"
import { MarkedPackagesService } from "./store/fileSettings/markedPackages/markedPackages.service"
import { EdgesService } from "./store/fileSettings/edges/edges.service"
import { BlacklistService } from "./store/fileSettings/blacklist/blacklist.service"
import { SharpnessModeService } from "./store/appSettings/sharpnessMode/sharpnessMode.service"
export class InjectorService {
	constructor(
		// We have to inject the services somewhere
		private isLoadingFileService: IsLoadingFileService,
		private filesService: FilesService,
		private mapSizeService: MapSizeService,
		private scalingService: ScalingService,
		private markedPackagesService: MarkedPackagesService,
		private edgesService: EdgesService,
		private blacklistService: BlacklistService,
		private sharpnessModeService: SharpnessModeService,
	) {
		"ngInject"
	}
}
