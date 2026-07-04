// The document-cursor indicator used while interacting with the 3D map. Extracted out of
// codeMap.mouseEvent.service (Slice 16c) so viewCube can drive the cursor without importing the
// codeMap feature — its last codeMap dependency — which closed a cross-feature cycle.
export enum CursorType {
    Default = "default",
    Grabbing = "grabbing",
    Pointer = "pointer",
    Moving = "move"
}

export function changeCursorIndicator(cursorIcon: CursorType): void {
    document.body.style.cursor = cursorIcon
}
