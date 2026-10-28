#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys

PORT = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"Colony Kernel: Mars server running at http://localhost:{PORT}")
            httpd.serve_forever()
    except OSError:
        PORT = 8080
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"Colony Kernel: Mars server running at http://localhost:{PORT}")
            httpd.serve_forever()
