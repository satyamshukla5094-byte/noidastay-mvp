export const agreementTemplate = `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Times New Roman', Times, serif; padding: 40px; line-height: 1.6; color: #333; }
  .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 10px; }
  .title { font-size: 24px; font-weight: bold; text-transform: uppercase; }
  .section { margin-bottom: 20px; }
  .section-title { font-weight: bold; text-decoration: underline; margin-bottom: 10px; }
  .details { margin-left: 20px; }
  .footer { margin-top: 50px; font-size: 12px; text-align: center; color: #777; }
  .signature-box { margin-top: 40px; display: flex; justify-content: space-between; }
  .signature-line { border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 5px; }
</style>
</head>
<body>
  <div class="header">
    <div class="title">Rent Agreement - Greater Noida PG</div>
    <div>NoidaStay Digital Broker Services</div>
  </div>

  <div class="section">
    <p>This Rent Agreement is made and executed at Greater Noida on this day of {{date}} by and between:</p>
  </div>

  <div class="section">
    <div class="section-title">THE OWNER / FIRST PARTY:</div>
    <div class="details">
      <p><b>Name:</b> {{owner_name}}</p>
      <p><b>Address:</b> {{owner_address}}</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">THE TENANT / SECOND PARTY:</div>
    <div class="details">
      <p><b>Name:</b> {{student_name}}</p>
      <p><b>Address:</b> {{student_address}}</p>
      <p><b>Aadhaar (Masked):</b> {{student_masked_id}}</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">TERMS & CONDITIONS:</div>
    <ol>
      <li>The monthly rent for the premises is fixed at <b>₹{{room_price}}</b>.</li>
      <li>The tenant has paid a security deposit of <b>₹{{deposit_amount}}</b>, which is refundable upon termination.</li>
      <li>The notice period for termination of this agreement is 30 days from either side.</li>
      <li>NoidaStay Digital Broker acts as the facilitator for this digital agreement and escrow protection.</li>
    </ol>
  </div>

  <div class="signature-box">
    <div class="signature-line">Owner Signature</div>
    <div class="signature-line">Tenant Signature (Aadhaar e-Signed)</div>
  </div>

  <div class="footer">
    This document is digitally generated and hashes for integrity: {{document_hash}}<br>
    NoidaStay DPDP 2023 Compliant Platform
  </div>
</body>
</html>
`;

export function fillTemplate(data: Record<string, string | number>) {
  let template = agreementTemplate;
  Object.entries(data).forEach(([key, value]) => {
    template = template.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  });
  return template;
}
