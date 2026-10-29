// Lê uma imagem, reduz para caber em "maxLado" e devolve como data URL
export async function lerImagem(arquivo: File, maxLado: number): Promise<string> {
  if (!/^image\/(png|jpeg|webp)$/.test(arquivo.type)) throw new Error("Use uma imagem PNG, JPG ou WebP.")
  const bitmap = await createImageBitmap(arquivo)
  const escala = Math.min(1, maxLado / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(bitmap.width * escala)
  canvas.height = Math.round(bitmap.height * escala)
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const url = canvas.toDataURL(arquivo.type === "image/png" ? "image/png" : "image/webp", 0.85)
  if (url.length > 1_300_000) throw new Error("Imagem muito pesada. Escolha uma menor.")
  return url
}
