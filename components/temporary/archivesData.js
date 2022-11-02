import { v4 as uuidv4 } from "uuid";

let archivesData = [
  {
    title: "Vincent van Gogh, The Potato Eaters, 1885",
    coverImg: "https://iiif.micr.io/yzksg/full/1280,/0/default.jpg",
    websiteLink: "https://www.vangoghmuseum.nl/en/collection/s0005V1962",
  },
  {
    title: "Vincent van Gogh, Garden with Courting Couples: Square Saint-Pierre, 1887",
    coverImg: "https://iiif.micr.io/wTQHw/full/1280,/0/default.jpg",
    websiteLink: "https://www.vangoghmuseum.nl/en/collection/s0022V1962",
  },
  {
    title: "Vincent van Gogh, Self-Portrait as a Painter, 1888",
    coverImg: "https://iiif.micr.io/qDCTO/full/1280,/0/default.jpg",
    websiteLink: "https://www.vangoghmuseum.nl/en/collection/s0019V1962",
  },
  {
    title: "Vincent van Gogh, The Langlois Bridge, 1888",
    coverImg: "https://iiif.micr.io/rzhJC/full/1280,/0/default.jpg",
    websiteLink: "https://www.vangoghmuseum.nl/en/collection/s0027V1962",
  },
  {
    title: "Vincent van Gogh, The Sower, 1888",
    coverImg: "https://iiif.micr.io/PoVJv/full/1280,/0/default.jpg",
    websiteLink: "https://www.vangoghmuseum.nl/en/collection/s0029V1962",
  },
  {
    title: "Vincent van Gogh, Sunflowers, 1889",
    coverImg: "https://iiif.micr.io/TZCqF/full/1280,/0/default.jpg",
    websiteLink: "https://www.vangoghmuseum.nl/en/collection/s0031V1962",
  },
  {
    title: "Vincent van Gogh, The Yellow House (The Street), 1888",
    coverImg: "https://iiif.micr.io/NyxcG/full/1280,/0/default.jpg",
    websiteLink: "https://www.vangoghmuseum.nl/en/collection/s0032V1962",
  },
  {
    title: "Vincent van Gogh, The Bedroom, 1888",
    coverImg: "https://iiif.micr.io/ZKSPH/full/1280,/0/default.jpg",
    websiteLink: "https://www.vangoghmuseum.nl/en/collection/s0047V1962",
  },
];

archivesData = archivesData.map((archiveProject) => ({
  ...archiveProject,
  id: uuidv4(),
}));

export default archivesData;
