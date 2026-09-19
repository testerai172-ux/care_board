"""
database.py - Quản lý Kết nối Cơ sở dữ liệu Supabase & Connection Pooling
Hệ thống: CARE BOARD - Bệnh viện Đại học Y Dược TP.HCM
"""

import os
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import httpx
from dotenv import load_dotenv

# Tải cấu hình biến môi trường từ .env
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

logger = logging.getLogger("care_board.database")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://isithnzgluzamvnzhlaa.supabase.co").rstrip('/')
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY", "")
SUPABASE_PUBLISHABLE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY", "")

# Bộ nhớ đệm fallback dự phòng (trong trường hợp bảng yeu_cau chưa được khởi tạo trên Supabase)
_LOCAL_FALLBACK_STORE: List[Dict[str, Any]] = [
    {
        "id": "yc-2026-001",
        "tieu_de": "Đề xuất cập nhật Quy trình thẩm định hồ sơ kỹ thuật điều dưỡng theo CDC 2024",
        "noi_dung": "Khoa Hồi sức tích cực đề nghị rà soát và điều chỉnh thời gian lưu catheter ngoại biên chuẩn 96 giờ.",
        "nguoi_gui": "ThSĐD. Nguyễn An",
        "khoa_phong": "Khoa Hồi sức tích cực",
        "muc_do_uu_tien": "Khẩn",
        "trang_thai": "Đang xử lý",
        "ghi_chu": "Đã chuyển Thư ký Hội đồng sơ duyệt",
        "created_at": "2026-03-15T08:30:00+07:00",
        "updated_at": "2026-03-15T08:30:00+07:00"
    },
    {
        "id": "yc-2026-002",
        "tieu_de": "Yêu cầu cấp phát quyền số hóa tài liệu cho Điều dưỡng trưởng khối Ngoại",
        "noi_dung": "Đăng ký quyền thẩm tra và ký số tài liệu chuyên môn nội bộ đợt 1 năm 2026.",
        "nguoi_gui": "ĐD CKI. Lê Quốc Dũng",
        "khoa_phong": "Khoa Ngoại Tiêu hóa",
        "muc_do_uu_tien": "Bình thường",
        "trang_thai": "Chờ tiếp nhận",
        "ghi_chu": "Liên hệ P. TCCB và CNTT",
        "created_at": "2026-03-16T14:15:00+07:00",
        "updated_at": "2026-03-16T14:15:00+07:00"
    }
]


