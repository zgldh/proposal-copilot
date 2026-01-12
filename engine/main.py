import sys
import json
import time

def main():
    """
    Simple echo loop for the Python backend.
    Reads JSON from stdin, responds with JSON to stdout.
    """
    # Signal readiness (optional, but good practice)
    # print(json.dumps({"status": "ready"}), flush=True)

    for line in sys.stdin:
        try:
            request = json.loads(line)
            command = request.get("command")

            response = {
                "status": "ok",
                "command": command,
                "timestamp": time.time(),
                "data": "Python Engine says: Hello from the backend!"
            }
            print(json.dumps(response), flush=True)
        except Exception as e:
            print(json.dumps({"status": "error", "error": str(e)}), flush=True)

if __name__ == "__main__":
    main()
