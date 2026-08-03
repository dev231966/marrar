// src/components/Skeleton.jsx
// Bloco de "esqueleto" genérico e reutilizável, para qualquer secção que
// espera dados do backend. Uso: <Skeleton width="60%" height="14px" />

export default function Skeleton({ width = '100%', height = '16px', radius = '8px', style = {} }) {
  return (
    <span
      className="skeleton-block"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}
