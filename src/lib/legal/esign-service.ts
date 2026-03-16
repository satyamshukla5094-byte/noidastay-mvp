import crypto from "crypto";

export interface EsignRequest {
  pdfBuffer: Buffer;
  signerName: string;
  signerEmail?: string;
  signerPhone?: string;
  documentName: string;
}

export interface EsignResponse {
  signingUrl: string;
  documentId: string;
}

/**
 * Mock Service Wrapper for Signzy/Digio Aadhaar e-Sign API
 * In a real production environment, this would hit the provider's 
 * /v1/esign/request endpoint.
 */
export async function initiateEsign(request: EsignRequest): Promise<EsignResponse> {
  const SIGNZY_API_KEY = process.env.SIGNZY_API_KEY;
  
  if (!SIGNZY_API_KEY) {
    console.warn("SIGNZY_API_KEY missing - returning mock signing session");
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockDocId = crypto.randomBytes(16).toString("hex");
    
    return {
      // In a real flow, the user would be redirected to the provider's Aadhaar OTP page
      signingUrl: `/dashboard/agreement/sign-mock?docId=${mockDocId}`,
      documentId: mockDocId
    };
  }

  // Real Signzy/Digio integration logic would go here
  // const response = await fetch("https://api.signzy.app/api/v3/esign", { ... });
  
  throw new Error("Signzy integration pending configuration");
}

/**
 * Verify if the document was signed successfully
 */
export async function verifyEsignStatus(documentId: string): Promise<boolean> {
  // Mock verification
  return true;
}
