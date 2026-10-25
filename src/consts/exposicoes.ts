import type { Categoria, Filtro, Trabalho } from "../types/exposicoes";
import monitoramentoAmbiental from "../assets/exposicoes/artigo-monitoramento-ambiental.webp";
import segurancaIot from "../assets/exposicoes/artigo-seguranca-iot.webp";
import dadosClimaticos from "../assets/exposicoes/poster-dados-climaticos.webp";
import ensinoDistancia from "../assets/exposicoes/poster-ensino-distancia.webp";
import extensaoUniversitaria from "../assets/exposicoes/poster-extensao-universitaria.webp";
import educacaoCampo from "../assets/exposicoes/poster-educacao-campo.webp";
import gestaoAcademica from "../assets/exposicoes/projeto-gestao-academica.webp";
import appAcessibilidade from "../assets/exposicoes/projeto-app-acessibilidade.webp";
import robosReutilizaveis from "../assets/exposicoes/projeto-robos-reutilizaveis.webp";
import maqueteSaneamento from "../assets/exposicoes/projeto-maquete-saneamento.webp";

export const FILTROS: Filtro[] = [
    "Todos", "Artigos", "Pôsteres", "Projetos"
];

export const FILTRO_PARA_CATEGORIA: Record<Filtro, Categoria | null> = {
  Todos: null,
  Artigos: "Artigo",
  Pôsteres: "Pôster",
  Projetos: "Projeto",
};

export const CORES_TAG: Record<Categoria, string> = {
  Artigo: "bg-eco-blue",
  Projeto: "bg-eco-green-light",
  Pôster: "bg-eco-green-dark",
};

export const TRABALHOS: Trabalho[] = [
  {
    categoria: "Artigo",
    titulo: "IA Aplicada ao Monitoramento Ambiental na Amazônia",
    autores: "L. Fernandes, R. Tavares",
    imagem: monitoramentoAmbiental,
    alt: "Estudante apresenta o trabalho a um visitante, com um notebook mostrando slides sobre a mesa",
  },
  {
    categoria: "Projeto",
    titulo: "Sistema de Gestão Acadêmica com Microsserviços",
    autores: "T. Andrade",
    imagem: gestaoAcademica,
    alt: "Equipe de quatro estudantes ao lado de uma mesa com notebook e tablet, sorrindo para a foto",
  },
  {
    categoria: "Pôster",
    titulo: "Análise de Dados Climáticos com Machine Learning",
    autores: "C. Nogueira, P. Lima",
    imagem: dadosClimaticos,
    alt: "Estudante explica um pôster científico com gráficos para colegas",
  },
  {
    categoria: "Projeto",
    titulo: "App de Acessibilidade para Pessoas com Def. Visual",
    autores: "M. Rocha",
    imagem: appAcessibilidade,
    alt: "Três estudantes montando protótipos eletrônicos com sensores sobre uma mesa",
  },
  {
    categoria: "Artigo",
    titulo: "Segurança em Redes IoT para Áreas Rurais",
    autores: "B. Castro",
    imagem: segurancaIot,
    alt: "Montagem de fotos com estudantes apresentando trabalhos em notebooks e em um quadro branco",
  },
  {
    categoria: "Pôster",
    titulo: "Plataforma Colaborativa de Ensino a Distância",
    autores: "F. Almeida, J. Souza",
    imagem: ensinoDistancia,
    alt: "Mural com vários pôsteres de projetos expostos lado a lado em uma parede",
  },
  {
    categoria: "Pôster",
    titulo: "Extensão Universitária e Inclusão Digital",
    autores: "A. Pinheiro, D. Carvalho, S. Lobo",
    imagem: extensaoUniversitaria,
    alt: "Grupo de estudantes e professores posando em frente aos pôsteres de uma mostra de extensão",
  },
  {
    categoria: "Pôster",
    titulo: "Tecnologia e Educação no Campo",
    autores: "R. Pantoja, E. Moraes",
    imagem: educacaoCampo,
    alt: "Corredor com banners de pesquisa expostos em suportes, decorado com balões",
  },
  {
    categoria: "Projeto",
    titulo: "Robôs Feitos com Materiais Reutilizáveis",
    autores: "Turma de Robótica Educacional",
    imagem: robosReutilizaveis,
    alt: "Robôs feitos com caixas de leite, papelão e Arduino expostos sobre uma mesa",
  },
  {
    categoria: "Projeto",
    titulo: "Maquete de Saneamento e Reaproveitamento de Água",
    autores: "L. Souza, M. Ferreira, C. Dias",
    imagem: maqueteSaneamento,
    alt: "Estudantes de jaleco apresentam uma maquete de casa com jardim a um visitante",
  },
];