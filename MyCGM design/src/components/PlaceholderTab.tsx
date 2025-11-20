interface PlaceholderTabProps {
  title: string;
}

export function PlaceholderTab({ title }: PlaceholderTabProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="text-center">
        <h2 className="text-gray-400 mb-2">{title}</h2>
        <p className="text-gray-300 text-sm">Coming soon...</p>
      </div>
    </div>
  );
}
