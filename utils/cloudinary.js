const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export const uploads = (file, folder) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(
      file,
      // {
      //   effect: 'overlay',
      //   overlay: 'thebrick_sxyagd',
      //   radius: 'max',
      //   width: 150,
      //   opacity: 100,
      //   x: 100,
      //   y: 30,
      // },
      (result) => {
        resolve(result.url);
      },
      {
        resource_type: "auto",
        folder: folder,
      }
    );
  });
};
