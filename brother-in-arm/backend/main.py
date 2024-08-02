from fastapi import FastAPI
from models.compile_request import CompileRequest
from emulator.runtime import GdbRuntime

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/run/compile/")
async def compile(request: CompileRequest):
    GdbRuntime.compile(request.code)
    return {"message": len(request.code)}

@app.get("/run/next/")
async def go_next():
    return {"message": None}

@app.get("/run/back/")
async def go_back():
    return {"message": None}

@app.get("/status/registers/")
async def compile():
    return {"message": None}