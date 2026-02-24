#!/usr/bin/env python3
"""
PivaiTech Website Launcher
Double-click this file to start the website automatically
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from threading import Timer

PORT = 5500

def open_browser():
    """Open the browser after a short delay"""
    webbrowser.open(f'http://localhost:{PORT}/index.html')

def main():
    # Change to script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # Custom handler with proper MIME types
    Handler = http.server.SimpleHTTPRequestHandler
    Handler.extensions_map.update({
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.css': 'text/css',
        '.html': 'text/html',
    })
    
    # Suppress logs (optional - remove these lines if you want to see logs)
    Handler.log_message = lambda self, format, *args: None
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print("=" * 60)
            print("  PivaiTech Website Server")
            print("=" * 60)
            print(f"\n✓ Server running at: http://localhost:{PORT}/")
            print(f"✓ Opening index.html in your browser...\n")
            print("Press Ctrl+C to stop the server")
            print("=" * 60)
            
            # Open browser after 1 second
            Timer(1.0, open_browser).start()
            
            # Start server
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n\n✓ Server stopped. You can close this window.")
        sys.exit(0)
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"\n✗ Error: Port {PORT} is already in use.")
            print("  Either close the other server or change PORT in this script.")
        else:
            print(f"\n✗ Error: {e}")
        input("\nPress Enter to close...")
        sys.exit(1)

if __name__ == "__main__":
    main()
