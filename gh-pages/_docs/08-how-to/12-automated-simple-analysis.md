# Automated Simple Analysis

If you have git, [tokei](https://github.com/XAMPPRocky/tokei) and [complexity](https://github.com/thoughtbot/complexity) installed,
you can create a pretty informative software quality map for (almost) every programming language by running just one script.

## How to use
1. Install CodeCharta analysis
2. Install git, tokei and complexity
3. Download the [script](https://github.com/MaibornWolff/codecharta/tree/main/script/simplecc.sh) from GitHub
4. Inside any git working copy execute the script
```bash
   ./simplecc.sh create <filename> [--debug]
```

### Parameters

| Parameter    | Description                                                                                                                    |
|--------------|--------------------------------------------------------------------------------------------------------------------------------|
| `<filename>` | The name of the created cc.json file.                                                                                          |
| `--debug`    | Enables debug mode, which means compression of .cc.json files is turned off and temporary files are not deleted automatically. |

### Example:

```bash
   ./simplecc.sh create myAnalysedProject
```
