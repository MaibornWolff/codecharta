import { Component } from "@angular/core"

@Component({
    selector: "cc-external-links",
    templateUrl: "./externalLinks.component.html",
    imports: []
})
export class ExternalLinksComponent {
    links = [
        {
            href: "https://codecharta.com/",
            label: "Website"
        },
        {
            href: "https://codecharta.com/docs/overview/introduction",
            label: "Documentation"
        },
        {
            href: "https://github.com/MaibornWolff/codecharta/",
            label: "Github"
        }
    ]
}
