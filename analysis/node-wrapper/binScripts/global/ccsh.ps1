#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$ret=0

# Support pipeline input
if ($MyInvocation.ExpectingInput) {
  $input | & "$basedir/node_modules/codecharta-analysis/public/bin/ccsh.bat" $args
} else {
  & "$basedir/node_modules/codecharta-analysis/public/bin/ccsh.bat" $args
}
$ret=$LASTEXITCODE

exit $ret
