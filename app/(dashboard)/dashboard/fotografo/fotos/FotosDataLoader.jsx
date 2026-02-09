import { getFotosByUserId } from "./_data-access/fotos";
import FotosContent from "./_components/FotosContent";

export default async function FotosDataLoader({ userId }) {
  const fotos = await getFotosByUserId(userId);
  return <FotosContent fotos={fotos} />;
}
