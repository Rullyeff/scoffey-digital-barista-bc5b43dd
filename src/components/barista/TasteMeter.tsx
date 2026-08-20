export function TasteMeter({ label, value }: { label: string; value: number }) {
  const filled = Math.round(value);
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={`h-2.5 w-2.5 rounded-full ${
              n <= filled ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </span>
    </div>
  );
}
