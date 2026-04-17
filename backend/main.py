"""
FastAPI 主入口
"""
import sys
import os
import argparse

# Windows 控制台 UTF-8 编码设置
if sys.platform == 'win32':
    os.system('chcp 65001 >nul 2>&1')

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db, close_db
from app.routers import user_router, product_router, cart_router, order_router, address_router, course_router, external_course_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """生命周期管理"""
    await init_db()
    print("[OK] Database connected")
    yield
    await close_db()
    print("[OK] Database disconnected")


app = FastAPI(
    title="Orange API",
    description="Orange Store Backend API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(user_router)
app.include_router(product_router)
app.include_router(course_router)
app.include_router(cart_router)
app.include_router(order_router)
app.include_router(address_router)
app.include_router(external_course_router)


@app.get("/")
async def root():
    return {"message": "Orange Store API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}


def run_server(host: str = "0.0.0.0", port: int = 8000, reload: bool = False):
    """启动服务器"""
    import uvicorn
    import config

    actual_host = host or config.API_HOST
    actual_port = port or config.API_PORT
    actual_reload = reload or False

    print("=" * 50)
    print("  Orange Store Backend")
    print("=" * 50)
    print(f"  URL: http://{actual_host}:{actual_port}")
    print(f"  Docs: http://{actual_host}:{actual_port}/docs")
    print(f"  Reload: {'ON' if actual_reload else 'OFF'}")
    print("=" * 50)

    uvicorn.run(
        "main:app",
        host=actual_host,
        port=actual_port,
        reload=actual_reload,
        reload_dirs=["app"],
        log_level="info",
        access_log=True,
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Orange Store Backend",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py                      # default
  python main.py --port 9000          # custom port
  python main.py --host 127.0.0.1     # local only
  python main.py --reload              # enable hot reload
  python main.py -r -p 9000           # hot reload + port
        """
    )

    parser.add_argument("-H", "--host", type=str, default=None, help="host (default: 0.0.0.0)")
    parser.add_argument("-p", "--port", type=int, default=None, help="port (default: 8000)")
    parser.add_argument("-r", "--reload", action="store_true", help="enable hot reload")
    parser.add_argument("--version", action="version", version="%(prog)s 1.0.0")

    args = parser.parse_args()
    run_server(host=args.host, port=args.port, reload=args.reload)
