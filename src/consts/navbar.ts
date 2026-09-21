export interface NavLinkItem {
    to: string
    label: string
}

export const links: NavLinkItem[] = [
    {to: '/', label: 'Inicio'},
    { to: "/sobre", label: "Sobre" },
    { to: "/cronograma", label: "Cronograma" },
    { to: "/palestras", label: "Palestras" },
    { to: "/exposicoes", label: "Exposições" },
    { to: "/local", label: "Local" },
    { to: "/patrocinadores", label: "Patrocinadores" },
    { to: "/parceiros", label: "Parceiros" },
    { to: "/inscricao", label: "Inscrição" },
]