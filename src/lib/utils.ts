import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function loadScript(src: string, id?: string): Promise<HTMLScriptElement> {
  return new Promise((resolve, reject) => {
    // Check if script already exists
    if (id && document.getElementById(id)) {
      const existingScript = document.getElementById(id) as HTMLScriptElement;
      resolve(existingScript);
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    
    if (id) {
      script.id = id;
    }

    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    
    document.head.appendChild(script);
  });
}
