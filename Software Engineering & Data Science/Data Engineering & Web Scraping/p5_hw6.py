#!/usr/bin/env python3
#I am using a lot of codes from the client.py file
import sys
import os
import socket

def open_connection(ipn, prt):
   s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
   connect_error = s.connect_ex((ipn, prt))
   if connect_error:
      if connect_error == 111:
         print('Connection refused.  Check address and try again.', file=sys.stderr)
         sys.exit(1)
      else:
         print('Error %d connecting to %s:%d' % (connect_error,ipn,prt), file=sys.stderr)
         sys.exit(1)
   return(s)

def receive_data(thesock, nbytes):
   dstring = b''
   rcount = 0 
   thesock.settimeout(5)
   while rcount < nbytes:
      try:
         somebytes = thesock.recv(min(nbytes - rcount, 8192))
      except socket.timeout:
         print('Connection timed out.', file = sys.stderr)
         break
      if somebytes == b'':
         print('Connection closed', file = sys.stderr)
         break
      rcount = rcount + len(somebytes)
      dstring = dstring + somebytes
      
   print('\n %d bytes received. \n' % rcount)
   return(dstring)

def find_announcement_date(html_text):
   """Search for announcement update in HTML.
   """
   lines = html_text.split('\n')
   for i, line in enumerate(lines):
      if 'latest update' in line.lower():
         if 'Latest update:' in line:
            start = line.find('Latest update:')
            end = line.find('</span>', start)
            if end == -1:
               end = line.find('</p>', start)
            if end != -1:
               line = line[start:end]
            else:
               line = line[start:]
         
         cleanline = line.strip()
         while '<' in cleanline and '>' in cleanline:
            start_tag = cleanline.find('<')
            end_tag = cleanline.find('>', start_tag)
            if end_tag != -1:
               cleanline = cleanline[:start_tag] + cleanline[end_tag+1:]
            else:
               break
         
         cleanline = cleanline.replace('&nbsp;', ' ')
         print(cleanline.strip())
         return


if __name__ == '__main__':
   ipnum = 'web.physics.ucsb.edu'
   port = 80
   thesocket = open_connection(ipnum, port)
   http_request = b'GET /~phys129/lipman/ HTTP/1.0\r\n\r\n'
   thesocket.sendall(http_request)
   indata = receive_data(thesocket, 8192)
   thesocket.shutdown(socket.SHUT_RDWR)
   thesocket.close()
   datastring = indata.decode('utf-8', errors='ignore')
   find_announcement_date(datastring)
