# CodeMaat Coupling Importer

Generates visualisation data from CodeMaat Temporal Coupling CSV data with header. You can find the analizing tool on GitHub https://github.com/adamtornhill/code-maat

## Usage

1. Create VCS Log file from your project, e.x. with Git

    > git log --pretty=format:'[%h] %an %ad %s' --date=short --numstat > VCS_project.log

2. Analyse the Log with CodeMaat

    > maat -c git -l VCS_project.log -a coupling > VCS_project_coupling.csv

3. Convert csv file to cc.json format with CodeMaatCouplingImporter

    > ccsh codemaat-couplingimport \<path to codemaat-coupling csv file>
    
    which prints the visualisation data to stdout.
