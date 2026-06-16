export function LeaderName({ name }: { name?: string | null }) {
  if (!name) return null;
  const parts = name.split(" // ");
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}
