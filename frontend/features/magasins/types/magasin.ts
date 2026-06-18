export type EmplacementMagasin = {
  idEmplacement: number;
  idMagasin: number;
  code: string;
  libelle: string;
  actif: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Magasin = {
  idMagasin: number;
  code: string;
  libelle: string;
  actif: boolean;
  createdAt?: string;
  updatedAt?: string;
  emplacements?: EmplacementMagasin[];
};

export type CreateMagasinDto = {
  code: string;
  libelle: string;
  actif?: boolean;
};

export type UpdateMagasinDto = Partial<CreateMagasinDto>;

export type CreateEmplacementMagasinDto = {
  code: string;
  libelle: string;
  actif?: boolean;
};

export type UpdateEmplacementMagasinDto =
  Partial<CreateEmplacementMagasinDto>;