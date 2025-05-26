/** @format */

const viewer = document.getElementById("pdf-viewer");
const loading = document.getElementById("loading");
const languageSelect = document.getElementById("language");
const title = document.getElementById("title");

const translations = {
  uz: {
    file: "pdfs/book-uz.pdf",
    title: "Jizzax mo'jizalar o'lkasi",
  },
  ru: {
    file: "pdfs/book-ru.pdf",
    title: "Джизак, страна чудес",
  },
  en: {
    file: "pdfs/book-en.pdf",
    title: "Jizzakh, a wonderland",
  },
};

let pdfDoc = null;
let currentPage = 1;
let isLoading = false;
let totalPages = 0;
let currentLang = "uz";

function loadPDF(langCode) {
  currentLang = langCode;
  title.textContent = translations[langCode].title;
  viewer.innerHTML = ""; // tozalash
  currentPage = 1;
  isLoading = false;
  pdfjsLib.getDocument(translations[langCode].file).promise.then((pdf) => {
    pdfDoc = pdf;
    totalPages = pdf.numPages;
    loadNextPage();
  });
}

function loadNextPage() {
  if (isLoading || currentPage > totalPages) return;
  isLoading = true;
  loading.style.display = "block";

  pdfDoc.getPage(currentPage).then((page) => {
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    page.render(renderContext).promise.then(() => {
      viewer.appendChild(canvas);
      currentPage++;
      isLoading = false;
      loading.style.display = "none";
    });
  });
}

// Scroll event orqali yuklab ketish
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY + window.innerHeight;
  const documentHeight = document.body.offsetHeight;
  if (scrollY + 100 >= documentHeight) {
    loadNextPage();
  }
});

// Til o‘zgarsa — qaytadan yuklash
languageSelect.addEventListener("change", () => {
  loadPDF(languageSelect.value);
});

// Boshlanishida yuklash
loadPDF("uz");
