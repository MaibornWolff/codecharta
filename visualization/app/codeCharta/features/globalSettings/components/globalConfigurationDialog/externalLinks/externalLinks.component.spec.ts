import { ComponentFixture, TestBed } from "@angular/core/testing"
import { screen, render } from "@testing-library/angular"
import { ExternalLinksComponent } from "./externalLinks.component"

describe("ExternalLinksComponent", () => {
    let fixture: ComponentFixture<ExternalLinksComponent>
    let component: ExternalLinksComponent

    async function renderComponent() {
        return render(ExternalLinksComponent)
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ExternalLinksComponent]
        })

        fixture = TestBed.createComponent(ExternalLinksComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    describe("rendering", () => {
        it("should render exactly 3 external links", () => {
            // Arrange & Act
            const links = screen.getAllByRole("link")

            // Assert
            expect(links).toHaveLength(3)
        })

        it("should render Website link", () => {
            // Arrange & Act
            const websiteLink = screen.getByRole("link", { name: /website/i })

            // Assert
            expect(websiteLink).toBeTruthy()
            expect(websiteLink.textContent).toContain("Website")
        })

        it("should render Documentation link", () => {
            // Arrange & Act
            const documentationLink = screen.getByRole("link", { name: /documentation/i })

            // Assert
            expect(documentationLink).toBeTruthy()
            expect(documentationLink.textContent).toContain("Documentation")
        })

        it("should render Github link", () => {
            // Arrange & Act
            const githubLink = screen.getByRole("link", { name: /github/i })

            // Assert
            expect(githubLink).toBeTruthy()
            expect(githubLink.textContent).toContain("Github")
        })
    })

    describe("link attributes", () => {
        it("should have correct href for Website link", () => {
            // Arrange & Act
            const websiteLink = screen.getByRole("link", { name: /website/i }) as HTMLAnchorElement

            // Assert
            expect(websiteLink.href).toBe("https://codecharta.com/")
        })

        it("should have correct href for Documentation link", () => {
            // Arrange & Act
            const documentationLink = screen.getByRole("link", { name: /documentation/i }) as HTMLAnchorElement

            // Assert
            expect(documentationLink.href).toBe("https://codecharta.com/docs/overview/introduction")
        })

        it("should have correct href for Github link", () => {
            // Arrange & Act
            const githubLink = screen.getByRole("link", { name: /github/i }) as HTMLAnchorElement

            // Assert
            expect(githubLink.href).toBe("https://github.com/MaibornWolff/codecharta/")
        })
    })

    describe("security attributes", () => {
        it("should open all links in new tab with target blank", () => {
            // Arrange & Act
            const links = screen.getAllByRole("link")

            // Assert
            for (const link of links) {
                expect(link.getAttribute("target")).toBe("_blank")
            }
        })

        it("should have noopener noreferrer for security", () => {
            // Arrange & Act
            const links = screen.getAllByRole("link")

            // Assert
            for (const link of links) {
                expect(link.getAttribute("rel")).toBe("noopener noreferrer")
            }
        })
    })

    describe("styling and icons", () => {
        it("should display external link icons for all links", () => {
            // Arrange & Act
            const externalLinkIcons = document.querySelectorAll(".fa-external-link")

            // Assert
            expect(externalLinkIcons.length).toBe(3)
        })

        it("should apply DaisyUI link classes to all links", () => {
            // Arrange & Act
            const links = screen.getAllByRole("link")

            // Assert
            for (const link of links) {
                expect(link.classList.contains("link")).toBe(true)
                expect(link.classList.contains("link-primary")).toBe(true)
            }
        })

        it("should have FontAwesome icon before each link text", () => {
            // Arrange & Act
            const links = screen.getAllByRole("link")

            // Assert
            for (const link of links) {
                const icon = link.querySelector("i.fa.fa-external-link")
                expect(icon).toBeTruthy()
            }
        })
    })

    describe("component data", () => {
        it("should have 3 links in component data", () => {
            // Arrange & Act & Assert
            expect(component.links).toHaveLength(3)
        })

        it("should have correct link data structure", () => {
            // Arrange & Act & Assert
            expect(component.links[0]).toEqual({ href: "https://codecharta.com/", label: "Website" })
            expect(component.links[1]).toEqual({
                href: "https://codecharta.com/docs/overview/introduction",
                label: "Documentation"
            })
            expect(component.links[2]).toEqual({ href: "https://github.com/MaibornWolff/codecharta/", label: "Github" })
        })
    })

    describe("accessibility", () => {
        it("should have descriptive link text for screen readers", () => {
            // Arrange & Act
            const links = screen.getAllByRole("link")

            // Assert
            expect(links[0].textContent?.trim()).toContain("Website")
            expect(links[1].textContent?.trim()).toContain("Documentation")
            expect(links[2].textContent?.trim()).toContain("Github")
        })

        it("should be keyboard navigable", () => {
            // Arrange & Act
            const links = screen.getAllByRole("link")

            // Assert
            for (const link of links) {
                expect(link.tagName).toBe("A")
                expect(link.hasAttribute("href")).toBe(true)
            }
        })
    })
})
