#!/usr/bin/env fish

# Available axes for Recursive VF
# {"tag":"wght","minValue":100,"defaultValue":400,"maxValue":800,"name":{"en":"Weight"}}


fonttools varLib.instancer \
					"PlaypenSans-VariableFont_wght.ttf" \
					wght=400:800 \
					-o "PlaypenSans-VF.woff2"

