import { GeneralMesh } from "../MeshModels/generalMesh"

export interface ColorChangeStrategy {
    execute(numberOfColors: number, mesh: GeneralMesh): boolean
}
