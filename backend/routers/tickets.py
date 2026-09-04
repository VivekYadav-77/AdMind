from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from db.database import get_db
from db.models import User, SupportTicket, TicketMessage
from models.schemas import TicketCreate, TicketOut, TicketReplyCreate
from app.dependencies import get_current_user
from app.utils import check_feature_blocked

router = APIRouter()

@router.post("/contact", status_code=201)
def create_guest_ticket(ticket: TicketCreate, db: Session = Depends(get_db)):
    if not ticket.guest_name or not ticket.guest_email:
        raise HTTPException(status_code=400, detail="Guest name and email are required")
    
    db_ticket = SupportTicket(
        guest_name=ticket.guest_name,
        guest_email=ticket.guest_email,
        category=ticket.category,
        subject=ticket.subject
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)

    db_msg = TicketMessage(
        ticket_id=db_ticket.id,
        sender_type="guest",
        message=ticket.message
    )
    db.add(db_msg)
    db.commit()

    return {"message": "Ticket created successfully"}

@router.post("/tickets", status_code=201)
def create_user_ticket(ticket: TicketCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_feature_blocked(current_user, "support", db)
    db_ticket = SupportTicket(
        user_id=current_user.id,
        category=ticket.category,
        subject=ticket.subject
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)

    db_msg = TicketMessage(
        ticket_id=db_ticket.id,
        sender_type="user",
        message=ticket.message
    )
    db.add(db_msg)
    db.commit()

    return {"message": "Ticket created successfully", "ticket_id": db_ticket.id}

@router.get("/tickets/mine", response_model=dict)
def get_my_tickets(page: int = 1, size: int = 20, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(SupportTicket).filter(SupportTicket.user_id == current_user.id)
    total = query.count()
    tickets = query.order_by(desc(SupportTicket.created_at)).offset((page - 1) * size).limit(size).all()
    
    items = []
    for t in tickets:
        items.append({
            "id": t.id,
            "category": t.category,
            "subject": t.subject,
            "status": t.status,
            "created_at": t.created_at.isoformat() if t.created_at else "",
            "updated_at": t.updated_at.isoformat() if t.updated_at else ""
        })
    
    return {"items": items, "total": total, "page": page, "size": size, "pages": (total + size - 1) // size}

@router.get("/tickets/{ticket_id}", response_model=TicketOut)
def get_ticket_detail(ticket_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket or ticket.user_id != current_user.id:
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
def reply_ticket(ticket_id: int, reply: TicketReplyCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket or ticket.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    if ticket.status == "closed":
        raise HTTPException(status_code=400, detail="Cannot reply to a closed ticket")
    
    db_msg = TicketMessage(
        ticket_id=ticket.id,
        sender_type="user",
        message=reply.message
    )
    db.add(db_msg)
    
    if ticket.status == "resolved":
        ticket.status = "open"
        
    db.commit()
    
    return {"message": "Reply added successfully"}
