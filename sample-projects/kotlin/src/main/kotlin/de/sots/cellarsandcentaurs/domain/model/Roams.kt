package de.sots.cellarsandcentaurs.domain.model

@Target(AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
annotation class Roams(val terrain: String = "cellar")
