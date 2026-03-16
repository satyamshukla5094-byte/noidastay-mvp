import { loadScript } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export async function loadRazorpay(): Promise<any> {
  if (window.Razorpay) {
    return window.Razorpay;
  }

  try {
    await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js",
      "razorpay-script"
    );
    
    if (window.Razorpay) {
      return window.Razorpay;
    } else {
      throw new Error("Razorpay object not found after script load");
    }
  } catch (error) {
    throw new Error("Failed to load Razorpay script");
  }
}
