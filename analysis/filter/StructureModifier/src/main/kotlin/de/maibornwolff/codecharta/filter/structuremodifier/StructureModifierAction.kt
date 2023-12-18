package de.maibornwolff.codecharta.filter.structuremodifier

enum class StructureModifierAction(val descripton: String) {
    PRINT_STRUCTURE("Print the structure of the project"),
    SET_ROOT("Extract a subproject"),
    MOVE_NODES("Reorder nodes inside the project"),
    REMOVE_NODES("Remove nodes")
}
