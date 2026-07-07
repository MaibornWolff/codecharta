import { setAreaMetric, setColorMetric, setEdgeMetric, setHeightMetric } from "../../../stores/mapState/mapState.write.facade"
import { setCurrentFilesAreSampleFiles } from "../../../stores/fileStore/store/currentFilesAreSampleFiles/currentFilesAreSampleFiles.actions"

export const actionsRequiringUpdateQueryParameters = [
    setEdgeMetric,
    setHeightMetric,
    setColorMetric,
    setAreaMetric,
    setCurrentFilesAreSampleFiles
]
