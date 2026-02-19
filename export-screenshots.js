const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const MCP_BIN = '/Applications/Pencil.app/Contents/Resources/app.asar.unpacked/out/mcp-server-darwin-arm64';
const PEN_FILE = '/Users/freddymolina/Desktop/Stia/Grecia/stia-crm.pen';
const OUT_DIR = '/Users/freddymolina/Desktop/Stia/Grecia/screenshots';

const SCREENS = [
  { id: '7N9fe', name: '01-Login' },
  { id: 'mszza', name: '02-Dashboard-Light' },
  { id: 'a3aaG', name: '03-Dashboard-Dark' },
  { id: 'fRLqI', name: '04-Customer-360' },
  { id: 'jK1mb', name: '05-Contactos' },
  { id: 'mydtL', name: '06-Prospectos' },
  { id: 'jZU1W', name: '07-Pipeline' },
  { id: 'xaZjy', name: '08-Cotizaciones' },
  { id: '6kY1S', name: '09-Pedidos' },
  { id: 'xh0LW', name: '10-Facturas' },
  { id: 'gAHCe', name: '11-Actividades' },
  { id: 'cXjiR', name: '12-Productos' },
  { id: 'IoAQJ', name: '13-Casos' },
  { id: 'SPEqW', name: '14-Ofertas-Perdidas' },
  { id: 'lekBG', name: '15-Trazabilidad' },
  { id: 'GXIZC', name: '16-Detalle-Cotizacion' },
  { id: 'oaq4L', name: '17-Dashboard-Logistica' },
  { id: 'VCcoo', name: '18-Reportes' }
];

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const proc = spawn(MCP_BIN, ['--app', 'desktop'], { stdio: ['pipe', 'pipe', 'pipe'] });

let rawBuffer = '';
let pendingResolve = null;

proc.stderr.on('data', (chunk) => {
  process.stderr.write('[stderr] ' + chunk.toString());
});

proc.stdout.on('data', (chunk) => {
  rawBuffer += chunk.toString();
  tryParse();
});

function tryParse() {
  // Try Content-Length framing first
  let m;
  while ((m = rawBuffer.match(/Content-Length:\s*(\d+)\r?\n\r?\n/))) {
    const hdrEnd = rawBuffer.indexOf(m[0]) + m[0].length;
    const bodyLen = parseInt(m[1]);
    if (rawBuffer.length >= hdrEnd + bodyLen) {
      const body = rawBuffer.slice(hdrEnd, hdrEnd + bodyLen);
      rawBuffer = rawBuffer.slice(hdrEnd + bodyLen);
      try { handleMsg(JSON.parse(body)); } catch(e) {}
    } else break;
  }
  // Try newline-delimited fallback
  const lines = rawBuffer.split('\n');
  rawBuffer = lines.pop();
  for (const line of lines) {
    const t = line.trim();
    if (t && t[0] === '{') {
      try { handleMsg(JSON.parse(t)); } catch(e) {}
    }
  }
}

function handleMsg(msg) {
  if (pendingResolve) {
    pendingResolve(msg);
    pendingResolve = null;
  }
}

// Try NDJSON (newline-delimited)
function sendJSON(obj) {
  proc.stdin.write(JSON.stringify(obj) + '\n');
}

function request(method, params, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 100000);
    sendJSON({ jsonrpc: '2.0', id, method, params });
    const timer = setTimeout(() => { pendingResolve = null; reject(new Error('Timeout: ' + method)); }, timeout);
    pendingResolve = (msg) => { clearTimeout(timer); resolve(msg); };
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log('Waiting for MCP server...');
  await sleep(2000);

  console.log('Sending initialize (NDJSON)...');
  try {
    const resp = await request('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'screenshot-exporter', version: '1.0.0' }
    }, 10000);

    const respStr = JSON.stringify(resp);
    console.log('Init response:', respStr.slice(0, 300));

    if (resp.error) {
      console.error('Server error:', resp.error);
      throw new Error('Init failed');
    }

    // Send initialized notification
    sendJSON({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} });
    await sleep(500);

    let saved = 0;
    for (const screen of SCREENS) {
      process.stdout.write(`[${saved + 1}/${SCREENS.length}] ${screen.name}... `);
      try {
        const r = await request('tools/call', {
          name: 'get_screenshot',
          arguments: { filePath: PEN_FILE, nodeId: screen.id }
        }, 30000);

        let found = false;
        if (r.result && r.result.content) {
          for (const block of r.result.content) {
            if (block.type === 'image') {
              const imgData = Buffer.from(block.data, 'base64');
              const fp = path.join(OUT_DIR, `${screen.name}.png`);
              fs.writeFileSync(fp, imgData);
              console.log(`OK (${(imgData.length / 1024).toFixed(0)}KB)`);
              saved++;
              found = true;
              break;
            }
          }
        }
        if (!found) {
          console.log('No image. Response:', JSON.stringify(r).slice(0, 200));
        }
      } catch (e) {
        console.log(`ERROR: ${e.message}`);
      }
      await sleep(200);
    }
    console.log(`\nSaved ${saved}/${SCREENS.length} to ${OUT_DIR}`);
  } catch (e) {
    console.error('Failed:', e.message);
  }

  proc.stdin.end();
  setTimeout(() => process.exit(0), 2000);
}

main();
