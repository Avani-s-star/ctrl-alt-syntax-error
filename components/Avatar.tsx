const colors = ["bg-sky-500", "bg-emerald-500", "bg-fuchsia-500", "bg-amber-500", "bg-rose-500", "bg-indigo-500"];

export default function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const i = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
  return (
    <span
      style={{ width: size, height: size }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${colors[i]}`}
    >
      {name[0]?.toUpperCase()}
    </span>
  );
}