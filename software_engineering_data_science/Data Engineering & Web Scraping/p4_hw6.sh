#!/bin/bash

URL="https://web.physics.ucsb.edu/~phys129/lipman/"

echo "URL: $URL"

wget -q -O - "$URL" | grep -i "Latest update" | sed -e 's/.*">//' -e 's/<.*//' -e 's/&nbsp;/ /g'
