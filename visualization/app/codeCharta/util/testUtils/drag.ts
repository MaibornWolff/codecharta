// Taken from https://testing-library.com/docs/example-drag/

import { fireEvent } from "@testing-library/dom"

// https://stackoverflow.com/a/53946549/1179377
function isElement(object) {
	if (typeof object !== "object") {
		return false
	}
	let prototypeString, prototype
	do {
		prototype = Object.getPrototypeOf(object)
		// to work in iframe
		prototypeString = Object.prototype.toString.call(prototype)
		// '[object Document]' is used to detect document
		if (prototypeString === "[object Element]" || prototypeString === "[object Document]") {
			return true
		}
		object = prototype
		// null is the terminal of object
	} while (prototype !== null)
	return false
}

function getElementClientCenter(element) {
	const { left, top, width, height } = element.getBoundingClientRect()
	return {
		x: left + width / 2,
		y: top + height / 2
	}
}

const getCoords = charlie => (isElement(charlie) ? getElementClientCenter(charlie) : charlie)

const sleep = async ms =>
	new Promise(resolve => {
		setTimeout(resolve, ms)
	})

type DragOptions = {
	to?: number
	delta?: { x: number; y: number }
	steps?: number
	duration?: number
}
export async function drag(element: Element, { to: inTo, delta, steps = 20, duration = 500 }: DragOptions) {
	const from = getElementClientCenter(element)
	const to = delta
		? {
				x: from.x + delta.x,
				y: from.y + delta.y
		  }
		: getCoords(inTo)

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
		await sleep(duration / steps)
		fireEvent.mouseMove(element, current)
	}
	fireEvent.mouseUp(element, current)
}
