# Contributing
 
Cool, that you are interested in contributing. We like pull request and suggestions from everyone.

If you are planning in making a major contribution we appreciate your opening an issue or contacting [us](mailto:codecharta@github.com).

Some things that will increase the chance that your pull request is accepted:

Write clean code.
Write tests.
Write a good commit message.
Code for Analysis sub-project only in Java and Kotlin languages.

We will *NOT* accept any pull requests that don't follow the Contributor Covenant [code of conduct](CODE_OF_CONDUCT.md).

## Naming conventions

### Branching

Branch names consist of a type and the describing branch name itself, which is always **lowercase** separated by **dashes**. 
It follows this structure `<type>/<name>`. 
For more detailed information check out the source [Branch Types by CKSource](https://docs.ckeditor.com/ckeditor5/latest/framework/guides/contributing/git-commit-message-convention.html) 

| Types         | Changelog     | Description
| ---           | ---           | ---
| `feature`	    | yes           | New feature I add or expand
| `bugfix`	    | yes           | Bug fix
| `codestyle`  	| no            | Our beloved code style improvements / refactorings
| `docs`	    | no            | Updated documentation
| `internal`	| no            | Other kinds of internal changes
| `tests`	    | no            | Changes in test files
| `revert`      | no            | Revert of some commit
| `release`     | no            | Commit used by the release tools

Examples:
- `feature/add-settings-option-xyz`
- `bugfix/solve-unecpected-settings-errors`

### Commit Messages

Commit messages usually are very different from each other, although similar words are used. 
To unify the overview of all commit messages we would like to keep track of the following principles.
For more detailed information check out the source [Commit Conventions by Chris Beams](https://chris.beams.io/posts/git-commit/).
1. Separate subject from optional body with a blank line
2. Limit the subject line to 50 characters

    If you’re having a hard time summarizing, you might be committing too many changes at once. Strive for atomic commits (a topic for a separate post).

3. Capitalize the subject line
4. Do not end the subject line with a full stop
5. Use the imperative mood in the subject line

    A properly formed Git commit subject line should always be able to complete the following sentence:
    > If applied, this commit will `<your-subject-line>`
    
    Correct Subject Examples:
    - If applied, this commit will **refactor subsystem X for readability**
    - If applied, this commit will **update getting started documentation**
    - If applied, this commit will **remove deprecated methods**
    - If applied, this commit will **release version 1.0.0**
    - If applied, this commit will **merge pull request #123 from user/branch**
    
    Wrong Subject Examples:
    - If applied, this commit will *fixed bug with Y*
    - If applied, this commit will *changing behavior of Y*
    - If applied, this commit will *more fixes for broken stuff*
    - If applied, this commit will *sweet new API methods*

6. Wrap the body at 72 characters
7. Use the body to explain what and why vs. how



