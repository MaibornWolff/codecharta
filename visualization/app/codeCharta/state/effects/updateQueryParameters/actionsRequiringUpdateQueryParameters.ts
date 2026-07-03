import { setAreaMetric, setColorMetric, setEdgeMetric, setHeightMetric } from "../../../mapState/mapState.write.facade"
import { setCurrentFilesAreSampleFiles } from "../../../fileStore/store/currentFilesAreSampleFiles/currentFilesAreSampleFiles.actions"

export const actionsRequiringUpdateQueryParameters = [
    setEdgeMetric,
    setHeightMetric,
    setColorMetric,
    setAreaMetric,
    setCurrentFilesAreSampleFiles
]
