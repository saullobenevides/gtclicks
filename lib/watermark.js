export async function addWatermark(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Configure watermark style
      const fontSize = Math.max(24, Math.floor(img.width * 0.05)); // 5% of width
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Add watermark text (repeated pattern)
      const text = "GT Clicks";
      const stepX = canvas.width / 3;
      const stepY = canvas.height / 3;

      ctx.save();
      ctx.rotate((-30 * Math.PI) / 180); // Rotate -30 degrees

      for (let x = -canvas.width; x < canvas.width * 2; x += stepX) {
        for (let y = -canvas.height; y < canvas.height * 2; y += stepY) {
          ctx.fillText(text, x, y);
        }
      }

      ctx.restore();

      // Convert back to file
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const watermarkedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(watermarkedFile);
          } else {
            reject(new Error("Failed to generate watermark blob"));
          }
        },
        "image/jpeg",
        0.85 // Quality
      );
    };
    img.onerror = reject;
  });
}
