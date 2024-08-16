from fastapi import FastAPI, Form
from typing import Annotated
from models.compile_request import CompileRequest
from emulator.runtime import GdbRuntime

app = FastAPI()
runtime = GdbRuntime()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/run/compile/")
async def compile(code: Annotated[str, Form()]):
    return runtime.compile(code)

@app.get("/run/next/")
async def go_next():
    return runtime.go_next()

@app.get("/run/back/")
async def go_back():
    return runtime.go_back()

@app.get("/state/")
async def state():
    return runtime.get_state()