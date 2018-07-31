package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java;

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceCode;
import org.antlr.v4.runtime.BaseErrorListener;
import org.antlr.v4.runtime.RecognitionException;
import org.antlr.v4.runtime.Recognizer;

class SourceNamePrintingErrorListener extends BaseErrorListener {

    private SourceCode sourceCode;

    SourceNamePrintingErrorListener(SourceCode sourceCode) {
        this.sourceCode = sourceCode;
    }

    @Override
    public void syntaxError(Recognizer<?, ?> recognizer, Object offendingSymbol, int line, int charPositionInLine, String msg, RecognitionException e) {
        System.err.println("[" + sourceCode.getSourceDescriptor().getName() + "] line " + line + ":" + charPositionInLine + " " + msg);
    }
}
