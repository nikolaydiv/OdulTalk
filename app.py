from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates

from services.phrase_service import PhrasesService

import os
import sys

def resource_path(relative_path):
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath("."), relative_path)

app = FastAPI()

app.mount("/static", StaticFiles(directory=resource_path("static")), name="static")

templates = Jinja2Templates(directory=resource_path("templates"))

phrases_service = PhrasesService("phrases.json")

@app.get("/")
def home(request: Request):
    phrases = phrases_service.get_all()

    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={
            "phrases": phrases
        }
    )

@app.get("/api/phrases")
def api_get_phrases():
    return phrases_service.get_all()