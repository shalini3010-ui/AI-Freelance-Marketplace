import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import API from '../../API/Axios';

const DownloadInvoice = () => {
  const [invoices, setInvoices] = useState([
    { id: '9021', serviceTitle: 'AC Servicing & Deep Cleaning', date: '2026-03-15', amount: 499, handyman: 'John Doe' },
    { id: '9022', serviceTitle: 'Plumbing Repair', date: '2026-03-10', amount: 249, handyman: 'Mike Taylor' },
  ]);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user')) || {
    name: 'Shalini',
    email: 'shalushalini3010@gmail.com',
    area: 'Indiranagar, Bangalore',
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await API.get('user/invoices/');
        if (res.data && res.data.length > 0) {
          setInvoices(res.data);
        }
      } catch (err) {
        console.log('Using default invoice data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const handleDownloadPDF = (inv) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text("SERVICE INVOICE", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(`Invoice ID: INV-${inv.id}`, 14, 30);
    doc.text(`Date: ${inv.date}`, 14, 36);
    doc.text(`Customer: ${user.name}`, 14, 42);
    doc.text(`Email: ${user.email}`, 14, 48);

    const tableColumn = ["Invoice #", "Service Title", "Technician", "Amount"];
    const tableRows = [
      [`INV-${inv.id}`, inv.serviceTitle, inv.handyman || 'Assigned Specialist', `₹${inv.amount}`]
    ];

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 56,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
    });

    const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 70) + 12;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Amount Paid: ₹${inv.amount}`, 14, finalY);

    doc.save(`Invoice_INV-${inv.id}.pdf`);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Download Service Invoices</h2>
      {loading ? (
        <p style={{ color: '#64748b' }}>Loading invoices...</p>
      ) : invoices.length === 0 ? (
        <p style={{ color: '#64748b' }}>No invoices available for download.</p>
      ) : (
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px' }}>Invoice #</th>
                <th style={{ padding: '12px' }}>Service</th>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>Amount</th>
                <th style={{ padding: '12px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>INV-{inv.id}</td>
                  <td style={{ padding: '12px' }}>{inv.serviceTitle}</td>
                  <td style={{ padding: '12px', color: '#64748b' }}>{inv.date}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#16a34a' }}>₹{inv.amount}</td>
                  <td style={{ padding: '12px' }}>
                    <button 
                      onClick={() => handleDownloadPDF(inv)} 
                      style={{ padding: '6px 14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                    >
                      Download PDF 📥
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DownloadInvoice;