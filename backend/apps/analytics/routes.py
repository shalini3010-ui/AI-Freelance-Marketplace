from fastapi import APIRouter, Depends, Response
from apps.analytics.dashboard import get_admin_dashboard_metrics
from apps.analytics.reports import generate_csv_revenue_report
from apps.authentication.permissions import require_role
from apps.authentication.models import UserRole

router = APIRouter()

@router.get("/dashboard")
def admin_analytics_dashboard(current_user: dict = Depends(require_role([UserRole.ADMIN]))):
    return get_admin_dashboard_metrics()

@router.get("/export/csv")
def export_revenue_csv(current_user: dict = Depends(require_role([UserRole.ADMIN]))):
    csv_data = generate_csv_revenue_report()
    return Response(content=csv_data, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=revenue_report.csv"})