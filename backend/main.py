"""
main.py - Ứng dụng Backend API Fast & Secure với FastAPI
Hệ thống: CARE BOARD - Bệnh viện Đại học Y Dược TP.HCM
Cầu nối trung gian giữa Web Frontend và Database Supabase
"""

import os
from contextlib import asynccontextmanager
from typing import Optional, List, Dict, Any
from datetime import datetime

from fastapi import FastAPI, HTTPException, Query, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel, Field, field_validator
from dotenv import load_dotenv

from backend.database import db_pool
from backend.ai_service import analyze_clinical_document, SAMPLE_DOCUMENTS

# Tải cấu hình biến môi trường
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "127.0.0.1")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX_HTML = os.path.join(BASE_DIR, "index.html")
JS_DIR = os.path.join(BASE_DIR, "js")
ASSETS_DIR = os.path.join(BASE_DIR, "assets")
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)


# ==============================================================================
# LIFESPAN CONTEXT MANAGER: QUẢN LÝ CONNECTION POOL TOÀN VÒNG ĐỜI
# ==============================================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Khởi tạo Connection Pool khi Server khởi động
    await db_pool.init_pool()
    yield
    # Đóng an toàn Connection Pool khi Server tắt
    await db_pool.close_pool()


# Khởi tạo FastAPI App
app = FastAPI(
    title="CARE BOARD - Backend API Bridge",
    description="Cầu nối trung gian giữa Web Frontend và Cơ sở dữ liệu Supabase (Bệnh viện Đại học Y Dược TP.HCM)",
    version="1.0.0",
    lifespan=lifespan
)

