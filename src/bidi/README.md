# Bidi iterator

Upstream repo: https://github.com/Tehreer/SheenBidi

## Background

SheenBidi's structs are filled in using linear memory and the appropriate
calls are made to put it in JS generator form.

## Modifications

No changes to the source have been made, but SheenBidi is compiled by the
makefile in the root instead of the one distributed with the project. Some
folders, like Debug/, Tools/, and Projects/ have not been included in this repo.
