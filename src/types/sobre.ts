export interface ItemSobre {
  titulo: string
  descricao: string
}

// Parceiro ou patrocinador. logo: caminho (/logos/x.png), URL ou data URL; "" = sem logo
export interface Entidade {
  id: string
  nome: string
  logo: string
}

export interface ConfigSobre {
  titulo: string
  texto: string
  itens: ItemSobre[]
  parceiros: Entidade[]
  patrocinadores: {
    master: Entidade[] // no máximo 1
    ouro: Entidade[]
    prata: Entidade[]
  }
}
