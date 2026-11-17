const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = __dirname;
const backendDir = path.join(rootDir, 'backend');

// Find the appropriate python executable
function getPythonCommand() {
  const venvWin = path.join(rootDir, '.venv', 'Scripts', 'python.exe');
  const venvWin1 = path.join(rootDir, '.venv-1', 'Scripts', 'python.exe');
  const venvUnix = path.join(rootDir, '.venv', 'bin', 'python');

  if (process.platform === 'win32') {
    if (fs.existsSync(venvWin)) return venvWin;
    if (fs.existsSync(venvWin1)) return venvWin1;
  } else if (fs.existsSync(venvUnix)) {
    return venvUnix;
  }
  return process.platform === 'win32' ? 'python' : 'python3';
}

const pythonCmd = getPythonCommand();
console.log(`[BACKEND] Using Python: ${pythonCmd}`);

const backend = spawn(pythonCmd, ['-m', 'uvicorn', 'main:app', '--reload', '--port', '8000'], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: false
});

function cleanup() {
  if (backend && backend.pid) {
    if (process.platform === 'win32') {
      try {
        execSync(`taskkill /pid ${backend.pid} /T /F`, { stdio: 'ignore' });
      } catch (e) {
        // Process already terminated
      }
    } else {
      backend.kill('SIGTERM');
    }
  }
}

backend.on('close', (code) => {
  process.exit(code || 0);
});

process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

process.on('exit', () => {
  cleanup();
});
