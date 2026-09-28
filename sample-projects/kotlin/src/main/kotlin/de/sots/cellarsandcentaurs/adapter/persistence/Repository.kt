package de.sots.cellarsandcentaurs.adapter.persistence

abstract class Repository<T> {
    protected val store: MutableMap<String, T> = mutableMapOf()

    abstract fun keyOf(item: T): String

    fun save(item: T) {
        store[keyOf(item)] = item
    }

    fun findOne(key: String): T? = store[key]

    fun findAll(): List<T> = store.values.toList()
}
