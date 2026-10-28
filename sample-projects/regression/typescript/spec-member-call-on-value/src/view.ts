import { Render } from './render'

interface Widget {
    Render(): void
}

export function draw(widget: Widget): void {
    widget.Render()
}

export function make(): Render {
    return new Render()
}
