import { firstValueFrom } from "rxjs"
import { clearLoadPhase, describeFileBeingRead, loadPhase$, setLoadPhase } from "./loadPhase"

describe("loadPhase", () => {
    afterEach(() => {
        clearLoadPhase()
    })

    it("should report nothing while nothing is loading", async () => {
        // Arrange & Act
        clearLoadPhase()

        // Assert
        expect(await firstValueFrom(loadPhase$)).toBeNull()
    })

    it("should report what the loader is busy with", async () => {
        // Act
        setLoadPhase("Building the map")

        // Assert
        expect(await firstValueFrom(loadPhase$)).toBe("Building the map")
    })

    it("should name the file being read", () => {
        // Act & Assert
        expect(describeFileBeingRead("project.cc.json", 1, 1)).toBe("Reading project.cc.json")
    })

    it("should count the files off while several are read, so the wait has an end in sight", () => {
        // Act & Assert
        expect(describeFileBeingRead("second.cc.json", 2, 3)).toBe("Reading second.cc.json (2 of 3)")
    })
})
