import { Mesh } from "three"

export interface ColorChangeStrategy {
    execute(numberOfColors: number, mesh: Mesh): boolean
}
