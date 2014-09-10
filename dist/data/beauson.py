import sys
import json

f = sys.argv[1]

with open(f) as filename:
    d = json.load(filename)

with open('pretty_' + f, 'w') as filename:
    json.dump(d, filename, sort_keys=True,
            indent=4, separators=(',', ': '))
