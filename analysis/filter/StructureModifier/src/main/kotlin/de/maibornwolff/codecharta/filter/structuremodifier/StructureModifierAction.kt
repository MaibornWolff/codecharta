package de.maibornwolff.codecharta.filter.structuremodifier

enum class StructureModifierAction(
    val descripton: String
) {
    PRINT_STRUCTURE("Print the structure of the project"),
    SET_ROOT("Extract a sub path as the new root"),
    MOVE_NODES("Move nodes within the project"),
    REMOVE_NODES("Remove nodes"),
    MIGRATE_MCC("Update MCC metric name to complexity or sonar_complexity")
}
