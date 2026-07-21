export const createCCFileInput = () => {
    const fileInput = document.createElement("INPUT") as HTMLInputElement
    fileInput.setAttribute("type", "file")
    fileInput.setAttribute("accept", ".json,.gz")
    fileInput.setAttribute("multiple", "")
    // The native picker is opened programmatically via .click(); the element itself must never be seen.
    // Hidden, an input that is somehow not cleaned up (e.g. an unsupported "cancel" event) stays invisible
    // instead of showing the browser's "no file selected" control at the top-left of the page.
    fileInput.style.display = "none"
    document.body.appendChild(fileInput)
    return fileInput
}
