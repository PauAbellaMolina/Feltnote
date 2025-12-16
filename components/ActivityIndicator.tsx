export function ActivityIndicator() {
  return (
    <div
      className="
        w-5 h-5
        rounded-full
        border-[5px] border-[rgba(25,118,210,0.2)]
        border-t-[5px] border-t-[#1976d2]
        animate-spin
      "
      aria-label="Loading"
      role="status"
    />
  );
}
