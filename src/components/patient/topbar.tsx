export default function PatientTopbar({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
      <div>
        <h1 className="text-base font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
      {right && <div className="flex items-center gap-3">{right}</div>}
    </header>
  );
}
