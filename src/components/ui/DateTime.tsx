type DateTimeProps = {
  value: string | Date;
  variant?: "date" | "datetime" | "time";
  className?: string;
};

export function DateTime({ value, variant = "date", className }: DateTimeProps) {
  const date = value instanceof Date ? value : new Date(value);

  const options: Intl.DateTimeFormatOptions =
    variant === "datetime"
      ? { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }
      : variant === "time"
        ? { hour: "numeric", minute: "2-digit" }
        : { month: "short", day: "numeric", year: "numeric" };

  return (
    <time dateTime={date.toISOString()} className={className}>
      {new Intl.DateTimeFormat("en-US", options).format(date)}
    </time>
  );
}
