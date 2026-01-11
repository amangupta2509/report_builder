declare module "html2pdf.js" {
  import type { Options as Html2CanvasOptions } from "html2canvas";

  export interface Html2PdfOptions {
?: { mode?: string[] | string };
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
