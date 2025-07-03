#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 8000
os.chdir('out' if os.path.exists('out') else '.')

Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Server running at http://localhost:{PORT}")
    httpd.serve_forever()