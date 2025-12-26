import EXIF from 'exif-js';

export const extractMetadata = (file) => {
  return new Promise((resolve) => {
    EXIF.getData(file, function() {
      const make = EXIF.getTag(this, "Make");
      const model = EXIF.getTag(this, "Model");
      const iso = EXIF.getTag(this, "ISOSpeedRatings");
      const focalLength = EXIF.getTag(this, "FocalLength");
      const aperture = EXIF.getTag(this, "FNumber");
      const shutterSpeed = EXIF.getTag(this, "ExposureTime");
      const lens = EXIF.getTag(this, "LensModel") || EXIF.getTag(this, "LensInfo");
      
      let formattedShutterSpeed = null;
      if (shutterSpeed) {
        if (shutterSpeed < 1) {
          formattedShutterSpeed = `1/${Math.round(1/shutterSpeed)}`;
        } else {
          formattedShutterSpeed = `${shutterSpeed}`;
        }
      }
      
      resolve({ 
        camera: make && model ? `${make} ${model}` : (model || make || null), 
        lens, 
        focalLength: focalLength ? `${focalLength}mm` : null, 
        iso, 
        shutterSpeed: formattedShutterSpeed, 
        aperture: aperture ? `f/${aperture}` : null 
      });
    });
  });
};
