package de.maibornwolff.codecharta.importer.csv;

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

public class CSVProjectAdapter extends Project {
    public static final char PATH_SEPARATOR = '\\';
    private final CSVImporterParameter callParameter;

    private String[] header;

    public CSVProjectAdapter(String projectName, CSVImporterParameter callParameter) {
        super(projectName);
        this.callParameter = callParameter;
        this.getNodes().add(new Node("root", NodeType.Folder));
    }

    public void addProjectFromCsv(InputStream inStream) {
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
        parserSettings.getFormat().setDelimiter(callParameter.getCSV_DELIMITER());

        CsvParser parser = new CsvParser(parserSettings);
        parser.beginParsing(new InputStreamReader(inStream, StandardCharsets.UTF_8));
        return parser;
    }

    private void insertNodeForRow(String[] rawRow) {
        try {
            CSVRow row = new CSVRow(rawRow, header, callParameter);
            Node node = new Node(row.getFileName(), NodeType.File, row.getAttributes());
            NodeInserter.insertByPath(this, new FileSystemPath(row.getFolderWithFile().replace(PATH_SEPARATOR, '/')), node);
        } catch (IllegalArgumentException e) {
            System.err.println("Ignoring " + e.getMessage());
        }
    }


}
