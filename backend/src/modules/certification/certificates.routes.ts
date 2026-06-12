import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  downloadCertificatePdfHandler,
  getCertificateHandler,
  listCertificatesHandler,
  verifyCertificateHandler,
} from "./certificates.controller";

export const certificatesRouter = Router();

// Vérification publique d'un certificat à partir de son numéro de série
// (aucune authentification requise, ne révèle aucune information sensible).
certificatesRouter.get("/verify/:serialNumber", asyncHandler(verifyCertificateHandler));

certificatesRouter.use(authenticate);
certificatesRouter.get("/", asyncHandler(listCertificatesHandler));
certificatesRouter.get("/:id", asyncHandler(getCertificateHandler));
certificatesRouter.get("/:id/pdf", asyncHandler(downloadCertificatePdfHandler));
