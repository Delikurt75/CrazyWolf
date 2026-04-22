"""FastAPI uygulaması — Filozof AI sesli+görüntülü sohbet."""

from pathlib import Path
from typing import Optional

import json

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from app.gemini_client import GeminiError, generate_reply, generate_reply_stream

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"

app = FastAPI(title="Filozof AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


class HistoryTurn(BaseModel):
    role: str = Field(pattern="^(user|model)$")
    text: str


class ChatRequest(BaseModel):
    message: str = Field(default="", max_length=4000)
    image_base64: Optional[str] = Field(default=None, max_length=8_000_000)
    history: list[HistoryTurn] = Field(default_factory=list, max_length=30)


class ChatResponse(BaseModel):
    reply: str


@app.get("/")
def index() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/healthz")
def healthz() -> dict:
    return {"status": "ok"}


@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    if not req.message.strip() and not req.image_base64:
        raise HTTPException(status_code=400, detail="Boş mesaj ve boş görüntü olamaz.")
    try:
        reply = generate_reply(
            message=req.message,
            image_base64=req.image_base64,
            history=[turn.model_dump() for turn in req.history],
        )
    except GeminiError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return ChatResponse(reply=reply)


@app.post("/api/chat/stream")
def chat_stream(req: ChatRequest) -> StreamingResponse:
    """Server-Sent Events akışı. Her satır:  data: {"text"|"error"|"done": ...}\\n\\n"""
    if not req.message.strip() and not req.image_base64:
        raise HTTPException(status_code=400, detail="Boş mesaj ve boş görüntü olamaz.")

    def sse(obj: dict) -> str:
        return f"data: {json.dumps(obj, ensure_ascii=False)}\n\n"

    def event_generator():
        try:
            for piece in generate_reply_stream(
                message=req.message,
                image_base64=req.image_base64,
                history=[turn.model_dump() for turn in req.history],
            ):
                yield sse({"text": piece})
        except GeminiError as exc:
            yield sse({"error": str(exc)})
            return
        except Exception as exc:  # beklenmedik
            yield sse({"error": f"Sunucu hatası: {exc}"})
            return
        yield sse({"done": True})

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
