import { handLinkToTheSystem } from "./handLinkToTheSystem"

describe("handLinkToTheSystem", () => {
    it("should click a link, which unlike a new window leaves no empty tab behind", () => {
        // Arrange
        const clicked: string[] = []
        const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
            clicked.push(this.href)
        })
        const openSpy = jest.spyOn(window, "open")

        // Act
        handLinkToTheSystem("vscode://file/C:/dev/Foo.kt")

        // Assert
        expect(clicked).toEqual(["vscode://file/C:/dev/Foo.kt"])
        expect(openSpy).not.toHaveBeenCalled()
        clickSpy.mockRestore()
        openSpy.mockRestore()
    })
})
