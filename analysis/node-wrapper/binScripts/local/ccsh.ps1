#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$exe=""
if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {
  # Fix case when both the Windows and Linux builds of Node
  # are installed in the same directory
  $exe=".exe"
}
$ret=0

# Support pipeline input
if ($MyInvocation.ExpectingInput) {
  $input | & "$basedir/../codecharta-analysis/public/bin/ccsh.bat" $args
} else {
  & "$basedir/../codecharta-analysis/public/bin/ccsh.bat" $args
}
$ret=$LASTEXITCODE

exit $ret
