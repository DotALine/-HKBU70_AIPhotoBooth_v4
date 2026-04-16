export const resizeImage = (base64Str: string, maxWidth: number = 1024, maxHeight: number = 1024): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => resolve(base64Str);
    img.src = base64Str;
  });
};

export const fetchWithResilientProxy = async (url: string): Promise<string> => {
  const proxies = [
    (u: string) => `https://images.weserv.nl/?url=${encodeURIComponent(u.replace(/^https?:\/\//, ''))}`,
    (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    (u: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
    (u: string) => `https://thingproxy.freeboard.io/fetch/${u}`
  ];

  console.log(`Starting resilient fetch for: ${url}`);

  for (const proxyFn of proxies) {
    const proxyUrl = proxyFn(url);
    try {
      console.log(`Trying proxy: ${proxyUrl}`);
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        console.warn(`Proxy returned status ${response.status}: ${proxyUrl}`);
        continue;
      }
      const blob = await response.blob();
      
      // Basic check to ensure we got an image
      if (blob.size < 100) {
        console.warn(`Proxy returned empty or too small blob (${blob.size} bytes): ${proxyUrl}`);
        continue; 
      }

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          console.log(`Successfully fetched and converted image via: ${proxyUrl}`);
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn(`Proxy fetch failed: ${proxyUrl}`, e);
    }
  }
  throw new Error("All proxies failed to fetch image. Please check your internet connection or try a different background.");
};

/* Adds a watermark image to a base64 image string.
 * Places the watermark at the bottom‑right corner with optional transparency and shadow.
 */
export const addWatermarkToImage = (base64Str: string, watermarkUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Load the main image
    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // 1. Draw the original image
      ctx.drawImage(img, 0, 0);

      const loadWatermarkImage = async (url: string): Promise<HTMLImageElement> => {
        return new Promise((res, rej) => {
          const wImg = new Image();
          // Don't set crossOrigin here if we're using a data URL or blob URL
          if (!url.startsWith('data:') && !url.startsWith('blob:')) {
            wImg.crossOrigin = "anonymous";
          }
          wImg.onload = () => res(wImg);
          wImg.onerror = (err) => {
            console.error("Watermark image load error:", err);
            rej(err);
          };
          wImg.src = url;
        });
      };

      try {
        let watermarkImg: HTMLImageElement;
        try {
          // Try direct load first
          watermarkImg = await loadWatermarkImage(watermarkUrl);
        } catch (e) {
          console.warn("Direct watermark load failed, trying resilient proxies...");
          const base64Data = await fetchWithResilientProxy(watermarkUrl);
          watermarkImg = await loadWatermarkImage(base64Data);
        }

        // 2. Calculate dimensions and position
        const maxWidth = canvas.width * 0.30;  // Increased from 25% to 30% (120% of original)
        const maxHeight = canvas.height * 0.30; 
        
        // Define w and h here so they aren't "undefined"
        let w = watermarkImg.width;
        let h = watermarkImg.height;
        const ratio = w / h;

        if (w > maxWidth) {
          w = maxWidth;
          h = w / ratio;
        }
        if (h > maxHeight) {
          h = maxHeight;
          w = h * ratio;
        }

        // Position at the bottom right, with some padding from the bottom
        const padding = 20; 
        const x = canvas.width - w - padding;
        const y = canvas.height - h - padding;

        // 3. Apply transparency and draw
        ctx.save();
        ctx.globalAlpha = 0.9;
        
        // TIGHTER SHADOW
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 2; 
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 1;

        // Draw the watermark image
        ctx.drawImage(watermarkImg, x, y, w, h);

        ctx.restore();

        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        console.warn("Watermark process failed, returning image without watermark:", err);
        resolve(canvas.toDataURL('image/png')); // fallback: return original image
      }
    };

    img.onerror = (err) => {
      console.error("Original image failed to load for watermarking:", err);
      reject(err);
    };

    img.src = base64Str;
  });
};
