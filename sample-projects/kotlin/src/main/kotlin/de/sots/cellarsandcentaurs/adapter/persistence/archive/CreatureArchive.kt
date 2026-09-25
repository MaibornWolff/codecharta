package de.sots.cellarsandcentaurs.adapter.persistence.archive

class CreatureArchive {
    private val archived: MutableList<Entity> = mutableListOf()

    fun archive(entity: Entity) {
        archived += entity
    }

    fun archivedIds(): List<String> = archived.map { it.id }
}
