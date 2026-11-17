"""
Single-Terminal Runner for AI-Freelance Marketplace
Starts both FastAPI Backend and React Frontend concurrently.
"""

import os
import sys
import subprocess
import threading

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")

# ANSI color codes
CYAN = "\033[96m"
MAGENTA = "\033[95m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RESET = "\033[0m"
BOLD = "\033[1m"


def get_python_exe():
    venv_win = os.path.join(ROOT_DIR, ".venv", "Scripts", "python.exe")
    venv_win1 = os.path.join(ROOT_DIR, ".venv-1", "Scripts", "python.exe")
    venv_unix = os.path.join(ROOT_DIR, ".venv", "bin", "python")

    if sys.platform == "win32":
        if os.path.exists(venv_win):
            return venv_win
        if os.path.exists(venv_win1):
            return venv_win1
    elif os.path.exists(venv_unix):
        return venv_unix
    return sys.executable


def stream_logs(pipe, prefix, color):
    try:
        for line in iter(pipe.readline, ""):
            if not line:
                break
            print(f"{color}{BOLD}[{prefix}]{RESET} {line.rstrip()}", flush=True)
    except (ValueError, IOError):
        pass


def kill_process_tree(proc):
    if not proc:
        return
    if sys.platform == "win32":
        try:
            subprocess.run(
                ["taskkill", "/pid", str(proc.pid), "/T", "/F"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        except Exception:
            pass
    else:
        try:
            proc.terminate()
        except Exception:
            pass


def main():
    python_exe = get_python_exe()
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"

    print(f"{GREEN}{BOLD}===================================================={RESET}", flush=True)
    print(f"{GREEN}{BOLD}  FixIt.ai - AI-Freelance Marketplace Dev Runner   {RESET}", flush=True)
    print(f"{GREEN}{BOLD}===================================================={RESET}", flush=True)
    print(f"  Backend:  {CYAN}http://127.0.0.1:8000{RESET}", flush=True)
    print(f"  Frontend: {MAGENTA}http://localhost:3000{RESET}", flush=True)
    print(f"  Swagger:  {CYAN}http://127.0.0.1:8000/docs{RESET}", flush=True)
    print(f"{YELLOW}Press CTRL+C anytime to stop both services.{RESET}\n", flush=True)

    backend_proc = subprocess.Popen(
        [python_exe, "-u", "-m", "uvicorn", "main:app", "--reload", "--port", "8000"],
        cwd=BACKEND_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )

    frontend_proc = subprocess.Popen(
        [npm_cmd, "start"],
        cwd=FRONTEND_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )

    t1 = threading.Thread(
        target=stream_logs,
        args=(backend_proc.stdout, "BACKEND", CYAN),
        daemon=True,
    )
    t2 = threading.Thread(
        target=stream_logs,
        args=(frontend_proc.stdout, "FRONTEND", MAGENTA),
        daemon=True,
    )

    t1.start()
    t2.start()

    try:
        backend_proc.wait()
    except KeyboardInterrupt:
        print(f"\n{YELLOW}Shutting down services...{RESET}", flush=True)
    finally:
        kill_process_tree(backend_proc)
        kill_process_tree(frontend_proc)
        print(f"{GREEN}All services stopped cleanly.{RESET}", flush=True)


if __name__ == "__main__":
    main()
