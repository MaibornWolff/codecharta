# CodeMaat Coupling Importer

Generates visualisation data from CodeMaat Temporal Coupling CSV data with header. You can find the analizing tool on GitHub https://github.com/adamtornhill/code-maat

## Usage

1. Create VCS Log file from your project, e.x. with Git

    > git log --pretty=format:'[%h] %an %ad %s' --date=short --numstat > <project>.log

2. Analyse the Log with [CodeMaat](https://github.com/adamtornhill/code-maat)

    > maat -c git -l <project>.log -a coupling > <project_coupling>.csv

3. Convert csv file to cc.json format with CodeMaatCouplingImporter

    > ccsh codemaat-couplingimport <project_coupling>.csv -o <project_coupling>.json
    
    which prints the visualisation data to stdout.
    
4. Merge the coupling data with the project metrics file while using the [MergeFilter](https://github.com/MaibornWolff/codecharta/blob/master/analysis/filter/MergeFilter/README.md)

    > ccsh merge <project_coupling>.json <project_metrics>.json -o <project_merged_data>.json
    
5. Visualizing `<project_merged_data>.json` with [Visualization](https://github.com/MaibornWolff/codecharta/tree/master/visualization)