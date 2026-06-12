import type { Request, Response } from "express";
import * as certificationService from "./certification.service";

export async function listCertificatesHandler(req: Request, res: Response) {
  const certificates = await certificationService.listCertificates(req.user!.id);
  res.json({ certificates });
}

export async function getCertificateHandler(req: Request, res: Response) {
  const certificate = await certificationService.getCertificate(req.user!.id, req.params.id);
  res.json({ certificate });
}

export async function downloadCertificatePdfHandler(req: Request, res: Response) {
  const { buffer, filename } = await certificationService.generateCertificatePdf(req.user!.id, req.params.id);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(buffer);
}

export async function verifyCertificateHandler(req: Request, res: Response) {
  const result = await certificationService.verifyCertificate(req.params.serialNumber);
  res.json(result);
}
