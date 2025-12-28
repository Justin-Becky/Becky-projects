// Liste des noms de fichiers dans le dossier photos
const imageList = [
    "A25F1C69-55CA-4F49-84F9-820B7C488343.jpg",
  "AFKUE1042.JPG",
  "CF733E09-3830-4A3D-8EDF-8D42B5326F86.jpg",
  "GHSY8223 - Copy.JPG",
  "GQFX6226.JPG",
  "IMG_2814.png",
  "IMG_2893.png",
  "IMG_2898.png",
  "IMG_3480.png",
  "IMG_3511.png",
  "IMG_3689.png",
  "IMG_3690.png",
  "IMG_3715.png",
  "IMG_4163.png",
  "IMG_4165.png",
  "IMG_4217.JPG",
  "IMG_4219.JPG",
  "IMG_5078.JPG",
  "IMG_5490.JPG",
  "IMG_5521.JPG",
  "IMG_5564-Copy.jpg",
  "IMG_5614.JPG",
  "IMG_5629.jpg",
  "IMG_5631.jpg",
  "IMG_5873.JPG",
  "IMG_5874.JPG",
  "IMG_5895.JPG",
  "IMG_5959.JPG",
  "IMG_6088.jpg",
  "IMG_6383.jpg",
  "IMG_6423.PNG",
  "IMG_6424.PNG",
  "IMG_6429.PNG",
  "IMG_6441.jpg",
  "IMG_6455.jpg",
  "IMG_6456.jpg",
  "IMG_6465.jpg",
  "IMG_E2899.jpg",
];



// Sélectionne la galerie dans le HTML
const gallery = document.querySelector(".gallery");

// Ajoute chaque image dans la galerie
imageList.forEach(filename => {
  const img = document.createElement("img");
  img.src = `photos/${filename}`;
  img.alt = filename;
  img.classList.add("gallery-img");
  gallery.appendChild(img);
});

// Option : agrandir l'image en cliquant
document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll(".gallery-img");

  images.forEach(img => {
    img.addEventListener("click", () => {
      const overlay = document.createElement("div");
      overlay.classList.add("overlay");

      const bigImg = document.createElement("img");
      bigImg.src = img.src;
      bigImg.alt = img.alt;

      overlay.appendChild(bigImg);
      document.body.appendChild(overlay);

      overlay.addEventListener("click", () => {
        overlay.remove();
      });
    });
  });
});
