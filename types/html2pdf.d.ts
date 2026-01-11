declare module "html2pdf.js" {
  import type { Options as Html2CanvasOptions } from "html2canvas";

  export interface Html2PdfOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: { type?: string; quality?: number };
    html2canvas?: Partial<Html2CanvasOptions>;
    jsPDF?: {
      unit?: "pt" | "mm" | "cm" | "in";
      format?: string | [number, number];
      orientation?: "portrait" | "landscape";
    };
    pagebreak?: { mode?: string[] | string };
  }

  export interface Html2PdfInstance {
    set: (options: Html2PdfOptions) => Html2PdfInstance;
    from: (element: HTMLElement | string) => Html2PdfInstance;
    toPdf: () => Html2PdfInstance;
    save: (filename?: string) => Promise<void>;
    outputPdf: (type: string, options?: any) => any;
  }

  function html2pdf(): Html2PdfInstance;

  export default html2pdf;
}
