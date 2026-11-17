import os
from datetime import date
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

def generate_pdf_invoice(
    booking_id: str, 
    amount: float, 
    user_name: str, 
    service_title: str = "Home Repair Service",
    invoice_date: str = None
) -> str:
    """Generates a PDF receipt using ReportLab and stores it in media/invoices."""
    os.makedirs("media/invoices", exist_ok=True)
    file_path = f"media/invoices/invoice_{booking_id}.pdf"
    
    if not invoice_date:
        invoice_date = date.today().isoformat()

    c = canvas.Canvas(file_path, pagesize=letter)
    
    # Header
    c.setFont("Helvetica-Bold", 18)
    c.drawString(100, 750, "FixIt.ai Payment Receipt")
    
    # Body Details
    c.setFont("Helvetica", 12)
    c.drawString(100, 710, f"Invoice ID: INV-{booking_id}")
    c.drawString(100, 690, f"Date: {invoice_date}")
    c.drawString(100, 670, f"Customer: {user_name}")
    c.drawString(100, 650, f"Service: {service_title}")
    c.drawString(100, 630, f"Total Amount Paid: ₹{amount:.2f}")
    c.drawString(100, 610, "Status: PAID")
    
    # Footer
    c.setFont("Helvetica-Oblique", 10)
    c.drawString(100, 550, "Thank you for using FixIt.ai Home Services!")

    c.showPage()
    c.save()
    return file_path