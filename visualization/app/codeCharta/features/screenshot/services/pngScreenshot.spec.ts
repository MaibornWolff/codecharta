import { downloadPng } from "./pngScreenshot"

const PNG_DATA_URL = "data:image/png;base64,aGk="

describe("downloadPng", () => {
    it("should click a download link carrying the file name and remove it again", () => {
        // Arrange
        const anchor = document.createElement("a")
        const clickSpy = jest.spyOn(anchor, "click").mockImplementation(() => undefined)
        jest.spyOn(document, "createElement").mockReturnValueOnce(anchor as never)

        // Act
        downloadPng(PNG_DATA_URL, "project_domain.png")

        // Assert
        expect(anchor.download).toBe("project_domain.png")
        expect(anchor.href).toBe(PNG_DATA_URL)
        expect(clickSpy).toHaveBeenCalledTimes(1)
        expect(document.body.contains(anchor)).toBe(false)
    })
})
