const LABELS = {
  PENDENTE: "Pendente",
  APROVADO: "Aprovado",
  REJEITADO: "Rejeitado",
};

const CLASSES = {
  PENDENTE: "badge-pendente",
  APROVADO: "badge-aprovado",
  REJEITADO: "badge-rejeitado",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`badge ${CLASSES[status] || ""}`}>{LABELS[status] || status}</span>
  );
}
