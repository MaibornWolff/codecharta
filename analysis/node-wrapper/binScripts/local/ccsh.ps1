#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$ret=0

# Support pipeline input
if ($MyInvocation.ExpectingInput) {
  $input | & "$basedir/../codecharta-analysis/public/bin/ccsh.bat" $args
} else {
  & "$basedir/../codecharta-analysis/public/bin/ccsh.bat" $args
}
$ret=$LASTEXITCODE

exit $ret
