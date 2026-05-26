export function StatusMessage({
  success,
  error,
}: {
  success?: string;
  error?: string;
}) {
  if (!success && !error) {
    return null;
  }

  return (
    <div
      className={`mb-5 border px-4 py-3 text-sm font-semibold ${
        success
          ? "border-[#00a86b]/30 bg-[#e8fff4] text-[#075f3f]"
          : "border-[#8b2f2b]/30 bg-[#fff1ed] text-[#8b2f2b]"
      }`}
    >
      {success ? "Registro salvo com sucesso." : error}
    </div>
  );
}
