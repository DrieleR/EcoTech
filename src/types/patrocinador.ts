interface Patrocinador {
    nome: string
    logo: string
}

export const master: Patrocinador = {nome: "Vale", logo: "/logos/vale.png"}

export const ouro: Patrocinador[] = [
    {nome: 'Google', logo: '/logos/google.png'},
    {nome: 'Microsoft', logo: '/logos/microsoft.png'},
    {nome: 'Petrobras', logo: '/logos/petrobras.png'},
]

export const prata: Patrocinador[] = [
    {nome: 'Amazon Web Services', logo: '/logos/aws.png'},
    {nome: 'IBM', logo: '/logos/ibm.png'},
    {nome: 'Nubank', logo: '/logos/nubank.png'},
    {nome: 'Equatorial Energia', logo: '/logos/equatorial.png'},
    {nome: 'Hotmart', logo: '/logos/hotmart.png'},
]

export type tamanho = 'normal' | 'big'