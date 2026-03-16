import { loadScript } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export async function loadRazorpay(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }

    const script = loadScript(
      "https://checkout.razorpay.com/v1/checkout.js",
      "razorpay-script"
    );

    script.onload = () => {
      if (window.Razorpay) {
        resolve(window.Razorpay);
      } else {
        reject(new Error("Failed to load Razorpay"));
      }
    };

    script.onerror = () => {
      reject(new Error("Failed to load Razorpay script"));
    };
  });
}
