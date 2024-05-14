package de.maibornwolff.codecharta.model

class BlacklistItem(
        var path: String,
        val type: BlacklistType,
                   ) {
                               override fun toString(): String {
        return "BlacklistItem(path=$path,type=$type)"
    }
}
