from typing import Optional
from pydantic import BaseModel, Field

class CheckoutSchema(BaseModel):
    booking_id: str
    amount: float = Field(..., gt=0)
    payment_method: str  # "Card", "UPI", "Stripe", "Wallet"

class RefundRequestSchema(BaseModel):
    transaction_id: str
    reason: str

class BankDetailsSchema(BaseModel):
    account_holder_name: str
    account_number: str
    ifsc_code: str
    bank_name: Optional[str] = None

class WithdrawalRequestSchema(BaseModel):
    amount: float = Field(..., gt=0, description="Amount to withdraw")
    bank_details: Optional[BankDetailsSchema] = None

class PayoutBalanceResponse(BaseModel):
    total_earnings: float
    total_withdrawn: float
    available_balance: float

class InvoiceResponseSchema(BaseModel):
    id: str
    serviceTitle: str
    handyman_name: str
    date: str
    amount: float