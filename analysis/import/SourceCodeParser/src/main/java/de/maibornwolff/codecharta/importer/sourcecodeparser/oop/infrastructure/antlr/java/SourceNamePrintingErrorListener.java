package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java;

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceCode;
import org.antlr.v4.runtime.BaseErrorListener;
import org.antlr.v4.runtime.RecognitionException;
import org.antlr.v4.runtime.Recognizer;

import java.io.PrintStream;

class SourceNamePrintingErrorListener extends BaseErrorListener {

    private PrintStream errorPrintStream;
    private SourceCode sourceCode;

    SourceNamePrintingErrorListener(PrintStream errorPrintStream, SourceCode sourceCode) {
        this.errorPrintStream = errorPrintStream;
        this.sourceCode = sourceCode;
    }

    @Override
    public void syntaxError(Recognizer<?, ?> recognizer, Object offendingSymbol, int line, int charPositionInLine, String msg, RecognitionException e) {
        errorPrintStream.println(getErrorMessage(line, charPositionInLine, msg));
    }

    private String getErrorMessage(int line, int charPositionInLine, String msg) {
        int beginIndex = charPositionInLine - 10 >= 0 ? charPositionInLine - 10 : 0;
        String offendingCode = sourceCode.getLines().get(line - 1).substring(beginIndex, charPositionInLine).trim();
        String fileName = sourceCode.getSourceDescriptor().getName();
        return "[" + fileName + "] line " + line + ":" + charPositionInLine + "=`" + offendingCode + "` " + msg;
    }
}