class SupabaseConnectionPool:
    """
    Quản lý Connection Pool kết nối trực tiếp tới Supabase PostgREST API.
    Sử dụng httpx.AsyncClient với HTTP Keep-Alive Connection Pool
    nhằm tối ưu hóa hiệu năng, giảm độ trễ bắt tay SSL/TLS giữa Backend và Supabase.
    """

    def __init__(self):
        self.client: Optional[httpx.AsyncClient] = None
        self.base_url = f"{SUPABASE_URL}/rest/v1"
        self.table_name = "yeu_cau"

    async def init_pool(self):
        """Khởi tạo Connection Pool khi ứng dụng khởi động"""
        if self.client is None or self.client.is_closed:
            limits = httpx.Limits(
                max_keepalive_connections=20,  # Giữ tối đa 20 kết nối TCP duy trì sẵn
                max_connections=50,            # Giới hạn tối đa 50 kết nối đồng thời
                keepalive_expiry=30.0          # Thời gian giữ kết nối (giây)
            )
            timeout = httpx.Timeout(15.0, connect=5.0)

            # Cấu hình Headers chuẩn kết nối Supabase
            headers = {
                "apikey": SUPABASE_SECRET_KEY,
                "Authorization": f"Bearer {SUPABASE_SECRET_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }

            self.client = httpx.AsyncClient(
                base_url=self.base_url,
                headers=headers,
                limits=limits,
                timeout=timeout
            )
            logger.info("Đã khởi tạo Supabase Connection Pool thành công (max_connections=50, keepalive=20)")

    async def close_pool(self):
        """Đóng an toàn Connection Pool khi dừng ứng dụng"""
        if self.client and not self.client.is_closed:
            await self.client.aclose()
            logger.info("Đã đóng an toàn Supabase Connection Pool")

    async def insert_yeu_cau(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Gửi lệnh chèn dữ liệu vào bảng yeu_cau trên Supabase qua Connection Pool
        """
        if not self.client:
            await self.init_pool()

        # Bổ sung timestamp chuẩn nếu chưa có
        if "created_at" not in payload:
            payload["created_at"] = datetime.now().isoformat()
        if "updated_at" not in payload:
            payload["updated_at"] = datetime.now().isoformat()

        url = f"/{self.table_name}"

        try:
            response = await self.client.post(url, json=payload)

            # 201 Created: Thành công
            if response.status_code in (200, 201):
                data = response.json()
                record = data[0] if isinstance(data, list) and len(data) > 0 else data
                logger.info(f"Đã lưu bản ghi vào Supabase Cloud: ID={record.get('id')}")
                return {
                    "source": "supabase_cloud",
                    "data": record
                }

            # Kiểm tra trường hợp bảng chưa tạo trên Supabase (PGRST205)
            error_data = response.json() if response.text else {}
            if response.status_code == 404 and error_data.get("code") == "PGRST205":
                logger.warning("Bảng 'public.yeu_cau' chưa có trên Supabase schema. Đang sử dụng cơ chế fallback an toàn.")
                # Gán ID giả lập và lưu tạm
                fallback_record = dict(payload)
                if "id" not in fallback_record or not fallback_record["id"]:
                    fallback_record["id"] = f"yc-local-{int(datetime.now().timestamp())}"
                _LOCAL_FALLBACK_STORE.insert(0, fallback_record)
                return {
                    "source": "local_fallback",
                    "note": "Bảng 'public.yeu_cau' chưa có trên Supabase Cloud. Dữ liệu tạm thời lưu bộ nhớ đệm an toàn. Vui lòng chạy schema.sql trên Supabase SQL Editor.",
                    "data": fallback_record
                }

            # Lỗi khác từ PostgREST
            logger.error(f"Lỗi Supabase PostgREST ({response.status_code}): {response.text}")
            raise Exception(f"Lỗi Supabase ({response.status_code}): {response.text}")

        except httpx.RequestError as exc:
            logger.error(f"Lỗi kết nối mạng tới Supabase: {exc}")
            # Fallback lưu trữ
            fallback_record = dict(payload)
            fallback_record["id"] = f"yc-offline-{int(datetime.now().timestamp())}"
            _LOCAL_FALLBACK_STORE.insert(0, fallback_record)
            return {
                "source": "offline_fallback",
                "note": f"Mạng ngoại tuyến hoặc lỗi kết nối: {str(exc)}. Dữ liệu đã lưu tạm.",
                "data": fallback_record
            }

    async def get_yeu_cau_list(self, limit: int = 50, offset: int = 0, status: Optional[str] = None) -> Dict[str, Any]:
        """
        Lấy danh sách bản ghi mới nhất từ Supabase với Connection Pool
        """
        if not self.client:
            await self.init_pool()

        # Xây dựng Query Parameters
        params = {
            "select": "*",
            "order": "created_at.desc",
            "limit": limit,
            "offset": offset
        }
        if status and status != "all":
            params["trang_thai"] = f"eq.{status}"

        url = f"/{self.table_name}"

        try:
            response = await self.client.get(url, params=params)

            if response.status_code == 200:
                data = response.json()
                return {
                    "source": "supabase_cloud",
                    "total": len(data),
                    "data": data
                }

            # Kiểm tra trường hợp bảng chưa tạo trên Supabase
            error_data = response.json() if response.text else {}
            if response.status_code == 404 and error_data.get("code") == "PGRST205":
                logger.warning("Bảng 'public.yeu_cau' chưa có trên Supabase schema. Trả về danh sách fallback mẫu.")
                filtered = _LOCAL_FALLBACK_STORE
                if status and status != "all":
                    filtered = [item for item in filtered if item.get("trang_thai") == status]
                return {
                    "source": "local_fallback",
                    "note": "Bảng 'public.yeu_cau' chưa có trên Supabase Cloud. Hiển thị dữ liệu mẫu ban đầu. Vui lòng chạy schema.sql trên Supabase SQL Editor để đồng bộ.",
                    "total": len(filtered),
                    "data": filtered[:limit]
                }

            logger.error(f"Lỗi truy vấn Supabase ({response.status_code}): {response.text}")
            raise Exception(f"Lỗi truy vấn Supabase ({response.status_code}): {response.text}")

        except httpx.RequestError as exc:
            logger.error(f"Lỗi kết nối tới Supabase: {exc}")
            return {
                "source": "offline_fallback",
                "total": len(_LOCAL_FALLBACK_STORE),
                "data": _LOCAL_FALLBACK_STORE[:limit]
            }

    async def delete_yeu_cau(self, id: str) -> Dict[str, Any]:
        """
        Xóa bản ghi yêu cầu khỏi Database Supabase hoặc bộ nhớ đệm fallback
        """
        if not self.client:
            await self.init_pool()

        # Supabase PostgREST cú pháp: DELETE /yeu_cau?id=eq.{id}
        url = f"/{self.table_name}"
        params = {"id": f"eq.{id}"}

        try:
            response = await self.client.delete(url, params=params)

            if response.status_code in (200, 204):
                deleted_data = response.json() if response.text else []
                global _LOCAL_FALLBACK_STORE
                _LOCAL_FALLBACK_STORE = [item for item in _LOCAL_FALLBACK_STORE if item.get("id") != id and item.get("code") != id]
                logger.info(f"Đã xóa bản ghi ID={id} từ Supabase Cloud")
                return {
                    "source": "supabase_cloud",
                    "data": deleted_data or {"id": id, "deleted": True}
                }

            error_data = response.json() if response.text else {}
            if response.status_code == 404 or error_data.get("code") == "PGRST205":
                _LOCAL_FALLBACK_STORE = [item for item in _LOCAL_FALLBACK_STORE if item.get("id") != id and item.get("code") != id]
                logger.info(f"Đã xóa bản ghi ID={id} từ bộ nhớ đệm fallback")
                return {
                    "source": "local_fallback",
                    "data": {"id": id, "deleted": True}
                }

            logger.error(f"Lỗi khi xóa bản ghi Supabase ({response.status_code}): {response.text}")
            raise Exception(f"Lỗi Supabase ({response.status_code}): {response.text}")

        except httpx.RequestError as exc:
            logger.error(f"Lỗi kết nối khi xóa: {exc}")
            _LOCAL_FALLBACK_STORE = [item for item in _LOCAL_FALLBACK_STORE if item.get("id") != id and item.get("code") != id]
            return {
                "source": "offline_fallback",
                "data": {"id": id, "deleted": True}
            }

    async def update_yeu_cau(self, id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cập nhật bản ghi yêu cầu trên Database Supabase hoặc bộ nhớ đệm fallback
        """
        if not self.client:
            await self.init_pool()

        payload["updated_at"] = datetime.now().isoformat()
        url = f"/{self.table_name}"
        params = {"id": f"eq.{id}"}

        try:
            response = await self.client.patch(url, params=params, json=payload)

            if response.status_code in (200, 204):
                updated_data = response.json() if response.text else []
                record = updated_data[0] if isinstance(updated_data, list) and len(updated_data) > 0 else updated_data
                logger.info(f"Đã cập nhật bản ghi ID={id} trên Supabase Cloud")
                return {
                    "source": "supabase_cloud",
                    "data": record or payload
                }

            error_data = response.json() if response.text else {}
            if response.status_code == 404 or error_data.get("code") == "PGRST205":
                for item in _LOCAL_FALLBACK_STORE:
                    if item.get("id") == id or item.get("code") == id:
                        item.update(payload)
                        return {
                            "source": "local_fallback",
                            "data": item
                        }
                return {
                    "source": "local_fallback",
                    "data": payload
                }

            logger.error(f"Lỗi cập nhật Supabase ({response.status_code}): {response.text}")
            raise Exception(f"Lỗi Supabase ({response.status_code}): {response.text}")

        except httpx.RequestError as exc:
            logger.error(f"Lỗi kết nối khi cập nhật: {exc}")
            for item in _LOCAL_FALLBACK_STORE:
                if item.get("id") == id or item.get("code") == id:
                    item.update(payload)
                    return {"source": "offline_fallback", "data": item}
            return {"source": "offline_fallback", "data": payload}

    async def check_health(self) -> Dict[str, Any]:
        """Kiểm tra tình trạng kết nối tới Supabase"""
        if not self.client:
            await self.init_pool()

        try:
            start_time = datetime.now()
            # Kiểm tra endpoint root OpenAPI của Supabase REST
            resp = await self.client.get("/")
            duration_ms = (datetime.now() - start_time).total_seconds() * 1000

            is_connected = resp.status_code == 200
            return {
                "status": "connected" if is_connected else "degraded",
                "supabase_url": SUPABASE_URL,
                "latency_ms": round(duration_ms, 2),
                "http_status": resp.status_code,
                "pool_active": not self.client.is_closed
            }
        except Exception as e:
            return {
                "status": "error",
                "supabase_url": SUPABASE_URL,
                "error": str(e),
                "pool_active": False
            }


# Singleton connection pool instance
db_pool = SupabaseConnectionPool()
