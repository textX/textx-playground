import json
import sys
import micropip

await micropip.install('pygls==1.3.1')
await micropip.install('textx==4.2.3')
await micropip.install('setuptools==80.9.0')

# Uncomment to use a local build of pygls -- see README for details.
# await micropip.install('https://xxx.loca.lt/out/pygls-<version>-py3-none-any.whl')