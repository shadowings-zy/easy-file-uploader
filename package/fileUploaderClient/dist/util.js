export function getBlobSlice() {
    return File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
}
