export default function Loading(): React.ReactElement {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-amber-500" />
    </div>
  );
}
