import * as pdfjsLib from "pdfjs-dist";
import PdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker';

pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();

export { pdfjsLib };
