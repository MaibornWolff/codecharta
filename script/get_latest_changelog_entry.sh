#!/usr/bin/env bash

level2HeadingCount=0

while IFS="" read -r line || [ -n "$line" ]
do
  if [[ $line == \#\#\ * ]]
    then
    level2HeadingCount=$((level2HeadingCount+1))
    continue
  fi

  if (($level2HeadingCount == 1))
    then
    echo "$line" >> RELEASE_NOTES.md
  fi
done < CHANGELOG.md