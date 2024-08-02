from pydantic import BaseModel

class CompileRequest(BaseModel):
    code: str
    set_mem: str | None = None
