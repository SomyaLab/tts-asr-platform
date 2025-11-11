"""Contact Form API endpoints."""
import logging
from fastapi import APIRouter, HTTPException, status, Request
from app.models.schemas import ContactFormRequest, ContactFormResponse
from app.services.email_service import email_service
from app.core.security import get_rate_limiter

logger = logging.getLogger(__name__)
router = APIRouter()
limiter = get_rate_limiter()


@router.post("/contact", response_model=ContactFormResponse)
@limiter.limit("5/minute")
async def submit_contact_form(
    request: Request,
    contact_request: ContactFormRequest
):
    """
    Submit contact form and send email notification.
    
    Args:
        request: FastAPI request object (for rate limiting)
        contact_request: Contact form data
        
    Returns:
        Success response with message
    """
    try:
        logger.info(f"Received contact form submission from {contact_request.email}")
        
        # Send email notification
        email_sent = await email_service.send_contact_form_notification(
            first_name=contact_request.first,
            last_name=contact_request.last,
            email=contact_request.email,
            phone=contact_request.phone,
            company=contact_request.company
        )
        
        if not email_sent:
            logger.warning(f"Failed to send email notification for contact form from {contact_request.email}")
            # Still return success to user, but log the issue
            # In production, you might want to queue the email or use a different approach
        
        return ContactFormResponse(
            success=True,
            message="Thank you for your submission. We'll get back to you soon!"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing contact form: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your request. Please try again later."
        )

