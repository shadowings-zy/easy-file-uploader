export function getBlobSlice() {
  return (
    File.prototype.slice ||
    (File.prototype as any).mozSlice ||
    (File.prototype as any).webkitSlice
  );
}
