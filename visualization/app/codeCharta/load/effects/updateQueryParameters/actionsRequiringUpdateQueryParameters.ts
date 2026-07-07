import { setAreaMetric, setColorMetric, setEdgeMetric, setHeightMetric } from "../../../stores/mapState/mapState.write.facade"
import { setCurrentFilesAreSampleFiles } from "../../../stores/fileStore/fileStore.facade"

export const actionsRequiringUpdateQueryParameters = [
    setEdgeMetric,
    setHeightMetric,
    setColorMetric,
    setAreaMetric,
    setCurrentFilesAreSampleFiles
]
