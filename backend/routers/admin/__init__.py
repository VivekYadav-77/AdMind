from fastapi import APIRouter
from routers.admin import dashboard, users, jobs, reviews, workspaces, activity, tickets, email_analytics

router = APIRouter(prefix="/admin", tags=["Admin"])

router.include_router(dashboard.router)
router.include_router(users.router)
router.include_router(jobs.router)
router.include_router(reviews.router)
router.include_router(workspaces.router)
router.include_router(activity.router)
router.include_router(tickets.router)
router.include_router(email_analytics.router)
