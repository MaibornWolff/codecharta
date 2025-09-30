import treemapDice from "./dice"
import treemapSlice from "./slice"

export interface SquarifyNode {
    name: string
    value: number
    children: SquarifyNode[]
    x0?: number
    y0?: number
    x1?: number
    y1?: number
    attributes?: any
}

export interface SquarifyRow {
    name: string
    value: number
    dice: boolean
    children: SquarifyNode[]
}

export function squarify(parent: SquarifyNode, aimedRatio: number) {
    squarifyNode(parent, aimedRatio)
    for (const child of parent.children) {
        if (child.children?.length > 0) {
            squarify(child, aimedRatio)
        }
    }
}

function squarifyNode(parent: SquarifyNode, aimedRatio: number) {
    // nodes sind die einzusortierenden Knoten
    const nodes: SquarifyNode[] = parent.children
    let row: SquarifyRow,
        x0 = parent.x0,
        y0 = parent.y0,
        i = 0,
        j = 0,
        numberOfChildren = nodes.length,
        width: number,
        length: number,
        value = parent.value,
        sumValue: number,
        minValue: number,
        maxValue: number,
        newRatio: number,
        minRatio: number,
        alpha: number,
        beta: number

    // i ist der Index des aktuellen Knotens, der einsortiert wird
    while (i < numberOfChildren) {
        // Ein Schleifendurchlauf entspricht einer Reihe von Knoten
        // Breite und Länge des noch zu belegenden Bereichs müssen nach jeder Reihe neu berechnet werden
        width = parent.x1 - x0
        length = parent.y1 - y0

        // Suche den nächsten Knoten mit Wert und aktualisiere den sumValue
        do {
            sumValue = nodes[j++].value
        } while (!sumValue && j < numberOfChildren)

        // minValue ist der kleinste Wert in der Reihe
        // maxValue ist der größte Wert in der Reihe
        // sumValue ist die Summe der Werte der Knoten in der aktuellen Reihe
        minValue = maxValue = sumValue
        // alpha ist der feste Faktor für die Berechnung des Seitenverhältnisses
        alpha = Math.max(length / width, width / length) / (value * aimedRatio)
        // beta ist der variable Faktor für die Berechnung des Seitenverhältnisses
        beta = sumValue * sumValue * alpha
        // minRatio speichert das aktuelle schlechteste Seitenverhältnis in der Reihe
        minRatio = Math.max(maxValue / beta, beta / minValue)

        // Füge weitere Knoten hinzu, solange sich das Seitenverhältnis nicht verschlechtert
        for (; j < numberOfChildren; ++j) {
            const nodeValue = nodes[j].value
            sumValue += nodeValue
            if (nodeValue < minValue) {
                minValue = nodeValue
            }
            if (nodeValue > maxValue) {
                maxValue = nodeValue
            }
            beta = sumValue * sumValue * alpha
            // Berechne das neue schlechteste Seitenverhältnis nach dem Hinzufügen des Knotens
            newRatio = Math.max(maxValue / beta, beta / minValue)

            if (newRatio > minRatio) {
                // Wenn das Seitenverhältnis schlechter wird, entferne den letzten Knoten und beende die Schleife
                sumValue -= nodeValue
                break
            }
            minRatio = newRatio
        }

        // Fülle die Reihe mit den ausgewählten Knoten und berechne deren Position und Größe
        row = { name: parent.name, value: sumValue, dice: width < length, children: nodes.slice(i, j) }
        if (row.dice) {
            treemapDice(row, x0, y0, parent.x1, value ? (y0 += (length * sumValue) / value) : y0)
        } else {
            treemapSlice(row, x0, y0, value ? (x0 += (width * sumValue) / value) : x0, parent.y1)
        }

        // Der noch zu belegende Bereich wird um die Größe der aktuellen Reihe verkleinert
        value -= sumValue
        i = j
    }
}
