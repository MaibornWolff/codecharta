package de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceDescriptor
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopLanguage
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.OverviewSourceProvider
import kotlin.coroutines.experimental.buildSequence

class GeneratedOverviewSourceProvider(
        private val total2Real1Count: Int,
        private val total20Real10Count: Int,
        private val total20Real10Mcc1Nl1Count: Int) : OverviewSourceProvider {

    override fun readSources(): List<SourceCode> {
        val simpleList = buildSequence {
            while (true) {
                yield(SourceCode(SourceDescriptor("Foo.java", "", OopLanguage.JAVA), total2Real2))
            }
        }.take(total2Real1Count).toList()

        val mediumList = buildSequence {
            while (true) {
                yield(SourceCode(SourceDescriptor("Foo.java", "", OopLanguage.JAVA), total20Real13))
            }
        }.take(total20Real10Count).toList()

        val mccList = buildSequence {
            while (true) {
                yield(SourceCode(SourceDescriptor("Foo.java", "", OopLanguage.JAVA), total20Real14Mcc1Nl1))
            }
        }.take(total20Real10Mcc1Nl1Count).toList()

        return simpleList + mediumList + mccList
    }

    private val total2Real2 =
            """
public class TaggingInterface {
}
""".trim().lines()

    private val total20Real13 =
            """
package none;

import foo;

@Entity
public class Foo {

    @Deprecated("this is bad code")
    private int stuff;

    // constructor
    public Foo(int value){
        stuff = value; // magic number
    }

    public int getStuff(){
        return stuff;
    }
}""".trim().lines()

    private val total20Real14Mcc1Nl1 =
            """
package none;

import foo;

@Entity
public class Foo {

    public int calc(int value){
        if(value > 5){
            return 5;
        }
        return value;
    }

    public int foo(String str){

        return 5;

    }
}""".trim().lines()
}