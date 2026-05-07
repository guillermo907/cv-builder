declare module "pdf-parse" {
  export type PdfParseResult = {
    text: string;
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: unknown;
    version: string;
  };

  export default function pdfParse(dataBuffer: Buffer): Promise<PdfParseResult>;
}
