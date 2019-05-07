package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java;

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagging.Tags;
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.NonCodeTags;
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.UnsortedCodeTags;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.Token;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

class CodeLineCategorizer {

    private static final int COMMENT_CHANNEL = Token.MIN_USER_CHANNEL_VALUE;

    private Map<Integer, Set<Tags>> lineIsCode = new HashMap<>();

    Map<Integer, Set<Tags>> getCategoriesPerLine(CommonTokenStream tokens) {
        lineIsCode.clear();
        tokens.fill();
        for (int index = 0; index < tokens.size(); index++) {
            handleToken(tokens.get(index));
        }
        return lineIsCode;
    }

    private void handleToken(Token token) {
        int tokenChannel = token.getChannel();
        if (tokenChannel == Token.DEFAULT_CHANNEL) {
            if (token.getType() != Token.EOF) {
                addIfItOverwritesWhitespace(token.getLine(), UnsortedCodeTags.ANY);
            }
        } else if (tokenChannel == Token.HIDDEN_CHANNEL) {
            addAllWhitspaceLines(token);
        } else if (tokenChannel == COMMENT_CHANNEL) {
            addAllCommentLines(token);
        }
    }

    private void addAllCommentLines(Token token) {
        String[] commentLines = token.getText()
                .split("\\r?\\n", -1);
        for (int commentLine = token.getLine(); commentLine < token.getLine() + commentLines.length; commentLine++) {
            addIfItOverwritesWhitespace(commentLine, NonCodeTags.COMMENT);
        }
    }

    private void addAllWhitspaceLines(Token token) {
        final Pattern pattern = Pattern.compile("\\r?\\n");
        final Matcher matcher = pattern.matcher(token.getText());
        for (int commentLine = token.getLine(); matcher.find(); commentLine++) {
            addIfItOverwritesWhitespace(commentLine, NonCodeTags.WHITESPACE);
        }
    }

    private void addIfItOverwritesWhitespace(int lineNumber, Tags tag) {
        Set<Tags> tags = lineIsCode.getOrDefault(lineNumber, new HashSet<>());
        tags.add(tag);
        if (tags.contains(NonCodeTags.WHITESPACE) && tags.size() > 1) {
            tags.remove(NonCodeTags.WHITESPACE);
        }
        lineIsCode.put(lineNumber, tags);
    }
}
