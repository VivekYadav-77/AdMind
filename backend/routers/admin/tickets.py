from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from db.database import get_db
from db.models import User, SupportTicket, TicketMessage
from models.schemas import TicketOut, TicketReplyCreate, TicketStatusUpdate
from app.dependencies import require_admin
from app.utils import sanitize_like

router = APIRouter()

@router.get("/tickets", response_model=dict)
def get_admin_tickets(page: int = 1, size: int = 20, status: str = "", category: str = "", search: str = "", db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    query = db.query(SupportTicket)
    if status and status != "all":
        query = query.filter(SupportTicket.status == status)
    if category and category != "all":
        query = query.filter(SupportTicket.category == category)
    if search:
        safe_search = sanitize_like(search)
        from sqlalchemy import or_
        query = query.outerjoin(User, User.id == SupportTicket.user_id).filter(
            or_(
                SupportTicket.subject.ilike(f"%{safe_search}%"),
                User.email.ilike(f"%{safe_search}%"),
                SupportTicket.guest_email.ilike(f"%{safe_search}%")
            )
        )
    
    total = query.count()
    from sqlalchemy.orm import joinedload
    tickets = query.options(joinedload(SupportTicket.user)).order_by(desc(SupportTicket.created_at)).offset((page - 1) * size).limit(size).all()
    
    items = []
    for t in tickets:
        if t.user_id:
            user_email = t.user.email if t.user else "Unknown User"
        else:
            user_email = f"{t.guest_name} (Guest)"
            
        items.append({
            "id": t.id,
            "user_id": t.user_id,
            "guest_name": t.guest_name,
            "guest_email": t.guest_email,
            "user_email": user_email,
            "category": t.category,
            "subject": t.subject,
            "status": t.status,
            "created_at": t.created_at.isoformat() if t.created_at else "",
            "updated_at": t.updated_at.isoformat() if t.updated_at else ""
        })
        
    return {"items": items, "total": total, "page": page, "size": size, "pages": (total + size - 1) // size}

@router.get("/tickets/stats")
def get_admin_ticket_stats(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    open_count = db.query(SupportTicket).filter(SupportTicket.status == "open").count()
    return {"open_count": open_count}

@router.get("/tickets/{ticket_id}", response_model=TicketOut)
def get_admin_ticket_detail(ticket_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    from sqlalchemy.orm import joinedload
    ticket = db.query(SupportTicket).options(joinedload(SupportTicket.messages)).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    return {
        "id": ticket.id,
        "user_id": ticket.user_id,
        "guest_name": ticket.guest_name,
        "guest_email": ticket.guest_email,
        "category": ticket.category,
        "subject": ticket.subject,
        "status": ticket.status,
        "created_at": ticket.created_at.isoformat() if ticket.created_at else "",
        "updated_at": ticket.updated_at.isoformat() if ticket.updated_at else "",
        "messages": [
            {
                "id": m.id,
                "sender_type": m.sender_type,
                "message": m.message,
                "created_at": m.created_at.isoformat() if m.created_at else ""
            } for m in ticket.messages
        ]
    }

@router.post("/tickets/{ticket_id}/reply")
def reply_admin_ticket(ticket_id: int, reply: TicketReplyCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    db_msg = TicketMessage(
        ticket_id=ticket.id,
        sender_type="admin",
        message=reply.message
    )
    db.add(db_msg)
    db.commit()
    
    return {"message": "Reply added successfully"}

@router.patch("/tickets/{ticket_id}/status")
def update_admin_ticket_status(ticket_id: int, request: TicketStatusUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    if request.status not in ["open", "in_progress", "resolved", "closed"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    ticket.status = request.status
    db.commit()
    
    return {"message": "Ticket status updated successfully"}

@router.delete("/tickets/{ticket_id}")
def delete_admin_ticket(ticket_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    db.query(TicketMessage).filter(TicketMessage.ticket_id == ticket.id).delete()
    db.delete(ticket)
    db.commit()
    
    return {"message": "Ticket deleted successfully"}
