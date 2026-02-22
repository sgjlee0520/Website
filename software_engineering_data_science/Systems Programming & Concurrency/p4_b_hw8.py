#!/usr/bin/env python3
import os
import time

i = 1
while True:
    print(i)    
    if i % 10 == 0:
        print("About to fork...")
        retval = os.fork()        
        if retval == 0:  
            print("Child process: About to execute ls -l")
            os.execv('/bin/ls', ['ls', '-l'])
    time.sleep(0.5)
    i += 1
