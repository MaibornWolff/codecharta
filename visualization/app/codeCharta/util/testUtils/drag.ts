// Taken from https://testing-library.com/docs/example-drag/

import { fireEvent } from "@testing-library/dom"
import { wait } from "./wait"

function getElementClientCenter(element) {
	const { left, top, width, height } = element.getBoundingClientRect()
	return {
		x: left + width / 2,
		y: top + height / 2
	}
}

type DragOptions = {
	delta: { x: number; y: number }
	steps?: number
	duration?: number
}
export async function drag(element: Element, { delta, steps = 20, duration = 500 }: DragOptions) {
	const from = getElementClientCenter(element)
	const to = {
		x: from.x + delta.x,
		y: from.y + delta.y
	}

	const step = {
		x: (to.x - from.x) / steps,
		y: (to.y - from.y) / steps
	}

	const current = {
		clientX: from.x,
		clientY: from.y
	}

	fireEvent.mouseEnter(element, current)
	fireEvent.mouseOver(element, current)
	fireEvent.mouseMove(element, current)
	fireEvent.mouseDown(element, current)
	for (let index = 0; index < steps; index++) {
		current.clientX += step.x
		current.clientY += step.y
		await wait(duration / steps)
		fireEvent.mouseMove(element, current)
	}
	fireEvent.mouseUp(element, current)
}
