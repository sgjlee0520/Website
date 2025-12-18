#!/usr/bin/env python3
#I am using code from server.py
import socket
import time

def bind_port(prt):
   """Create socket and bind to port prt.
   """
   host = ''  
   s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
   s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
   s.bind((host, prt))
   s.listen(1)
   return(s)
    
if __name__ == '__main__':
   port = 55555
   print('Time Server starting on port %d...' % port)
   print('Press Ctrl+C to stop the server.')
   thesocket = bind_port(port)
   while True:
      connection, peer = thesocket.accept()
      current_time = time.ctime()
      message = '\n\nCurrent time: %s\n\n' % current_time
      outdata = message.encode('utf-8')
      print('Sending time to %s...' % repr(peer), end='')
      connection.sendall(outdata) 
      print('Done.')
      connection.shutdown(socket.SHUT_RDWR)
      connection.close()

