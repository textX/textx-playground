import json
import sys
import micropip

await micropip.install('pygls')
await micropip.install('textx')
await micropip.install('setuptools')

# Uncomment to use a local build of pygls -- see README for details.
# await micropip.install('https://xxx.loca.lt/out/pygls-<version>-py3-none-any.whl')