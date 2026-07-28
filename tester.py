from http.server import SimpleHTTPRequestHandler, HTTPServer
import os

class GitHubPagesHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # Clean the path and strip trailing slashes
        path = self.path.strip('/')
        
        # If root, serve index.html
        if not path:
            return super().do_GET()
            
        # Check if the requested path maps to a local .html file (Clean URLs)
        html_path = f"{path}.html"
        if os.path.exists(html_path) and not os.path.isdir(html_path):
            self.path = '/' + html_path
            
        return super().do_GET()

    def send_error(self, code, message=None, explain=None):
        # Mimic GitHub Pages custom 404 behavior
        if code == 404 and os.path.exists("404.html"):
            self.send_response(404)
            self.send_header("Content-type", "text/html; charset=utf-8")
            self.end_headers()
            with open("404.html", "rb") as f:
                self.wfile.write(f.read())
        else:
            super().send_error(code, message, explain)

if __name__ == "__main__":
    print("Simulating GitHub Pages environment on http://localhost:8000")
    HTTPServer(('localhost', 8000), GitHubPagesHandler).serve_forever()
