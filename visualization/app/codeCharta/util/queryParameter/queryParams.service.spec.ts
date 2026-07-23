import { QueryParamsService } from "./queryParams.service"

describe("QueryParamsService", () => {
    let queryParamsService: QueryParamsService

    // jsdom does not allow assigning window.location; replaceState is how the url is arranged.
    const setUrl = (url: string) => {
        window.history.replaceState(null, "", url)
    }

    beforeEach(() => {
        setUrl("http://localhost/")
        queryParamsService = new QueryParamsService()
    })

    afterEach(() => {
        jest.restoreAllMocks()
        setUrl("http://localhost/")
    })

    describe("reading", () => {
        it("should return null when the parameter is absent", () => {
            // Arrange
            setUrl("http://localhost?file=valid.json")

            // Act
            const metrics = queryParamsService.getMetrics()

            // Assert
            expect(metrics.areaMetric).toBeNull()
        })

        it("should return an empty string when the parameter is present but empty", () => {
            // Arrange
            setUrl("http://localhost?file=valid.json&area=")

            // Act
            const metrics = queryParamsService.getMetrics()

            // Assert
            expect(metrics.areaMetric).toBe("")
        })

        it("should return an empty string when the parameter is a valueless key", () => {
            // Arrange
            setUrl("http://localhost?area&file=valid.json")

            // Act
            const metrics = queryParamsService.getMetrics()

            // Assert
            expect(metrics.areaMetric).toBe("")
        })

        it("should decode a plus sign in a parameter value to a space", () => {
            // Arrange
            setUrl("http://localhost?file=valid.json&area=real+lines")

            // Act
            const metrics = queryParamsService.getMetrics()

            // Assert
            expect(metrics.areaMetric).toBe("real lines")
        })

        it("should decode a percent-encoded parameter value", () => {
            // Arrange
            setUrl("http://localhost?file=valid.json&area=real%20lines")

            // Act
            const metrics = queryParamsService.getMetrics()

            // Assert
            expect(metrics.areaMetric).toBe("real lines")
        })

        it("should return all file names in order when several file parameters are given", () => {
            // Arrange
            setUrl("http://localhost?file=a.json&file=b.json")

            // Act
            const fileNames = queryParamsService.getFileNames()

            // Assert
            expect(fileNames).toEqual(["a.json", "b.json"])
        })

        it("should report no file when the first file parameter is empty", () => {
            // Arrange
            setUrl("http://localhost?file=&file=x.json")

            // Act
            const hasFile = queryParamsService.hasFile()

            // Assert
            expect(hasFile).toBe(false)
        })

        it("should report a file when the first file parameter has a value", () => {
            // Arrange
            setUrl("http://localhost?file=x.json")

            // Act
            const hasFile = queryParamsService.hasFile()

            // Assert
            expect(hasFile).toBe(true)
        })

        it("should return an empty list when no file parameter is given", () => {
            // Arrange
            setUrl("http://localhost")

            // Act
            const fileNames = queryParamsService.getFileNames()

            // Assert
            expect(fileNames).toEqual([])
        })

        it("should return the render mode unchanged", () => {
            // Arrange
            setUrl("http://localhost?file=x.json&mode=Delta")

            // Act
            const renderMode = queryParamsService.getRenderMode()

            // Assert
            expect(renderMode).toBe("Delta")
        })

        it("should flag sample files only for the exact value true", () => {
            // Arrange
            setUrl("http://localhost?file=x.json&currentFilesAreSampleFiles=TRUE")

            // Act
            const areSampleFilesFlagged = queryParamsService.areSampleFilesFlagged()

            // Assert
            expect(areSampleFilesFlagged).toBe(false)
        })

        it("should flag sample files when the parameter is true", () => {
            // Arrange
            setUrl("http://localhost?file=x.json&currentFilesAreSampleFiles=true")

            // Act
            const areSampleFilesFlagged = queryParamsService.areSampleFilesFlagged()

            // Assert
            expect(areSampleFilesFlagged).toBe(true)
        })
    })

    describe("writing", () => {
        // The spy is armed after the url has been arranged, so only the write itself is counted.
        const armReplaceStateSpy = () => jest.spyOn(window.history, "replaceState")

        it("should not touch the url when no file parameter is present", () => {
            // Arrange
            setUrl("http://localhost/")
            const replaceStateSpy = armReplaceStateSpy()

            // Act
            queryParamsService.write({
                areaMetric: "rloc",
                heightMetric: "mcc",
                colorMetric: "functions",
                edgeMetric: null,
                isEdgeMetricDefined: false,
                currentFilesAreSampleFiles: false
            })

            // Assert
            expect(replaceStateSpy).not.toHaveBeenCalled()
        })

        it("should write area, height and color when a file parameter is present", () => {
            // Arrange
            setUrl("http://localhost?file=x.json")
            const replaceStateSpy = armReplaceStateSpy()

            // Act
            queryParamsService.write({
                areaMetric: "rloc",
                heightMetric: "mcc",
                colorMetric: "functions",
                edgeMetric: null,
                isEdgeMetricDefined: false,
                currentFilesAreSampleFiles: false
            })

            // Assert
            expect(replaceStateSpy).toHaveBeenCalledWith(null, "", "http://localhost/?file=x.json&area=rloc&height=mcc&color=functions")
        })

        it("should delete the edge parameter when no edge metric data exists", () => {
            // Arrange
            setUrl("http://localhost?file=x.json&edge=pairingRate")
            const replaceStateSpy = armReplaceStateSpy()

            // Act
            queryParamsService.write({
                areaMetric: "rloc",
                heightMetric: "mcc",
                colorMetric: "functions",
                edgeMetric: "pairingRate",
                isEdgeMetricDefined: false,
                currentFilesAreSampleFiles: false
            })

            // Assert
            expect(replaceStateSpy).toHaveBeenCalledWith(null, "", "http://localhost/?file=x.json&area=rloc&height=mcc&color=functions")
        })

        it("should delete the sample files parameter when the files are not sample files", () => {
            // Arrange
            setUrl("http://localhost?file=x.json&currentFilesAreSampleFiles=true")
            const replaceStateSpy = armReplaceStateSpy()

            // Act
            queryParamsService.write({
                areaMetric: "rloc",
                heightMetric: "mcc",
                colorMetric: "functions",
                edgeMetric: null,
                isEdgeMetricDefined: false,
                currentFilesAreSampleFiles: false
            })

            // Assert
            expect(replaceStateSpy).toHaveBeenCalledWith(null, "", "http://localhost/?file=x.json&area=rloc&height=mcc&color=functions")
        })

        it("should call replaceState exactly once per write", () => {
            // Arrange
            setUrl("http://localhost?file=x.json")
            const replaceStateSpy = armReplaceStateSpy()

            // Act
            queryParamsService.write({
                areaMetric: "rloc",
                heightMetric: "mcc",
                colorMetric: "functions",
                edgeMetric: "pairingRate",
                isEdgeMetricDefined: true,
                currentFilesAreSampleFiles: true
            })

            // Assert
            expect(replaceStateSpy).toHaveBeenCalledTimes(1)
        })
    })

    describe("coexisting with the router", () => {
        const switchViewTo = (routePath: string) => {
            window.history.pushState(null, "", `#${routePath}`)
        }

        const writeAllMetrics = () => {
            queryParamsService.write({
                areaMetric: "rloc",
                heightMetric: "mcc",
                colorMetric: "functions",
                edgeMetric: "pairingRate",
                isEdgeMetricDefined: true,
                currentFilesAreSampleFiles: true
            })
        }

        it("should keep the written metric parameters when the view is switched to the domain view", () => {
            // Arrange
            setUrl("http://localhost/?file=x.json#/")
            writeAllMetrics()

            // Act
            switchViewTo("/domain")

            // Assert
            expect(window.location.search).toBe(
                "?file=x.json&area=rloc&height=mcc&color=functions&edge=pairingRate&currentFilesAreSampleFiles=true"
            )
        })

        it("should keep the fragment untouched when metrics are written", () => {
            // Arrange
            setUrl("http://localhost/?file=x.json#/domain")

            // Act
            writeAllMetrics()

            // Assert
            expect(window.location.hash).toBe("#/domain")
        })
    })
})