# Cấu hình CORS Middleware cho phép Web Frontend gọi tới API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Hỗ trợ mọi origin hoặc chỉ định cụ thể qua .env
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_no_cache_header(request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


# ==============================================================================
# PYDANTIC DATA MODELS & VALIDATION
# ==============================================================================
class YeuCauCreate(BaseModel):
    """Schema nhận và kiểm định (validate) dữ liệu gửi lên từ Client"""
    tieu_de: str = Field(
        ..., 
        min_length=5, 
        max_length=255, 
        description="Tiêu đề yêu cầu / hồ sơ chuyên môn",
        examples=["Đề xuất thẩm định quy trình hút đờm kín"]
    )
    noi_dung: str = Field(
        ..., 
        min_length=5, 
        description="Nội dung chi tiết của yêu cầu",
        examples=["Khoa đề nghị Hội đồng Điều dưỡng xem xét thẩm định trong tháng này."]
    )
    nguoi_gui: str = Field(
        ..., 
        min_length=2, 
        max_length=150, 
        description="Họ tên cán bộ y tế tạo yêu cầu",
        examples=["ThSĐD. Trần Minh Thư"]
    )
    khoa_phong: str = Field(
        ..., 
        min_length=2, 
        max_length=150, 
        description="Khoa / Phòng công tác",
        examples=["Khoa Hồi sức tích cực"]
    )
    muc_do_uu_tien: Optional[str] = Field(
        default="Bình thường", 
        description="Mức độ ưu tiên: 'Khẩn', 'Cao', 'Bình thường', 'Thấp'"
    )
    trang_thai: Optional[str] = Field(
        default="Chờ tiếp nhận", 
        description="Trạng thái ban đầu: 'Chờ tiếp nhận', 'Đang xử lý', 'Đã duyệt', 'Từ chối'"
    )
    ghi_chu: Optional[str] = Field(
        default=None, 
        description="Ghi chú bổ sung (nếu có)"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Dữ liệu siêu dữ liệu mở rộng dạng JSON"
    )

    @field_validator("muc_do_uu_tien")
    @classmethod
    def validate_muc_do_uu_tien(cls, v: str) -> str:
        valid_choices = ["Khẩn", "Cao", "Bình thường", "Thấp"]
        if v not in valid_choices:
            raise ValueError(f"Mức độ ưu tiên phải là một trong các giá trị: {', '.join(valid_choices)}")
        return v

    @field_validator("trang_thai")
    @classmethod
    def validate_trang_thai(cls, v: str) -> str:
        valid_statuses = ["Chờ tiếp nhận", "Đang xử lý", "Đã duyệt", "Từ chối"]
        if v not in valid_statuses:
            raise ValueError(f"Trạng thái phải là một trong các giá trị: {', '.join(valid_statuses)}")
        return v


class YeuCauUpdate(BaseModel):
    """Schema cập nhật dữ liệu hồ sơ yêu cầu"""
    tieu_de: Optional[str] = Field(default=None, min_length=3, max_length=255)
    noi_dung: Optional[str] = Field(default=None, min_length=3)
    nguoi_gui: Optional[str] = Field(default=None, min_length=2, max_length=150)
    khoa_phong: Optional[str] = Field(default=None, min_length=2, max_length=150)
    muc_do_uu_tien: Optional[str] = None
    trang_thai: Optional[str] = None
    ghi_chu: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class APIResponse(BaseModel):
    """Schema phản hồi chuẩn cho toàn bộ API"""
    success: bool
    message: str
    source: Optional[str] = None
    note: Optional[str] = None
    total: Optional[int] = None
    data: Any = None


# ==============================================================================
# API ENDPOINTS & FRONTEND STATIC MOUNTING
# ==============================================================================

@app.get("/", include_in_schema=False)
async def serve_root():
    """Phục vụ trực tiếp Web App Frontend tại localhost:8000/"""
    if os.path.exists(INDEX_HTML):
        return FileResponse(INDEX_HTML)
    return {"message": "index.html not found"}


@app.get("/index.html", include_in_schema=False)
async def serve_index_html():
    """Phục vụ trực tiếp Web App Frontend tại localhost:8000/index.html"""
    if os.path.exists(INDEX_HTML):
        return FileResponse(INDEX_HTML)
    return {"message": "index.html not found"}


@app.get("/supabase-client-full.js", include_in_schema=False)
async def serve_supabase_client_js():
    p = os.path.join(BASE_DIR, "supabase-client-full.js")
    if os.path.exists(p):
        return FileResponse(p, media_type="application/javascript")
    return Response(status_code=404)


@app.get("/api", summary="Root API Info")
async def api_info():
    """Thông tin hệ sinh thái API CARE BOARD"""
    return {
        "system": "CARE BOARD - Unified Fullstack Application",
        "hospital": "Bệnh viện Đại học Y Dược TP.HCM",
        "status": "online",
        "web_app": "/",
        "swagger_docs": "/docs",
        "redoc_docs": "/redoc",
        "endpoints": {
            "POST_yeu_cau": "/api/yeu-cau",
            "GET_yeu_cau": "/api/yeu-cau",
            "DELETE_yeu_cau": "/api/yeu-cau/{id}",
            "PUT_yeu_cau": "/api/yeu-cau/{id}",
            "HEALTH": "/api/health"
        }
    }


@app.get("/api/health", summary="Kiểm tra trạng thái hệ thống & kết nối Supabase")
async def health_check():
    """
    Kiểm tra tình trạng hoạt động của Backend API và độ trễ kết nối tới Database Supabase.
    """
    supabase_status = await db_pool.check_health()
    return {
        "service": "CARE BOARD Backend API",
        "server_time": datetime.now().isoformat(),
        "database": supabase_status
    }


@app.post(
    "/api/yeu-cau", 
    response_model=APIResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Tạo mới yêu cầu / hồ sơ vào Database Supabase"
)
async def create_yeu_cau(payload: YeuCauCreate):
    """
    **Endpoint 1: POST /api/yeu-cau**
    - Nhận dữ liệu JSON từ Client.
    - Validate chặt chẽ qua Pydantic schema (Tiêu đề, nội dung, người gửi, khoa phòng, mức độ ưu tiên).
    - Tự động gắn mốc thời gian ISO timestamp chuẩn.
    - Gửi lưu trữ an toàn vào Database Supabase qua Connection Pool đã được tối ưu.
    """
    try:
        data_dict = payload.model_dump()
        result = await db_pool.insert_yeu_cau(data_dict)

        return APIResponse(
            success=True,
            message="Đã tiếp nhận và lưu trữ yêu cầu thành công.",
            source=result.get("source"),
            note=result.get("note"),
            data=result.get("data")
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi xử lý lưu yêu cầu vào cơ sở dữ liệu: {str(e)}"
        )


@app.get(
    "/api/yeu-cau", 
    response_model=APIResponse,
    summary="Lấy danh sách các yêu cầu mới nhất từ Database Supabase"
)
async def get_yeu_cau_list(
    limit: int = Query(default=50, ge=1, le=100, description="Số lượng bản ghi tối đa"),
    offset: int = Query(default=0, ge=0, description="Vị trí bắt đầu lấy bản ghi (phân trang)"),
    status_filter: Optional[str] = Query(default=None, alias="status", description="Lọc theo trạng thái yêu cầu")
):
    """
    **Endpoint 2: GET /api/yeu-cau**
    - Truy vấn danh sách bản ghi mới nhất từ Supabase (mặc định sắp xếp theo `created_at DESC`).
    - Hỗ trợ phân trang với `limit` và `offset`.
    - Hỗ trợ bộ lọc theo trạng thái (`Chờ tiếp nhận`, `Đang xử lý`, `Đã duyệt`, `Từ chối`).
    - Tận dụng Connection Pool giữ kết nối liên tục, phản hồi với độ trễ thấp.
    """
    try:
        result = await db_pool.get_yeu_cau_list(limit=limit, offset=offset, status=status_filter)

        return APIResponse(
            success=True,
            message="Truy vấn danh sách yêu cầu thành công.",
            source=result.get("source"),
            note=result.get("note"),
            total=result.get("total", 0),
            data=result.get("data", [])
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi truy vấn danh sách yêu cầu từ cơ sở dữ liệu: {str(e)}"
        )


@app.delete(
    "/api/yeu-cau/{id}",
    response_model=APIResponse,
    summary="Xóa yêu cầu / hồ sơ khỏi Database Supabase"
)
async def delete_yeu_cau(id: str):
    """
    **Endpoint 3: DELETE /api/yeu-cau/{id}**
    - Xóa bản ghi theo ID / Code trên Supabase Cloud thông qua PostgREST DELETE.
    - Cập nhật tức thời bộ nhớ đệm và dữ liệu.
    """
    try:
        result = await db_pool.delete_yeu_cau(id)
        return APIResponse(
            success=True,
            message=f"Đã xóa thành công yêu cầu/hồ sơ có mã '{id}'.",
            source=result.get("source"),
            note=result.get("note"),
            data=result.get("data")
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi xóa bản ghi '{id}': {str(e)}"
        )


@app.put(
    "/api/yeu-cau/{id}",
    response_model=APIResponse,
    summary="Cập nhật thông tin yêu cầu / hồ sơ"
)
async def update_yeu_cau(id: str, payload: YeuCauUpdate):
    """
    **Endpoint 4: PUT /api/yeu-cau/{id}**
    - Cập nhật thông tin bản ghi theo ID trên Supabase Cloud.
    """
    try:
        update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
        result = await db_pool.update_yeu_cau(id, update_data)
        return APIResponse(
            success=True,
            message=f"Đã cập nhật yêu cầu/hồ sơ '{id}' thành công.",
            source=result.get("source"),
            data=result.get("data")
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi cập nhật bản ghi '{id}': {str(e)}"
        )


class AIReviewRequest(BaseModel):
    code: Optional[str] = "QTKT-2026-001"
    title: Optional[str] = None
    content: Optional[str] = None
    author: Optional[str] = None
    department: Optional[str] = None
    version: Optional[str] = "v1.1"
    filename: Optional[str] = None


@app.post("/api/ai-review", summary="Thực hiện AI Review Chuyên Môn Lâm Sàng")
async def ai_review(payload: AIReviewRequest):
    """
    **Endpoint AI Review Chuyên Môn**:
    - Nhận mã hồ sơ, tiêu đề, và nội dung tài liệu.
    - Nếu không truyền nội dung nhưng truyền mã mẫu (QTKT-2026-001, HDCS-2026-003, QTKT-2026-005),
      tự động nạp mẫu tài liệu hoàn chỉnh.
    - Soát xét đối chiếu quy chuẩn CDC 2024 & Thông tư 31/2021/TT-BYT.
    - Trả về điểm số, phân tầng lỗi (critical/warning/info), kết luận và HTML highlight.
    """
    code = payload.code or "QTKT-2026-001"
    sample = SAMPLE_DOCUMENTS.get(code, {})

    title = payload.title or sample.get("title", f"Hồ sơ {code}")
    content = payload.content or sample.get("content", f"Nội dung quy trình {code}")
    author = payload.author or sample.get("author", "ThSĐD. Nguyễn An")
    department = payload.department or sample.get("department", "Khoa Hồi sức tích cực")
    version = payload.version or sample.get("version", "v1.1")
    filename = payload.filename or sample.get("filename", f"{code}.docx")

    result = analyze_clinical_document(
        title=title,
        content=content,
        filename=filename,
        code=code,
        author=author,
        department=department,
        version=version
    )
    return result


@app.post("/api/ai-review-file", summary="Tải lên tệp tài liệu hoàn chỉnh để AI Review")
async def ai_review_file(
    file: UploadFile = File(...),
    code: Optional[str] = Form("FILE-UPLOAD-001"),
    author: Optional[str] = Form("Cán bộ Y tế BV ĐHYD"),
    department: Optional[str] = Form("Khoa Lâm sàng"),
    version: Optional[str] = Form("v1.0")
):
    """
    **Endpoint Tải tệp lên để AI Review**:
    - Nhận tệp từ máy tính (.docx, .pdf, .txt, .md, .doc).
    - Đọc nội dung văn bản.
    - Thực thi AI Review chuyên môn lâm sàng thực tế.
    """
    try:
        raw_bytes = await file.read()
        filename = file.filename or "tai_lieu.txt"
        
        content = ""
        try:
            content = raw_bytes.decode("utf-8")
        except UnicodeDecodeError:
            try:
                content = raw_bytes.decode("cp1258", errors="ignore")
            except Exception:
                content = raw_bytes.decode("latin-1", errors="ignore")

        # Lưu tệp vào uploads/
        file_path = os.path.join(UPLOADS_DIR, filename)
        with open(file_path, "wb") as f:
            f.write(raw_bytes)

        title = os.path.splitext(filename)[0].replace("_", " ").replace("-", " ").title()

        result = analyze_clinical_document(
            title=title,
            content=content or f"Tệp tài liệu: {filename}",
            filename=filename,
            code=code,
            author=author,
            department=department,
            version=version
        )
        result["uploaded_file_url"] = f"/uploads/{filename}"
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi xử lý tệp '{file.filename}': {str(e)}"
        )


