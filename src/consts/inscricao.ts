export interface PassoInscricao {
  numero: number;
  titulo: string;
  descricao: string;
}

export const PASSOS_INSCRICAO: PassoInscricao[] = [
  {
    numero: 1,
    titulo: "Acesse o formulário",
    descricao:
      "Clique no botão abaixo para ser redirecionado ao formulário oficial de inscrição.",
  },
  {
    numero: 2,
    titulo: "Preencha seus dados",
    descricao:
      "Informe nome completo, e-mail, instituição e demais dados solicitados no formulário.",
  },
  {
    numero: 3,
    titulo: "Escolha suas atividades",
    descricao:
      "Selecione as palestras, minicursos e atividades das quais deseja participar.",
  },
  {
    numero: 4,
    titulo: "Envie e confirme",
    descricao:
      "Envie o formulário e aguarde o e-mail de confirmação da sua inscrição.",
  },
];

export const LINK_INSCRICAO = "https://forms.gle/exemplo-inscricao-ecotech";