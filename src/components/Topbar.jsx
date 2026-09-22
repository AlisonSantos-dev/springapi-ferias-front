import { useAuth } from "../context/AuthContext";

export default function Topbar({ title, children }) {
  const { nome } = useAuth();

  return (
    <div className="topbar">
      <h1>{title}</h1>
      <div className="topbar-actions">
        {nome && <span>Ola, {nome}</span>}
        {children}
      </div>
    </div>
  );
}
