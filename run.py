# pyinstaller --onefile --add-data "templates;templates" --add-data "static;static" --add-data "phrases.json;." run.py
# uvicorn app:app --reload

import threading
import webview
import uvicorn
from app import app

def start_server():
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        log_level="error"
    )

if __name__ == "__main__":

    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    import time
    time.sleep(1)

    webview.create_window(
        "OdulTalk",
        "http://127.0.0.1:8000",
        width=1000,
        height=700
    )

    webview.start()