export default function AvisoConflito({ colegas }) {
  if (!colegas || colegas.length === 0) return null;

  return (
    <span className="aviso-conflito" title={`Coincide com: ${colegas.join(", ")}`}>
      Coincide com {colegas.join(", ")}
    </span>
  );
}
