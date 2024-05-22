import { Preview3DPrintMesh } from "./preview3DPrintMesh"

jest.mock("three", () => {
    const originalModule = jest.requireActual("three")

    // Mock FontLoader class
    originalModule.FontLoader = jest.fn().mockImplementation(() => {
        return {
            load: jest.fn((url, onLoad) => {
                const mockFont = {} // Replace this with a mock font object if needed
                onLoad(mockFont)
            })
        }
    })
    return originalModule
})

jest.mock("three/examples/jsm/loaders/SVGLoader", () => {
    return jest.fn().mockImplementation(() => {
        return {
            load: jest.fn((url, onLoad) => {
                const mockData = {
                    paths: [] // Replace this with mock data if needed
                }
                onLoad(mockData)
            })
        }
    })
})

describe("Preview3DPrintMesh", () => {
    let preview3DPrintMesh: Preview3DPrintMesh

    beforeEach(() => {
        preview3DPrintMesh = new Preview3DPrintMesh()
    })

    it("should load font without error", async () => {
        await expect(preview3DPrintMesh["loadFont"]()).resolves.not.toThrow()
    })
})
