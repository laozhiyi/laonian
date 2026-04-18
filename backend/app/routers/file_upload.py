"""
文件上传路由
"""
import time
import uuid
import hashlib
from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path

router = APIRouter(prefix="/api/upload", tags=["文件上传"])

# 上传目录（相对于 backend 目录）
BACKEND_DIR = Path(__file__).parent.parent.parent
UPLOAD_DIR = BACKEND_DIR / "uploads"
VIDEO_DIR = UPLOAD_DIR / "videos"
IMAGE_DIR = UPLOAD_DIR / "images"

# 确保目录存在
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
VIDEO_DIR.mkdir(parents=True, exist_ok=True)
IMAGE_DIR.mkdir(parents=True, exist_ok=True)

# 允许的视频格式
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"}
# 允许的图片格式
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}

# 最大文件大小（500MB 视频，10MB 图片）
MAX_VIDEO_SIZE = 500 * 1024 * 1024
MAX_IMAGE_SIZE = 10 * 1024 * 1024


def get_file_ext(filename: str) -> str:
    if "." in filename:
        return "." + filename.rsplit(".", 1)[1].lower()
    return ""


def generate_unique_filename(original_name: str) -> str:
    ext = get_file_ext(original_name) or ".mp4"
    timestamp = str(int(time.time() * 1000))
    unique_id = uuid.uuid4().hex[:8]
    short_hash = hashlib.md5(f"{original_name}{timestamp}{unique_id}".encode()).hexdigest()[:8]
    return f"{timestamp}_{short_hash}{ext}"


def _check_content_type(content_type: str, allowed: set) -> bool:
    if not content_type:
        return False
    base_type = content_type.split(";")[0].strip().lower()
    return base_type in allowed


@router.post("/video")
async def upload_video(file: UploadFile = File(...)):
    """上传视频文件"""
    content_type = file.content_type or ""
    filename_received = file.filename or "unknown"

    print(f"[Upload] Received: filename={filename_received}, content_type={content_type}")

    if not _check_content_type(content_type, ALLOWED_VIDEO_TYPES):
        raise HTTPException(
            status_code=400,
            detail=f"不支持的视频格式，当前: '{content_type}'，文件: {filename_received}"
        )

    file_content = await file.read()
    file_size = len(file_content)
    print(f"[Upload] Read {file_size} bytes")

    if file_size == 0:
        raise HTTPException(status_code=400, detail="文件不能为空")

    if file_size > MAX_VIDEO_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"视频文件过大，最大支持 {MAX_VIDEO_SIZE // (1024*1024)}MB"
        )

    filename = generate_unique_filename(filename_received)
    file_path = VIDEO_DIR / filename

    with open(file_path, "wb") as f:
        f.write(file_content)

    print(f"[Upload] Saved to: {file_path}")

    video_url = f"/uploads/videos/{filename}"

    return {
        "ok": True,
        "url": video_url,
        "filename": filename,
        "size": file_size,
        "content_type": content_type
    }


@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    """上传图片文件"""
    content_type = file.content_type or ""
    filename_received = file.filename or "unknown"

    print(f"[Upload/Image] Received: filename={filename_received}, content_type={content_type}")

    if not _check_content_type(content_type, ALLOWED_IMAGE_TYPES):
        raise HTTPException(
            status_code=400,
            detail=f"不支持的图片格式，当前: '{content_type}'，文件: {filename_received}"
        )

    file_content = await file.read()
    file_size = len(file_content)
    print(f"[Upload/Image] Read {file_size} bytes")

    if file_size == 0:
        raise HTTPException(status_code=400, detail="文件不能为空")

    if file_size > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"图片文件过大，最大支持 {MAX_IMAGE_SIZE // (1024*1024)}MB"
        )

    filename = generate_unique_filename(filename_received)
    file_path = IMAGE_DIR / filename

    with open(file_path, "wb") as f:
        f.write(file_content)

    print(f"[Upload/Image] Saved to: {file_path}")

    image_url = f"/uploads/images/{filename}"

    return {
        "ok": True,
        "url": image_url,
        "filename": filename,
        "size": file_size
    }
