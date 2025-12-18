#!/usr/bin/env python3

import requests

response = requests.get('http://web.physics.ucsb.edu/~phys129/lipman/')

for line in response.text.split('\n'):
    if 'Latest update:' in line:
        start = line.find('Latest update:')
        end = line.find('</span>', start)
        if end != -1:
            line = line[start:end]
        while '<' in line:
            line = line[:line.find('<')] + line[line.find('>')+1:]
        print(line.replace('&nbsp;', ' ').strip())
        break
