export interface ReceiptData {
  number: string;
  date: string;
  customer: string;
  amount: string;
  status: string;
  validUntil?: string;
}

export function downloadReceipt(estimate: ReceiptData) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Estimate #${estimate.number}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #fff;
      color: #1a202c;
      padding: 48px;
      max-width: 720px;
      margin: 0 auto;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 24px;
      border-bottom: 2px solid #e2e8f0;
      margin-bottom: 28px;
    }
    .logo-box {
      width: 56px; height: 56px;
      border-radius: 12px;
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 22px; font-weight: 900;
    }
    .company-info { text-align: right; }
    .estimate-title {
      font-size: 28px; font-weight: 900;
      letter-spacing: 4px; text-transform: uppercase;
      color: #374151;
    }
    .company-name { font-size: 13px; font-weight: 700; color: #3b82f6; margin-top: 4px; }
    .company-country { font-size: 12px; color: #6b7280; }

    /* Bill to + meta */
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e2e8f0;
    }
    .bill-to-label { font-size: 11px; color: #9ca3af; margin-bottom: 4px; }
    .bill-to-name { font-size: 14px; font-weight: 700; color: #0f1f4b; }
    .bill-to-sub  { font-size: 13px; color: #4b5563; margin-top: 2px; }

    .meta-table { min-width: 250px; }
    .meta-row {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 6px;
    }
    .meta-label { font-size: 13px; color: #6b7280; font-weight: 500; }
    .meta-value { font-size: 13px; color: #0f1f4b; font-weight: 600; }
    .meta-total-row {
      background: #f8fafc;
      border-radius: 8px;
      padding: 6px 10px;
      margin-top: 4px;
    }
    .meta-total-row .meta-label,
    .meta-total-row .meta-value { font-weight: 700; color: #0f1f4b; }

    /* Table */
    table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
    thead tr { background: #2d3748; }
    thead th {
      padding: 12px 16px;
      font-size: 13px; font-weight: 700;
      color: white; text-align: left;
    }
    thead th:not(:first-child) { text-align: center; }
    thead th:last-child { text-align: right; }
    tbody tr { border-bottom: 1px solid #f1f5f9; }
    tbody td { padding: 14px 16px; font-size: 13px; color: #374151; }
    tbody td:not(:first-child) { text-align: center; }
    tbody td:last-child { text-align: right; font-weight: 600; }
    .item-name { font-weight: 700; color: #3b82f6; }
    .item-desc { font-size: 11px; color: #9ca3af; margin-top: 2px; }

    /* Grand total */
    .grand-total {
      display: flex;
      justify-content: flex-end;
      padding: 16px 16px 0;
      border-top: 2px solid #e2e8f0;
      margin-top: 0;
    }
    .grand-total-inner { display: flex; gap: 48px; }
    .grand-total-label { font-size: 14px; font-weight: 700; color: #374151; }
    .grand-total-value { font-size: 14px; font-weight: 700; color: #0f1f4b; }

    /* Status badge */
    .status-badge {
      display: inline-block;
      font-size: 10px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 1px;
      padding: 2px 8px; border-radius: 4px;
      background: #fef3c7; color: #92400e;
      margin-top: 8px;
    }

    /* Footer */
    .footer {
      margin-top: 48px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      display: flex; align-items: center; justify-content: center;
      gap: 6px;
      color: #9ca3af; font-size: 12px;
    }
    .wave-logo {
      font-weight: 900; font-size: 14px; color: #0f1f4b; letter-spacing: -0.5px;
    }

    @media print {
      body { padding: 20px; }
      @page { margin: 0.5in; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div class="logo-box">C</div>
    <div class="company-info">
      <div class="estimate-title">ESTIMATE</div>
      <div class="company-name">Coworking Cube</div>
      <div class="company-country">Canada</div>
    </div>
  </div>

  <!-- Bill to + Meta -->
  <div class="info-row">
    <div>
      <div class="bill-to-label">Bill to</div>
      <div class="bill-to-name">${estimate.customer}</div>
      <div class="bill-to-sub">${estimate.customer}</div>
      <div class="status-badge">${estimate.status}</div>
    </div>
    <div class="meta-table">
      <div class="meta-row">
        <span class="meta-label">Estimate Number:</span>
        <span class="meta-value">${estimate.number}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Estimate Date:</span>
        <span class="meta-value">${new Date(estimate.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Valid Until:</span>
        <span class="meta-value">${estimate.validUntil ?? "—"}</span>
      </div>
      <div class="meta-row meta-total-row">
        <span class="meta-label">Grand Total (CAD):</span>
        <span class="meta-value">${estimate.amount}</span>
      </div>
    </div>
  </div>

  <!-- Items Table -->
  <table>
    <thead>
      <tr>
        <th>Items</th>
        <th>Quantity</th>
        <th>Price</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <div class="item-name">HP Laptop</div>
          <div class="item-desc">RTX 2050</div>
        </td>
        <td>1</td>
        <td>$450.00</td>
        <td>${estimate.amount}</td>
      </tr>
    </tbody>
  </table>

  <!-- Grand Total -->
  <div class="grand-total">
    <div class="grand-total-inner">
      <span class="grand-total-label">Grand Total (CAD):</span>
      <span class="grand-total-value">${estimate.amount}</span>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <span>Powered by</span>
    <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
      <path d="M10 28L20 8L30 28" stroke="#2563eb" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6 20L20 36L34 20" stroke="#60a5fa" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span class="wave-logo">wave</span>
  </div>

  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (win) {
    win.onafterprint = () => URL.revokeObjectURL(url);
  }
}
