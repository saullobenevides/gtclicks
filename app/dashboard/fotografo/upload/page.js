import UploadDashboard from "./UploadDashboard";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Dashboard do Fotografo | Upload",
};

export default function PhotographerUploadPage() {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-12">
      <div className="text-center pb-8 border-b">
        <Badge>Upload</Badge>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold my-4 bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">Envie fotos individuais ou crie colecoes completas</h1>
        <p className="text-lg text-body max-w-3xl mx-auto">
          Colete os links assinados via /api/upload, organize as fotos em colecoes existentes ou crie uma nova serie. Se preferir, mantenha-as como itens avulsos e publique em poucos cliques.
        </p>
      </div>
      <UploadDashboard />
    </section>
  );
}
