// utils/sampleDiagonalColors.js
export async function sampleDiagonalColors(bgNode, cardNode, numStops = 12) {
  let ctx, w, h;

  if (bgNode.tagName === "CANVAS") {
    ctx = bgNode.getContext("2d");
    w = bgNode.width;
    h = bgNode.height;
  } else {
    const style = getComputedStyle(bgNode);
    const urlMatch = style.backgroundImage.match(/url\(["']?(.*?)["']?\)/);
    if (!urlMatch) return Array(numStops).fill("rgba(241,143,1,0.15)");
    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = urlMatch[1];

    await new Promise(resolve => {
      img.onload = resolve;
      img.onerror = resolve;
    });

    w = bgNode.offsetWidth;
    h = bgNode.offsetHeight;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = w;
    tempCanvas.height = h;
    ctx = tempCanvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);
  }

  const cardRect = cardNode.getBoundingClientRect();
  const bgRect   = bgNode.getBoundingClientRect();
  const stops = Array.from({ length: numStops }, (_, i) => i / (numStops - 1));
  return stops.map(t => {
    const x = Math.round(cardRect.left - bgRect.left + cardRect.width * t);
    const y = Math.round(cardRect.top - bgRect.top  + cardRect.height * t);
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
    return `rgb(${r},${g},${b})`;
  });
}
