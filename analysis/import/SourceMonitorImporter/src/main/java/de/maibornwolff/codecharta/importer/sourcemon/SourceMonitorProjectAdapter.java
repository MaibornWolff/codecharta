package de.maibornwolff.codecharta.importer.sourcemon;

import com.univocity.parsers.csv.CsvParser;
import com.univocity.parsers.csv.CsvParserSettings;
import de.maibornwolff.codecharta.model.Node;
import de.maibornwolff.codecharta.model.NodeType;
import de.maibornwolff.codecharta.model.Project;
import de.maibornwolff.codecharta.nodeinserter.FileSystemPath;
import de.maibornwolff.codecharta.nodeinserter.NodeInserter;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

public class SourceMonitorProjectAdapter extends Project {
    private String[] header;

    public SourceMonitorProjectAdapter(String name) {
        super(name);
        this.getNodes().add(new Node("root", NodeType.Folder));
    }

    public void addSourceMonitorProjectFromCsv(InputStream inStream) {
        CsvParser parser = createParser(inStream);
        header = parser.parseNext();
        parseContent(parser);
        parser.stopParsing();
    }

    private void parseContent(CsvParser parser) {
        String[] row;
        while ((row = parser.parseNext()) != null) {
            insertNodeForRow(row);
        }
    }

    private CsvParser createParser(InputStream inStream) {
        CsvParserSettings parserSettings = new CsvParserSettings();
        parserSettings.getFormat().setDelimiter(',');

        CsvParser parser = new CsvParser(parserSettings);
        parser.beginParsing(new InputStreamReader(inStream, StandardCharsets.UTF_8));
        return parser;
    }

    private void insertNodeForRow(String[] rawRow) {
        try {
            SourceMonitorCSVRow row = new SourceMonitorCSVRow(rawRow, header);
            Node node = new Node(row.getFileName(), NodeType.File, row.getAttributes());
            NodeInserter.insertByPath(this, new FileSystemPath(row.getFolderWithFile().replace('\\', '/')), node);
        } catch (IllegalArgumentException e) {
            System.err.println("Ignoring " + e.getMessage());
        }
    }


}
