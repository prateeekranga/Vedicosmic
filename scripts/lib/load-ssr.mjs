// Loads the server bundle (dist-ssr/entry-server.js) for the build scripts. supabase-js, which the
// app imports, needs a WebSocket class at load time; Node 22 has one built in, Node 18 (Hostinger's
// own build) does not, so the `ws` package stands in.
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import WebSocket from 'ws';

if (!globalThis.WebSocket) globalThis.WebSocket = WebSocket;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export const loadServerBundle = () => import(pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href);