@app.post("/api/upload", summary="Tải tệp tin lên máy chủ lưu trữ")
async def upload_file(file: UploadFile = File(...)):
    """
    **Endpoint Upload Tệp Thật**:
    - Nhận file multipart/form-data từ client.
    - Lưu an toàn vào thư mục uploads/.
    - Trả về đường dẫn tải và siêu dữ liệu file.
    """
    try:
        content = await file.read()
        file_path = os.path.join(UPLOADS_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(content)

        return {
            "success": True,
            "filename": file.filename,
            "size": len(content),
            "size_formatted": f"{round(len(content) / 1024, 1)} KB",
            "url": f"/uploads/{file.filename}",
            "uploaded_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi lưu tệp tải lên: {str(e)}"
        )


# ==============================================================================
# GẮN CÁC THƯ MỤC STATIC FILES
# ==============================================================================
if os.path.exists(JS_DIR):
    app.mount("/js", StaticFiles(directory=JS_DIR), name="js")

if os.path.exists(ASSETS_DIR):
    app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

if os.path.exists(UPLOADS_DIR):
    app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")


# ==============================================================================
# KHỞI CHẠY TRỰC TIẾP QUA PYTHON
# ==============================================================================
if __name__ == "__main__":
    import uvicorn
    print(f"🚀 Đang khởi động CARE BOARD Unified Server tại http://{HOST}:{PORT}")
    print(f"🖥️  Web Frontend App: http://{HOST}:{PORT}/")
    print(f"📚 Swagger UI API Docs: http://{HOST}:{PORT}/docs")
    uvicorn.run("backend.main:app", host=HOST, port=PORT, reload=True)
