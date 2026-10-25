export type Filtro = "Todos" | "Artigos" | "Pôsteres" | "Projetos";
export type Categoria = "Artigo" | "Projeto" | "Pôster";

export interface Trabalho {
  categoria: Categoria;
  titulo: string;
  autores: string;
  imagem: string;
  // Descrição da foto para leitores de tela
  alt: string;
}
