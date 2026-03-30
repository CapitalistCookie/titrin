#!/usr/bin/env python3
"""Simple HTTP server with no-cache headers for development."""
import http.server
import os

os.chdir('/home/user/titrin-site/site')

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

print('Serving /home/user/titrin-site/site on http://0.0.0.0:8080 (no-cache)')
http.server.HTTPServer(('0.0.0.0', 8080), NoCacheHandler).serve_forever()
