from typing import Any, Dict, List, Optional, Union
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from datetime import datetime
import traceback
from enum import Enum

class ResponseStatus(Enum):
    """Standard response status codes"""
    SUCCESS = "success"
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"

class StandardResponse:
    """Standardized API response formatter"""
    
    @staticmethod
    def success(
        data: Any = None,
        message: str = "Operation completed successfully",
        meta: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a success response"""
        response = {
            "status": ResponseStatus.SUCCESS.value,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "data": data
        }
        
        if meta:
            response["meta"] = meta
            
        return response
    
    @staticmethod
    def error(
        message: str = "An error occurred",
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        status_code: int = 500
    ) -> JSONResponse:
        """Create an error response"""
        error_data = {
            "status": ResponseStatus.ERROR.value,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "error_code": error_code or f"ERR_{status_code}"
        }
        
        if details:
            error_data["details"] = details
            
        return JSONResponse(
            status_code=status_code,
            content=error_data
        )
    
    @staticmethod
    def validation_error(
        message: str = "Validation failed",
        field_errors: Optional[Dict[str, str]] = None
    ) -> JSONResponse:
        """Create a validation error response"""
        error_data = {
            "status": ResponseStatus.ERROR.value,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "error_code": "VALIDATION_ERROR"
        }
        
        if field_errors:
            error_data["field_errors"] = field_errors
            
        return JSONResponse(
            status_code=422,
            content=error_data
        )
    
    @staticmethod
    def paginated_response(
        data: List[Any],
        page: int = 1,
        per_page: int = 10,
        total: int = 0,
        message: str = "Data retrieved successfully"
    ) -> Dict[str, Any]:
        """Create a paginated response"""
        total_pages = (total + per_page - 1) // per_page if total > 0 else 0
        
        return StandardResponse.success(
            data=data,
            message=message,
            meta={
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "total": total,
                    "total_pages": total_pages,
                    "has_next": page < total_pages,
                    "has_prev": page > 1
                }
            }
        )

class ErrorHandler:
    """Centralized error handling"""
    
    @staticmethod
    def handle_exception(
        error: Exception,
        context: Optional[Dict[str, Any]] = None,
        include_traceback: bool = False
    ) -> JSONResponse:
        """Handle and format exceptions"""
        
        # Known exceptions
        if isinstance(error, HTTPException):
            return StandardResponse.error(
                message=error.detail,
                status_code=error.status_code,
                error_code=f"HTTP_{error.status_code}"
            )
        
        if isinstance(error, ValueError):
            return StandardResponse.validation_error(
                message=str(error)
            )
        
        # Unknown exceptions
        error_details = {
            "type": type(error).__name__,
            "message": str(error)
        }
        
        if context:
            error_details["context"] = context
            
        if include_traceback:
            error_details["traceback"] = traceback.format_exc()
        
        return StandardResponse.error(
            message="Internal server error",
            details=error_details,
            status_code=500
        )

class APIResponseCodes:
    """Centralized API response codes"""
    
    # Success codes
    SUCCESS = "SUCCESS"
    CREATED = "CREATED"
    UPDATED = "UPDATED"
    DELETED = "DELETED"
    
    # Client error codes
    BAD_REQUEST = "BAD_REQUEST"
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"
    NOT_FOUND = "NOT_FOUND"
    VALIDATION_ERROR = "VALIDATION_ERROR"
    CONFLICT = "CONFLICT"
    
    # Server error codes
    INTERNAL_ERROR = "INTERNAL_ERROR"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
    EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR"
    
    # Application-specific codes
    PROJECT_NOT_FOUND = "PROJECT_NOT_FOUND"
    VIDEO_PROCESSING_ERROR = "VIDEO_PROCESSING_ERROR"
    AI_ANALYSIS_ERROR = "AI_ANALYSIS_ERROR"
    API_KEY_INVALID = "API_KEY_INVALID"
    UPLOAD_ERROR = "UPLOAD_ERROR"

def create_project_response(project: Dict[str, Any]) -> Dict[str, Any]:
    """Create a standardized project response"""
    return StandardResponse.success(
        data={
            "project": project
        },
        message="Project retrieved successfully"
    )

def create_clips_response(clips: List[Dict[str, Any]], project_id: str) -> Dict[str, Any]:
    """Create a standardized clips response"""
    return StandardResponse.success(
        data={
            "clips": clips,
            "project_id": project_id,
            "total_clips": len(clips)
        },
        message=f"Found {len(clips)} clips"
    )

def create_analysis_response(
    project_id: str,
    clips: List[Dict[str, Any]],
    analysis_metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Create a standardized analysis response"""
    data = {
        "project_id": project_id,
        "clips": clips,
        "analysis_summary": {
            "total_clips": len(clips),
            "processing_time": analysis_metadata.get("processing_time") if analysis_metadata else None,
            "ai_provider": analysis_metadata.get("provider") if analysis_metadata else None
        }
    }
    
    if analysis_metadata:
        data["metadata"] = analysis_metadata
    
    return StandardResponse.success(
        data=data,
        message=f"Analysis completed successfully. Generated {len(clips)} clips."
    ) 