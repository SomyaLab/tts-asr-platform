"""Email service for sending notifications."""
import logging
from typing import Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import aiosmtplib
from app.config import settings


logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails via SMTP."""
    
    def __init__(self):
        """Initialize email service with SMTP settings."""
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_username = settings.SMTP_USERNAME
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL or settings.SMTP_USERNAME
        self.use_tls = settings.SMTP_USE_TLS
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        is_html: bool = False
    ) -> bool:
        """
        Send an email via SMTP.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            body: Email body content
            is_html: Whether the body is HTML formatted
            
        Returns:
            True if email sent successfully, False otherwise
        """
        try:
            # Validate SMTP configuration
            if not self.smtp_username or not self.smtp_password:
                logger.error("SMTP credentials not configured. Please set SMTP_USERNAME and SMTP_PASSWORD environment variables.")
                return False
            
            # Create message
            message = MIMEMultipart("alternative")
            message["From"] = self.from_email
            message["To"] = to_email
            message["Subject"] = subject
            
            # Add body
            content_type = "html" if is_html else "plain"
            part = MIMEText(body, content_type)
            message.attach(part)
            
            # Send email
            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_username,
                password=self.smtp_password,
                use_tls=self.use_tls,
            )
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False
    
    async def send_contact_form_notification(
        self,
        first_name: str,
        last_name: str,
        email: str,
        phone: str,
        company: str
    ) -> bool:
        """
        Send contact form submission notification email.
        
        Args:
            first_name: User's first name
            last_name: User's last name
            email: User's email
            phone: User's phone number
            company: User's company name
            
        Returns:
            True if email sent successfully, False otherwise
        """
        # Format email body
        body = f"""
New Contact Form Submission

Contact Details:
----------------
First Name: {first_name}
Last Name: {last_name}
Email: {email}
Phone: {phone}
Company: {company}

---
This is an automated notification from the Somya Labs contact form.
        """.strip()
        
        # Send email
        return await self.send_email(
            to_email=settings.CONTACT_EMAIL_RECIPIENT,
            subject=settings.CONTACT_EMAIL_SUBJECT,
            body=body,
            is_html=False
        )


# Global email service instance
email_service = EmailService()

