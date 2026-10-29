import { BOTAO_SECUNDARIO } from "../../consts/estilos"
import { lerImagem } from "../../helpers/imagem"

interface Props {
  rotulo: string
  valor: string
  maxLado: number
  onChange: (v: string) => void
  onErro: (m: string) => void
}

export default function SeletorImagem({ rotulo, valor, maxLado, onChange, onErro }: Props) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-eco-field p-3">
      <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-eco-blue-soft">
        {valor ? <img src={valor} alt="" className="h-full w-full object-contain" /> : <span className="font-sora text-[10px] text-eco-gray">Padrão</span>}
      </div>
      <p className="font-sora flex-1 text-sm font-bold text-eco-blue">{rotulo}</p>
      {valor && <button type="button" onClick={() => onChange("")} className="font-sora cursor-pointer text-xs font-bold text-eco-gray underline">Remover</button>}
      <label className={`${BOTAO_SECUNDARIO} !py-2`}>
        Trocar
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={async (e) => {
            const arquivo = e.target.files?.[0]
            e.target.value = ""
            if (!arquivo) return
            try { onChange(await lerImagem(arquivo, maxLado)) } catch (err) { onErro(err instanceof Error ? err.message : "Imagem inválida.") }
          }}
        />
      </label>
    </div>
  )
}
