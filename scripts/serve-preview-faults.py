"""Local-only failure fixture; never changes system/browser networking settings."""
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
import argparse,os
p=argparse.ArgumentParser();p.add_argument('--port',type=int,default=8772);p.add_argument('--models-fail',action='store_true');a=p.parse_args()
os.chdir(Path(__file__).resolve().parents[1])
class Handler(SimpleHTTPRequestHandler):
 def do_GET(self):
  if self.path.startswith('/fonts/') or (a.models_fail and self.path.startswith('/models/')):
   self.send_error(503,'Local failure fixture');return
  return super().do_GET()
ThreadingHTTPServer(('127.0.0.1',a.port),Handler).serve_forever()
