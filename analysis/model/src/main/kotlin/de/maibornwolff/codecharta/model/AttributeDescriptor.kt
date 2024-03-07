package de.maibornwolff.codecharta.model

data class AttributeDescriptor(
    val title: String = "",
    val description: String = "",
    val hintLowValue: String = "",
    val hintHighValue: String = "",
    val link: String = "",
    val direction: Int = -1
)
