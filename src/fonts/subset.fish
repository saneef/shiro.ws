#!/usr/bin/env fish

# Use https://www.zachleat.com/unicode-range-interchange/ to merge all ranges
# Base: U+20-7E,U+A9,U+B0,U+BB,U+D7,U+2013,U+2014,U+2018-2019,U+201C-201D,U+2026
# Arrows: U+2190-2199

set ranges "U+20-7E,U+A9,U+B0,U+BB,U+D7,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2026,U+2190-2199"

set files "PlaypenSans-Regular.ttf" "PlaypenSans-Bold.ttf"

for font in $files
  glyphhanger --whitelist=$ranges --subset=$font --formats=woff2
end
