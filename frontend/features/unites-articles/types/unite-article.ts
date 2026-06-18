export type UniteArticle = {
  idUniteArticle: number;
  code: string;
  libelle: string;
};

export type CreateUniteArticleDto = {
  code: string;
  libelle: string;
};

export type UpdateUniteArticleDto = Partial<CreateUniteArticleDto>;