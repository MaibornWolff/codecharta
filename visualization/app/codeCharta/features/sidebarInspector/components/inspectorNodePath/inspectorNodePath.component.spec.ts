import { render, screen } from "@testing-library/angular"
import { InspectorNodePathComponent } from "./inspectorNodePath.component"

describe("InspectorNodePathComponent", () => {
    it("should display the parent path and the node name", async () => {
        // Arrange & Act
        await render(InspectorNodePathComponent, {
            inputs: { parentPath: "/root/services/billing/", nodeName: "invoice.ts" }
        })

        // Assert
        expect(screen.getByTestId("inspector-parent-path").textContent).toBe("/root/services/billing/")
        expect(screen.getByTestId("inspector-node-name").textContent).toContain("invoice.ts")
    })

    it("should hide the parent path when it is empty", async () => {
        // Arrange & Act
        await render(InspectorNodePathComponent, { inputs: { parentPath: "", nodeName: "root" } })

        // Assert
        expect(screen.queryByTestId("inspector-parent-path")).toBe(null)
    })

    it("should render an external link when provided", async () => {
        // Arrange & Act
        await render(InspectorNodePathComponent, {
            inputs: { parentPath: "/root/", nodeName: "invoice.ts", link: "https://example.com/invoice" }
        })

        // Assert
        const link = screen.getByTestId("inspector-node-link")
        expect(link.getAttribute("href")).toBe("https://example.com/invoice")
        expect(link.getAttribute("rel")).toBe("noopener noreferrer")
    })
})
