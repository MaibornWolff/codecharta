package de.maibornwolff.codecharta.model

class Dependency constructor(
        val node: String,
        val dependsOn: String,
        val pairingRate: Int,
        val averageRevs: Int
) {

    override fun toString(): String {
        return "Dependency(node='$node', dependsOn=$dependsOn, pairingRate=$pairingRate, averageRevs=$averageRevs)"
    }
}