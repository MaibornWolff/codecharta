const KILOBYTE = 1024
const MEGABYTE = 1024 * KILOBYTE
/** Measured in Chromium, plain text costs about 30 ms per MB, so 5 MB still opens at once. */
const MAX_SHOWN_BYTES = 5 * MEGABYTE
/** Colouring costs about 0.4 s per MB, and minified code three to four times as much. */
const MAX_COLOURED_BYTES = MEGABYTE
/** Where VS Code stops colouring a line, which only minified or generated code reaches. */
const MAX_COLOURED_LINE_LENGTH = 20_000

export const MAX_SHOWN_SIZE = sizeOf(MAX_SHOWN_BYTES)

export function sizeOf(bytes: number): string {
    if (bytes >= MEGABYTE) {
        return `${Number((bytes / MEGABYTE).toFixed(1))} MB`
    }
    return bytes >= KILOBYTE ? `${Math.round(bytes / KILOBYTE)} KB` : `${bytes} B`
}

export function isTooLargeToShow(bytes: number): boolean {
    return bytes > MAX_SHOWN_BYTES
}

export function reasonToLeaveUncoloured(text: string, bytes: number): string | null {
    if (bytes > MAX_COLOURED_BYTES) {
        return `larger than ${sizeOf(MAX_COLOURED_BYTES)}`
    }
    if (text.split("\n").some(line => line.length > MAX_COLOURED_LINE_LENGTH)) {
        return `has lines longer than ${MAX_COLOURED_LINE_LENGTH.toLocaleString("en-US")} characters`
    }
    return null
}
