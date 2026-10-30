/** A click on a link: `window.open` would leave an empty tab behind, as nothing ever loads in it. */
export function handLinkToTheSystem(link: string): void {
    const anchor = document.createElement("a")
    anchor.href = link
    anchor.click()
}
