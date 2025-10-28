import json
import sys
import micropip

await micropip.install([
  'attrs==25.4.0',
  'cattrs==25.3.0',
  'pygls==1.3.1',
  'textx==4.2.3',
  'setuptools==80.9.0',
])

# Uncomment to use a local build of pygls -- see README for details.
# await micropip.install('https://xxx.loca.lt/out/pygls-<version>-py3-none-any.whl')