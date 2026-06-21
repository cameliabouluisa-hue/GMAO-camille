import 'dotenv/config';
import { PrismaClient, Prisma } from '../generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

function getMysqlConfig() {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    const url = new URL(databaseUrl);

    return {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace('/', ''),
      connectionLimit: 5,
    };
  }

  return {
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT || 3306),
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'gmao_bmt',
    connectionLimit: 5,
  };
}

const adapter = new PrismaMariaDb(getMysqlConfig());

const prisma = new PrismaClient({ adapter });

const D = (value: string | number) => new Prisma.Decimal(value);

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function time(hour: number, minute = 0) {
  return new Date(`1970-01-01T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00.000Z`);
}

async function cleanBusinessData() {
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

  await prisma.historique_declenchement_preventif.deleteMany();
  await prisma.historique_etat_intervention.deleteMany();
  await prisma.historique_etat_demande_intervention.deleteMany();
  await prisma.compte_rendu_intervention.deleteMany();
  await prisma.anomalie_intervention.deleteMany();
  await prisma.occupation_intervention.deleteMany();
  await prisma.affectation_technicien.deleteMany();
  await prisma.moyen_intervention.deleteMany();
  await prisma.sous_traitance_intervention.deleteMany();
  await prisma.fourniture_intervention.deleteMany();
  await prisma.consommation.deleteMany();
  await prisma.adresse_intervention.deleteMany();
  await prisma.securite_intervention.deleteMany();
  await prisma.operation_intervention.deleteMany();

  await prisma.sortie_stock_ligne.deleteMany();
  await prisma.sortie_stock.deleteMany();
  await prisma.entree_stock_ligne.deleteMany();
  await prisma.entree_stock.deleteMany();

  await prisma.mouvement_stock.deleteMany();
  await prisma.stock_article_magasin.deleteMany();
  await prisma.reservation_stock.deleteMany();
  await prisma.ligne_demande_transfert_stock.deleteMany();
  await prisma.demande_transfert_stock.deleteMany();
  await prisma.ligne_reapprovisionnement.deleteMany();
  await prisma.demande_reapprovisionnement.deleteMany();

  await prisma.ligneInventairePrepare.deleteMany();
  await prisma.inventairePrepare.deleteMany();

  await prisma.releve_mesure.deleteMany();

  await prisma.intervention.deleteMany();
  await prisma.demande_intervention.deleteMany();

  await prisma.plan_preventif_declencheur.deleteMany();
  await prisma.plan_preventif.deleteMany();
  await prisma.ppp_declencheur.deleteMany();
  await prisma.modele_plan_preventif_predefini.deleteMany();
  await prisma.plan_preventif_predefini.deleteMany();

  await prisma.point_mesure.deleteMany();
  await prisma.gamme_operation.deleteMany();
  await prisma.gamme.deleteMany();

  await prisma.lien_arborescence.deleteMany();
  await prisma.materiel.deleteMany();
  await prisma.modele.deleteMany();

  await prisma.marque.deleteMany();
  await prisma.fabricant.deleteMany();
  await prisma.type_equipement.deleteMany();
  await prisma.type_materiel.deleteMany();
  await prisma.etat_materiel.deleteMany();
  await prisma.etat_modele.deleteMany();

  await prisma.emplacement_magasin.deleteMany();
  await prisma.magasin.deleteMany();

  await prisma.article.deleteMany();
  await prisma.unite_article.deleteMany();
  await prisma.famille.deleteMany();

  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
}

async function findOrCreateTechnicien(
  matricule: string,
  nom: string,
  idEquipe: number,
  roleEquipe = 'TECHNICIEN',
) {
  const existing = await prisma.technicien.findFirst({
    where: { matricule },
  });

  if (existing) return existing;

  return prisma.technicien.create({
    data: {
      matricule,
      nom,
      idEquipe,
      roleEquipe,
    },
  });
}

async function main() {
  console.log('Nettoyage des anciennes données de démonstration...');
  await cleanBusinessData();

  console.log('Création des référentiels...');

  const etatModeleValide = await prisma.etat_modele.create({
    data: {
      idEtat: 1,
      libelle: 'Validé',
    },
  });

  const etatMaterielExploitation = await prisma.etat_materiel.create({
    data: {
      code: 'EN_SERVICE',
      libelle: 'En service',
    },
  });

  const etatMaterielArret = await prisma.etat_materiel.create({
    data: {
      code: 'A_L_ARRET',
      libelle: 'À l’arrêt',
    },
  });

  const typePortique = await prisma.type_materiel.create({
    data: { libelle: 'Portique portuaire' },
  });

  const typeEngin = await prisma.type_materiel.create({
    data: { libelle: 'Engin de manutention' },
  });

  const typeEquipement = await prisma.type_materiel.create({
    data: { libelle: 'Sous-équipement technique' },
  });

  const typeEquipementPortuaire = await prisma.type_equipement.create({
    data: {
      code: 'EQ-PORTUAIRE',
      libelle: 'Équipement portuaire',
      description: 'Équipements utilisés pour les opérations de manutention portuaire.',
    },
  });

  const typeSousEquipement = await prisma.type_equipement.create({
    data: {
      code: 'SOUS-EQ',
      libelle: 'Sous-équipement',
      description: 'Composants techniques rattachés à un équipement principal.',
    },
  });

  const famEquipement = await prisma.famille.create({
    data: {
      code: 'EQUIPEMENTS-PORTUAIRES',
      libelle: 'Équipements portuaires',
      typeFamille: 'EQUIPEMENT',
      natureAchat: 'GENERAL',
    },
  });

  const famLevage = await prisma.famille.create({
    data: {
      code: 'LEVAGE',
      libelle: 'Systèmes de levage',
      typeFamille: 'EQUIPEMENT',
      natureAchat: 'MECANIQUE',
      parent_id: famEquipement.idFamille,
    },
  });

  const famHydraulique = await prisma.famille.create({
    data: {
      code: 'HYDRAULIQUE',
      libelle: 'Hydraulique',
      typeFamille: 'MIXTE',
      natureAchat: 'HYDRAULIQUE',
    },
  });

  const famElectrique = await prisma.famille.create({
    data: {
      code: 'ELECTRIQUE',
      libelle: 'Électricité et automatisme',
      typeFamille: 'MIXTE',
      natureAchat: 'ELECTRIQUE',
    },
  });

  const famArticles = await prisma.famille.create({
    data: {
      code: 'PIECES-RECHANGE',
      libelle: 'Pièces de rechange',
      typeFamille: 'ARTICLE',
      natureAchat: 'GENERAL',
    },
  });

  const unitePiece = await prisma.unite_article.create({
    data: { code: 'PCS', libelle: 'Pièce' },
  });

  const uniteLitre = await prisma.unite_article.create({
    data: { code: 'L', libelle: 'Litre' },
  });

  const uniteBidon = await prisma.unite_article.create({
    data: { code: 'BDN', libelle: 'Bidon' },
  });

  const fabricantZPMC = await prisma.fabricant.create({
    data: {
      code: 'ZPMC',
      nom: 'ZPMC',
      pays: 'Chine',
    },
  });

  const fabricantKalmar = await prisma.fabricant.create({
    data: {
      code: 'KALMAR',
      nom: 'Kalmar',
      pays: 'Finlande',
    },
  });

  const fabricantToyota = await prisma.fabricant.create({
    data: {
      code: 'TOYOTA',
      nom: 'Toyota Material Handling',
      pays: 'Japon',
    },
  });

  const marqueZPMC = await prisma.marque.create({
    data: {
      code: 'ZPMC',
      libelle: 'ZPMC',
      idFabricant: fabricantZPMC.idFabricant,
    },
  });

  const marqueKalmar = await prisma.marque.create({
    data: {
      code: 'KALMAR',
      libelle: 'Kalmar',
      idFabricant: fabricantKalmar.idFabricant,
    },
  });

  const marqueToyota = await prisma.marque.create({
    data: {
      code: 'TOYOTA',
      libelle: 'Toyota',
      idFabricant: fabricantToyota.idFabricant,
    },
  });

  console.log('Création des zones / points de structure...');

  const terminal = await prisma.point_structure.create({
    data: {
      code: 'BMT-TERMINAL',
      libelle: 'Terminal à conteneurs BMT',
      description: 'Zone principale d’exploitation du terminal à conteneurs de Béjaïa.',
      typePoint: 'SITE',
      criticite: 'ELEVEE',
      responsable: 'Direction exploitation',
      organisation: 'BMT',
    },
  });

  const quai = await prisma.point_structure.create({
    data: {
      code: 'ZONE-QUAI',
      libelle: 'Zone quai',
      description: 'Zone de chargement et déchargement des navires porte-conteneurs.',
      typePoint: 'ZONE',
      criticite: 'CRITIQUE',
      zoneSensible: true,
      epiObligatoire: true,
      consigneSecurite: 'Port du casque, gilet haute visibilité et chaussures de sécurité obligatoire.',
      responsable: 'Service exploitation',
      organisation: 'BMT',
    },
  });

  const parc = await prisma.point_structure.create({
    data: {
      code: 'ZONE-PARC',
      libelle: 'Parc à conteneurs',
      description: 'Zone de stockage et de déplacement des conteneurs.',
      typePoint: 'ZONE',
      criticite: 'ELEVEE',
      epiObligatoire: true,
      responsable: 'Service parc',
      organisation: 'BMT',
    },
  });

  const atelier = await prisma.point_structure.create({
    data: {
      code: 'ATELIER-MAINT',
      libelle: 'Atelier maintenance',
      description: 'Atelier dédié aux opérations de maintenance et au stockage des outillages.',
      typePoint: 'LOCAL',
      criticite: 'MOYENNE',
      responsable: 'Responsable maintenance',
      organisation: 'Maintenance',
    },
  });

  console.log('Création des modèles et matériels...');

  const modeleSTS = await prisma.modele.create({
    data: {
      code: 'MOD-STS-ZPMC',
      libelle: 'Portique de quai STS ZPMC',
      idEtat: etatModeleValide.idEtat,
      idFamille: famLevage.idFamille,
      idFabricant: fabricantZPMC.idFabricant,
      idMarque: marqueZPMC.idMarque,
      idTypeEquipement: typeEquipementPortuaire.idTypeEquipement,
      criticite: 'CRITIQUE',
      niveauMaintenance: 'NIVEAU_4',
      referenceConstructeur: 'STS-ZPMC-65T',
      garantieMois: 24,
      reparable: true,
    },
  });

  const modeleRTG = await prisma.modele.create({
    data: {
      code: 'MOD-RTG-KALMAR',
      libelle: 'Portique gerbeur RTG Kalmar',
      idEtat: etatModeleValide.idEtat,
      idFamille: famLevage.idFamille,
      idFabricant: fabricantKalmar.idFabricant,
      idMarque: marqueKalmar.idMarque,
      idTypeEquipement: typeEquipementPortuaire.idTypeEquipement,
      criticite: 'CRITIQUE',
      niveauMaintenance: 'NIVEAU_4',
      referenceConstructeur: 'RTG-KALMAR-40T',
      garantieMois: 24,
      reparable: true,
    },
  });

  const modeleRS = await prisma.modele.create({
    data: {
      code: 'MOD-RS-KALMAR',
      libelle: 'Reach Stacker Kalmar',
      idEtat: etatModeleValide.idEtat,
      idFamille: famEquipement.idFamille,
      idFabricant: fabricantKalmar.idFabricant,
      idMarque: marqueKalmar.idMarque,
      idTypeEquipement: typeEquipementPortuaire.idTypeEquipement,
      criticite: 'ELEVEE',
      niveauMaintenance: 'NIVEAU_3',
      referenceConstructeur: 'DRF450',
      garantieMois: 18,
      reparable: true,
    },
  });

  const modeleCH = await prisma.modele.create({
    data: {
      code: 'MOD-CH-TOYOTA',
      libelle: 'Chariot élévateur Toyota',
      idEtat: etatModeleValide.idEtat,
      idFamille: famEquipement.idFamille,
      idFabricant: fabricantToyota.idFabricant,
      idMarque: marqueToyota.idMarque,
      idTypeEquipement: typeEquipementPortuaire.idTypeEquipement,
      criticite: 'MOYENNE',
      niveauMaintenance: 'NIVEAU_2',
      referenceConstructeur: '8FD30',
      garantieMois: 12,
      reparable: true,
    },
  });

  const modelePompeHyd = await prisma.modele.create({
    data: {
      code: 'MOD-POMPE-HYD',
      libelle: 'Pompe hydraulique haute pression',
      idEtat: etatModeleValide.idEtat,
      idFamille: famHydraulique.idFamille,
      idTypeEquipement: typeSousEquipement.idTypeEquipement,
      criticite: 'ELEVEE',
      niveauMaintenance: 'NIVEAU_3',
      reparable: true,
    },
  });

  const sts01 = await prisma.materiel.create({
    data: {
      code: 'STS-01',
      libelle: 'Portique de quai STS-01',
      numeroSerie: 'STS-BMT-2020-001',
      dateMiseService: new Date('2020-03-15'),
      idModele: modeleSTS.idModele,
      idEtat: etatMaterielExploitation.idEtat,
      idType: typePortique.idType,
      idPointStructure: quai.idPoint,
      positionActuelle: 'EN_SERVICE',
      actif: true,
    },
  });

  const rtg01 = await prisma.materiel.create({
    data: {
      code: 'RTG-01',
      libelle: 'Portique gerbeur RTG-01',
      numeroSerie: 'RTG-BMT-2019-001',
      dateMiseService: new Date('2019-09-20'),
      idModele: modeleRTG.idModele,
      idEtat: etatMaterielExploitation.idEtat,
      idType: typePortique.idType,
      idPointStructure: parc.idPoint,
      positionActuelle: 'EN_SERVICE',
      actif: true,
    },
  });

  const rs01 = await prisma.materiel.create({
    data: {
      code: 'RS-01',
      libelle: 'Reach Stacker RS-01',
      numeroSerie: 'RS-BMT-2021-001',
      dateMiseService: new Date('2021-05-10'),
      idModele: modeleRS.idModele,
      idEtat: etatMaterielExploitation.idEtat,
      idType: typeEngin.idType,
      idPointStructure: parc.idPoint,
      positionActuelle: 'EN_SERVICE',
      actif: true,
    },
  });

  const ch01 = await prisma.materiel.create({
    data: {
      code: 'CH-01',
      libelle: 'Chariot élévateur CH-01',
      numeroSerie: 'CH-BMT-2022-001',
      dateMiseService: new Date('2022-01-12'),
      idModele: modeleCH.idModele,
      idEtat: etatMaterielExploitation.idEtat,
      idType: typeEngin.idType,
      idPointStructure: atelier.idPoint,
      positionActuelle: 'EN_SERVICE',
      actif: true,
    },
  });

  const pompeRtg01 = await prisma.materiel.create({
    data: {
      code: 'RTG-01-POMPE-HYD',
      libelle: 'Pompe hydraulique RTG-01',
      numeroSerie: 'POMPE-RTG01-2019-01',
      dateMiseService: new Date('2019-09-20'),
      idModele: modelePompeHyd.idModele,
      idEtat: etatMaterielExploitation.idEtat,
      idType: typeEquipement.idType,
      idPointStructure: parc.idPoint,
      idMaterielParent: rtg01.idMateriel,
      positionActuelle: 'EN_SERVICE',
      actif: true,
    },
  });

  const moteurSts01 = await prisma.materiel.create({
    data: {
      code: 'STS-01-MOT-LEV',
      libelle: 'Moteur de levage STS-01',
      numeroSerie: 'MOT-LEV-STS01-2020',
      dateMiseService: new Date('2020-03-15'),
      idModele: modeleSTS.idModele,
      idEtat: etatMaterielExploitation.idEtat,
      idType: typeEquipement.idType,
      idPointStructure: quai.idPoint,
      idMaterielParent: sts01.idMateriel,
      positionActuelle: 'EN_SERVICE',
      actif: true,
    },
  });

  const batterieCh01 = await prisma.materiel.create({
    data: {
      code: 'CH-01-BAT',
      libelle: 'Batterie chariot élévateur CH-01',
      numeroSerie: 'BAT-CH01-2023',
      dateMiseService: new Date('2023-02-01'),
      idModele: modeleCH.idModele,
      idEtat: etatMaterielArret.idEtat,
      idType: typeEquipement.idType,
      idPointStructure: atelier.idPoint,
      idMaterielParent: ch01.idMateriel,
      positionActuelle: 'A_CONTROLER',
      actif: true,
    },
  });

  await prisma.lien_arborescence.createMany({
    data: [
      {
        typeArborescence: 'GEOGRAPHIQUE',
        parentType: 'POINT',
        parentPointId: terminal.idPoint,
        enfantType: 'POINT',
        enfantPointId: quai.idPoint,
        ordre: 1,
      },
      {
        typeArborescence: 'GEOGRAPHIQUE',
        parentType: 'POINT',
        parentPointId: terminal.idPoint,
        enfantType: 'POINT',
        enfantPointId: parc.idPoint,
        ordre: 2,
      },
      {
        typeArborescence: 'GEOGRAPHIQUE',
        parentType: 'POINT',
        parentPointId: terminal.idPoint,
        enfantType: 'POINT',
        enfantPointId: atelier.idPoint,
        ordre: 3,
      },
      {
        typeArborescence: 'TECHNIQUE',
        parentType: 'MATERIEL',
        parentMaterielId: rtg01.idMateriel,
        enfantType: 'MATERIEL',
        enfantMaterielId: pompeRtg01.idMateriel,
        ordre: 1,
      },
      {
        typeArborescence: 'TECHNIQUE',
        parentType: 'MATERIEL',
        parentMaterielId: sts01.idMateriel,
        enfantType: 'MATERIEL',
        enfantMaterielId: moteurSts01.idMateriel,
        ordre: 1,
      },
      {
        typeArborescence: 'TECHNIQUE',
        parentType: 'MATERIEL',
        parentMaterielId: ch01.idMateriel,
        enfantType: 'MATERIEL',
        enfantMaterielId: batterieCh01.idMateriel,
        ordre: 1,
      },
    ],
  });

  console.log('Création du stock...');

  const magasinCentral = await prisma.magasin.create({
    data: {
      code: 'MAG-MAINT',
      libelle: 'Magasin maintenance',
      actif: true,
    },
  });

  const magasinAtelier = await prisma.magasin.create({
    data: {
      code: 'MAG-ATELIER',
      libelle: 'Magasin atelier',
      actif: true,
    },
  });

  const empA1 = await prisma.emplacement_magasin.create({
    data: {
      idMagasin: magasinCentral.idMagasin,
      code: 'A-01',
      libelle: 'Rayon hydraulique',
    },
  });

  const empB1 = await prisma.emplacement_magasin.create({
    data: {
      idMagasin: magasinCentral.idMagasin,
      code: 'B-01',
      libelle: 'Rayon électrique',
    },
  });

  const empC1 = await prisma.emplacement_magasin.create({
    data: {
      idMagasin: magasinCentral.idMagasin,
      code: 'C-01',
      libelle: 'Consommables',
    },
  });

  const filtreHyd = await prisma.article.create({
    data: {
      reference: 'FIL-HYD-001',
      designation: 'Filtre hydraulique haute pression',
      description: 'Filtre destiné aux circuits hydrauliques des portiques RTG et engins de manutention.',
      idFamille: famArticles.idFamille,
      idUniteArticle: unitePiece.idUniteArticle,
      categorie: 'PIECE_RECHANGE',
      gereEnStock: true,
      serialise: false,
      reparable: false,
      prixUnitaire: D('4500.00'),
      prixStandard: D('4500.00'),
      prixMoyenPondere: D('4500.00'),
      fournisseurPrincipal: 'Hydro Maintenance Algérie',
      fabricantArticle: 'Parker',
      referenceFabricant: 'PARKER-HF-220',
      natureAchat: 'HYDRAULIQUE',
      centreCout: 'MAINT-PORT',
      createdBy: 'seed-soutenance',
    },
  });

  const huileMoteur = await prisma.article.create({
    data: {
      reference: 'HUI-15W40',
      designation: 'Huile moteur 15W40 - Bidon 20L',
      description: 'Huile moteur utilisée pour les engins de manutention diesel.',
      idFamille: famArticles.idFamille,
      idUniteArticle: uniteBidon.idUniteArticle,
      categorie: 'CONSOMMABLE',
      gereEnStock: true,
      serialise: false,
      reparable: false,
      prixUnitaire: D('12500.00'),
      prixStandard: D('12500.00'),
      prixMoyenPondere: D('12500.00'),
      fournisseurPrincipal: 'Naftal',
      natureAchat: 'GENERAL',
      centreCout: 'MAINT-ENGINS',
      createdBy: 'seed-soutenance',
    },
  });

  const jointHyd = await prisma.article.create({
    data: {
      reference: 'JOINT-HYD-001',
      designation: 'Kit joints hydrauliques',
      description: 'Kit de joints pour raccords et vérins hydrauliques.',
      idFamille: famArticles.idFamille,
      idUniteArticle: unitePiece.idUniteArticle,
      categorie: 'PIECE_RECHANGE',
      gereEnStock: true,
      serialise: false,
      reparable: false,
      prixUnitaire: D('3200.00'),
      prixStandard: D('3200.00'),
      prixMoyenPondere: D('3200.00'),
      fournisseurPrincipal: 'Hydro Maintenance Algérie',
      fabricantArticle: 'SKF',
      natureAchat: 'HYDRAULIQUE',
      centreCout: 'MAINT-PORT',
      createdBy: 'seed-soutenance',
    },
  });

  const capteurPression = await prisma.article.create({
    data: {
      reference: 'CAP-PRES-001',
      designation: 'Capteur de pression hydraulique',
      description: 'Capteur de pression pour contrôle du circuit hydraulique.',
      idFamille: famArticles.idFamille,
      idUniteArticle: unitePiece.idUniteArticle,
      categorie: 'PIECE_RECHANGE',
      gereEnStock: true,
      serialise: true,
      reparable: false,
      prixUnitaire: D('18500.00'),
      prixStandard: D('18500.00'),
      prixMoyenPondere: D('18500.00'),
      fournisseurPrincipal: 'Siemens Algérie',
      fabricantArticle: 'Siemens',
      natureAchat: 'AUTOMATISME',
      centreCout: 'MAINT-PORT',
      createdBy: 'seed-soutenance',
    },
  });

  const relais24v = await prisma.article.create({
    data: {
      reference: 'REL-24V',
      designation: 'Relais de commande 24V',
      description: 'Relais électrique utilisé dans les armoires de commande.',
      idFamille: famArticles.idFamille,
      idUniteArticle: unitePiece.idUniteArticle,
      categorie: 'PIECE_RECHANGE',
      gereEnStock: true,
      serialise: false,
      reparable: false,
      prixUnitaire: D('1800.00'),
      prixStandard: D('1800.00'),
      prixMoyenPondere: D('1800.00'),
      fournisseurPrincipal: 'Schneider Electric',
      fabricantArticle: 'Schneider',
      natureAchat: 'ELECTRIQUE',
      centreCout: 'MAINT-ELEC',
      createdBy: 'seed-soutenance',
    },
  });

  const batterie = await prisma.article.create({
    data: {
      reference: 'BAT-12V-180AH',
      designation: 'Batterie 12V 180Ah',
      description: 'Batterie de démarrage pour engins de manutention.',
      idFamille: famArticles.idFamille,
      idUniteArticle: unitePiece.idUniteArticle,
      categorie: 'PIECE_RECHANGE',
      gereEnStock: true,
      serialise: true,
      reparable: false,
      prixUnitaire: D('28000.00'),
      prixStandard: D('28000.00'),
      prixMoyenPondere: D('28000.00'),
      fournisseurPrincipal: 'Batteries Services Béjaïa',
      natureAchat: 'ELECTRIQUE',
      centreCout: 'MAINT-ENGINS',
      createdBy: 'seed-soutenance',
    },
  });

  const articlesStock = [
    { article: filtreHyd, qte: '12.00', emp: empA1.idEmplacement },
    { article: huileMoteur, qte: '25.00', emp: empC1.idEmplacement },
    { article: jointHyd, qte: '10.00', emp: empA1.idEmplacement },
    { article: capteurPression, qte: '6.00', emp: empB1.idEmplacement },
    { article: relais24v, qte: '15.00', emp: empB1.idEmplacement },
    { article: batterie, qte: '5.00', emp: empB1.idEmplacement },
  ];

  const entreeInitiale = await prisma.entree_stock.create({
    data: {
      numero: 'ENT-INIT-2026-001',
      dateReception: addDays(-20),
      commentaire: 'Initialisation du stock de démonstration pour la soutenance.',
      statut: 'VALIDEE',
    },
  });

  for (const item of articlesStock) {
    await prisma.stock_article_magasin.create({
      data: {
        idArticle: item.article.idArticle,
        idMagasin: magasinCentral.idMagasin,
        quantitePhysique: D(item.qte),
        quantiteDisponible: D(item.qte),
        quantiteReservee: D('0.00'),
      },
    });

    await prisma.entree_stock_ligne.create({
      data: {
        idEntreeStock: entreeInitiale.idEntreeStock,
        idArticle: item.article.idArticle,
        idMagasin: magasinCentral.idMagasin,
        idEmplacement: item.emp,
        quantite: D(item.qte),
        prixUnitaire: item.article.prixUnitaire ?? D('0.00'),
        commentaire: 'Stock initial de démonstration.',
      },
    });

    await prisma.mouvement_stock.create({
      data: {
        typeMouvement: 'ENTREE',
        dateMouvement: addDays(-20),
        quantite: D(item.qte),
        idArticle: item.article.idArticle,
        idMagasinDestination: magasinCentral.idMagasin,
        origineType: 'ENTREE_STOCK',
        origineId: entreeInitiale.idEntreeStock,
        commentaire: 'Entrée initiale de stock.',
      },
    });
  }

  console.log('Création des équipes et techniciens...');

  const equipeMeca = await prisma.equipe_maintenance.upsert({
    where: { code: 'EQ-MECA' },
    update: {
      libelle: 'Équipe maintenance mécanique',
      heureDebut: time(8),
      heureFin: time(16),
      actif: true,
    },
    create: {
      code: 'EQ-MECA',
      libelle: 'Équipe maintenance mécanique',
      heureDebut: time(8),
      heureFin: time(16),
      actif: true,
    },
  });

  const equipeElec = await prisma.equipe_maintenance.upsert({
    where: { code: 'EQ-ELEC' },
    update: {
      libelle: 'Équipe maintenance électrique',
      heureDebut: time(8),
      heureFin: time(16),
      actif: true,
    },
    create: {
      code: 'EQ-ELEC',
      libelle: 'Équipe maintenance électrique',
      heureDebut: time(8),
      heureFin: time(16),
      actif: true,
    },
  });

  const techMeca = await findOrCreateTechnicien(
    'T-MECA-01',
    'Technicien mécanique portuaire',
    equipeMeca.idEquipe,
  );

  const techElec = await findOrCreateTechnicien(
    'T-ELEC-01',
    'Technicien électricien automaticien',
    equipeElec.idEquipe,
  );

  console.log('Création des gammes et plans préventifs...');

  const gammeInspectionRTG = await prisma.gamme.create({
    data: {
      code: 'GAM-RTG-MENS',
      libelle: 'Inspection mensuelle RTG',
      typeMaintenance: 'PREVENTIF',
      actif: true,
      idModele: modeleRTG.idModele,
      chargePrevue: D('3.00'),
      etat: 'VALIDE',
      organisation: 'Maintenance',
      tempsArret: D('1.00'),
    },
  });

  const op1 = await prisma.gamme_operation.create({
    data: {
      ordre: 1,
      libelle: 'Contrôler le niveau d’huile hydraulique',
      description: 'Vérifier le niveau d’huile et rechercher toute trace de fuite.',
      tempsStandard: 30,
      idGamme: gammeInspectionRTG.idGamme,
      obligatoire: true,
    },
  });

  const op2 = await prisma.gamme_operation.create({
    data: {
      ordre: 2,
      libelle: 'Inspecter les flexibles hydrauliques',
      description: 'Contrôler l’état des flexibles, raccords et points de fixation.',
      tempsStandard: 45,
      idGamme: gammeInspectionRTG.idGamme,
      obligatoire: true,
    },
  });

  const op3 = await prisma.gamme_operation.create({
    data: {
      ordre: 3,
      libelle: 'Tester le système de freinage',
      description: 'Réaliser un test fonctionnel du système de freinage et consigner les résultats.',
      tempsStandard: 45,
      idGamme: gammeInspectionRTG.idGamme,
      obligatoire: true,
    },
  });

  const pointPressionRtg = await prisma.point_mesure.create({
    data: {
      code: 'PM-RTG-01-PRESSION',
      libelle: 'Pression circuit hydraulique RTG-01',
      type: 'NUMERIQUE',
      unite: 'bar',
      idMateriel: pompeRtg01.idMateriel,
      idPointStructure: parc.idPoint,
      derniereValeur: D('178.00'),
      derniereDate: addDays(-3),
      surveillanceMin: D('150.00'),
      surveillanceMax: D('210.00'),
      valeurMin: D('120.00'),
      valeurMax: D('240.00'),
      envoyerAlerte: true,
      emettreDi: true,
      periodeReleveJours: 7,
      organisation: 'Maintenance',
    },
  });

  await prisma.releve_mesure.createMany({
    data: [
      {
        idPointMesure: pointPressionRtg.idPointMesure,
        dateReleve: addDays(-15),
        valeur: D('176.00'),
        commentaire: 'Valeur normale.',
      },
      {
        idPointMesure: pointPressionRtg.idPointMesure,
        dateReleve: addDays(-8),
        valeur: D('182.00'),
        commentaire: 'Légère hausse, surveillance maintenue.',
      },
      {
        idPointMesure: pointPressionRtg.idPointMesure,
        dateReleve: addDays(-3),
        valeur: D('178.00'),
        commentaire: 'Pression stable.',
      },
    ],
  });

  const ppp = await prisma.plan_preventif_predefini.create({
    data: {
      code: 'PPP-RTG-MENS',
      titre: 'Plan préventif prédéfini - Inspection mensuelle RTG',
      etat: 'VALIDE',
      typeDeclenchement: 'PERIODIQUE',
      organisation: 'Maintenance',
      idModele: modeleRTG.idModele,
      actif: true,
    },
  });

  await prisma.modele_plan_preventif_predefini.create({
    data: {
      idModele: modeleRTG.idModele,
      idPlanPreventifPredefini: ppp.idPlanPreventifPredefini,
      principal: true,
      actif: true,
    },
  });

  const pppDeclencheur = await prisma.ppp_declencheur.create({
    data: {
      idPlanPreventifPredefini: ppp.idPlanPreventifPredefini,
      priorite: 1,
      etat: 'ACTIF',
      typeDeclencheur: 'PERIODIQUE',
      idGamme: gammeInspectionRTG.idGamme,
      idModele: modeleRTG.idModele,
      etatInterventionCible: 'VALIDEE',
      horizonJours: 7,
      toleranceJours: 3,
      actualisation: 'APRES_REALISATION',
      periodiciteValeur: 1,
      periodiciteUnite: 'MOIS',
      nombreJoursPremierLancement: 0,
      actif: true,
    },
  });

  const planRtg01 = await prisma.plan_preventif.create({
    data: {
      code: 'PP-RTG-01-MENS',
      libelle: 'Plan préventif mensuel RTG-01',
      etat: 'ACTIF',
      typeDeclenchement: 'PERIODIQUE',
      idMateriel: rtg01.idMateriel,
      idPointStructure: parc.idPoint,
      idPlanPreventifPredefiniSource: ppp.idPlanPreventifPredefini,
      organisation: 'Maintenance',
      actif: true,
    },
  });

  const declencheurRtg01 = await prisma.plan_preventif_declencheur.create({
    data: {
      idPlanPreventif: planRtg01.idPlanPreventif,
      idPppDeclencheurSource: pppDeclencheur.idPppDeclencheur,
      priorite: 1,
      etat: 'ACTIF',
      typeDeclencheur: 'PERIODIQUE',
      idGamme: gammeInspectionRTG.idGamme,
      idMateriel: rtg01.idMateriel,
      idPointStructure: parc.idPoint,
      idModele: modeleRTG.idModele,
      etatInterventionCible: 'VALIDEE',
      actualisation: 'APRES_REALISATION',
      horizonJours: 7,
      toleranceJours: 3,
      periodiciteValeur: 1,
      periodiciteUnite: 'MOIS',
      prochainLancementDate: addDays(10),
      derniereRealisationDate: addDays(-20),
      actif: true,
    },
  });

  console.log('Création des demandes d’intervention et OT...');

  const diFuite = await prisma.demande_intervention.create({
    data: {
      code: 'DI-0001',
      dateDemande: addDays(-2),
      dateSoumission: addDays(-2),
      description: 'Fuite hydraulique détectée sous le portique RTG-01 au niveau de la pompe hydraulique.',
      statut: 'VALIDEE',
      idMateriel: pompeRtg01.idMateriel,
      demandeur: 'Agent exploitation parc',
      createdBy: 'demandeur.bmt',
      validatedBy: 'responsable.maintenance',
      dateValidation: addDays(-1),
      priorite: 'URGENTE',
      criticite: 'ELEVEE',
      materielEnPanne: true,
      materielIndisponible: true,
    },
  });

  await prisma.historique_etat_demande_intervention.createMany({
    data: [
      {
        idDemande: diFuite.idDemande,
        ancienStatut: null,
        nouveauStatut: 'EN_PREPARATION',
        action: 'CREATION',
        commentaire: 'Création de la demande par le demandeur.',
        changedBy: 'demandeur.bmt',
        changedAt: addDays(-2),
      },
      {
        idDemande: diFuite.idDemande,
        ancienStatut: 'EN_PREPARATION',
        nouveauStatut: 'VALIDEE',
        action: 'VALIDATION',
        commentaire: 'Demande validée et convertie en ordre de travail.',
        changedBy: 'responsable.maintenance',
        changedAt: addDays(-1),
      },
    ],
  });

  const diBruit = await prisma.demande_intervention.create({
    data: {
      code: 'DI-0002',
      dateDemande: addDays(-1),
      dateSoumission: addDays(-1),
      description: 'Bruit anormal constaté lors du démarrage du moteur de levage du STS-01.',
      statut: 'EN_ATTENTE_VALIDATION',
      idMateriel: moteurSts01.idMateriel,
      demandeur: 'Chef équipe quai',
      createdBy: 'chef.quai',
      priorite: 'HAUTE',
      criticite: 'ELEVEE',
      materielEnPanne: false,
      materielIndisponible: false,
    },
  });

  await prisma.historique_etat_demande_intervention.create({
    data: {
      idDemande: diBruit.idDemande,
      ancienStatut: null,
      nouveauStatut: 'EN_ATTENTE_VALIDATION',
      action: 'SOUMISSION',
      commentaire: 'Demande soumise pour validation.',
      changedBy: 'chef.quai',
    },
  });

  const diBatterie = await prisma.demande_intervention.create({
    data: {
      code: 'DI-0003',
      dateDemande: addDays(-8),
      description: 'Batterie faible sur le chariot élévateur CH-01, démarrage difficile.',
      statut: 'CLOTUREE',
      idMateriel: batterieCh01.idMateriel,
      demandeur: 'Magasinier atelier',
      createdBy: 'magasinier.bmt',
      validatedBy: 'responsable.maintenance',
      dateValidation: addDays(-7),
      dateReceptionTravaux: addDays(-5),
      receptionTravaux: true,
      receptionBy: 'responsable.maintenance',
      priorite: 'NORMALE',
      criticite: 'MOYENNE',
      materielEnPanne: false,
      materielIndisponible: false,
    },
  });

  const otFuite = await prisma.intervention.create({
    data: {
      code: 'OT-COR-0001',
      libelle: 'Réparation fuite hydraulique RTG-01',
      description: 'Intervention corrective suite à une fuite hydraulique au niveau de la pompe RTG-01.',
      typeMaintenance: 'CORRECTIF',
      typeIntervention: 'CORRECTIVE',
      natureIntervention: 'HYDRAULIQUE',
      etat: 'EN_COURS',
      idMateriel: pompeRtg01.idMateriel,
      idDemande: diFuite.idDemande,
      idEquipe: equipeMeca.idEquipe,
      dateDebutPrevue: addDays(0),
      dateFinPrevue: addDays(1),
      dateDebutReelle: addDays(0),
      startedBy: 'technicien.meca',
      assignedBy: 'responsable.maintenance',
      dateAffectation: addDays(-1),
      createdBy: 'responsable.maintenance',
      validatedBy: 'responsable.maintenance',
      dateValidation: addDays(-1),
      priorite: 'URGENTE',
      criticite: 'ELEVEE',
      materielEnPanne: true,
      materielIndisponible: true,
      arretMateriel: true,
      impactProduction: 'Risque de ralentissement des opérations parc',
      symptome: 'Fuite huile hydraulique',
      diagnosticInitial: 'Présence d’huile sous la pompe hydraulique, suspicion de joint défectueux.',
      instructions: 'Contrôler les raccords, remplacer les joints défectueux et tester la pression du circuit.',
      instructionsSecurite: 'Consignation hydraulique obligatoire avant démontage. Port des EPI requis.',
      consignationRequise: true,
      permisTravailRequis: true,
      niveauMaintenance: 'NIVEAU_3',
      centreCout: 'MAINT-PORT',
      dureePrevue: D('3.00'),
      chargePrevue: D('3.00'),
      coutPiecesPrevu: D('7700.00'),
      coutTotalPrevu: D('15000.00'),
    },
  });

  await prisma.affectation_technicien.create({
    data: {
      idIntervention: otFuite.idIntervention,
      idTechnicien: techMeca.idTechnicien,
      dateAffectation: addDays(-1),
      affectePar: 'responsable.maintenance',
      tempsTravail: 180,
    },
  });

  const opOt1 = await prisma.operation_intervention.create({
    data: {
      idIntervention: otFuite.idIntervention,
      ordre: 1,
      libelle: 'Localiser la fuite hydraulique',
      description: 'Inspection visuelle de la pompe, des raccords et des flexibles.',
      tempsPasse: 45,
      obligatoire: true,
    },
  });

  const opOt2 = await prisma.operation_intervention.create({
    data: {
      idIntervention: otFuite.idIntervention,
      ordre: 2,
      libelle: 'Remplacer le kit de joints',
      description: 'Remplacement du joint défectueux et nettoyage de la zone.',
      tempsPasse: 90,
      obligatoire: true,
    },
  });

  await prisma.operation_intervention.create({
    data: {
      idIntervention: otFuite.idIntervention,
      ordre: 3,
      libelle: 'Tester la pression du circuit',
      description: 'Remise en pression progressive et contrôle absence de fuite.',
      tempsPasse: 45,
      obligatoire: true,
    },
  });

  await prisma.occupation_intervention.createMany({
    data: [
      {
        idIntervention: otFuite.idIntervention,
        idTechnicien: techMeca.idTechnicien,
        idOperation: opOt1.idOperation,
        dateOccupation: addDays(0),
        duree: D('0.75'),
        natureOccupation: 'Diagnostic',
        typeHoraire: 'Normal',
        commentaire: 'Fuite localisée au niveau du raccord de sortie pompe.',
        createdBy: 'technicien.meca',
      },
      {
        idIntervention: otFuite.idIntervention,
        idTechnicien: techMeca.idTechnicien,
        idOperation: opOt2.idOperation,
        dateOccupation: addDays(0),
        duree: D('1.50'),
        natureOccupation: 'Réparation',
        typeHoraire: 'Normal',
        commentaire: 'Remplacement du kit de joints et nettoyage de la zone.',
        createdBy: 'technicien.meca',
      },
    ],
  });

  await prisma.fourniture_intervention.createMany({
    data: [
      {
        idIntervention: otFuite.idIntervention,
        idArticle: jointHyd.idArticle,
        designation: jointHyd.designation,
        source: 'STOCK',
        quantitePrevue: D('1.00'),
        quantiteReelle: D('1.00'),
        coutPrevu: D('3200.00'),
        coutReel: D('3200.00'),
        statut: 'CONSOMMEE',
      },
      {
        idIntervention: otFuite.idIntervention,
        idArticle: filtreHyd.idArticle,
        designation: filtreHyd.designation,
        source: 'STOCK',
        quantitePrevue: D('1.00'),
        quantiteReelle: D('0.00'),
        coutPrevu: D('4500.00'),
        coutReel: D('0.00'),
        statut: 'PREVU',
      },
    ],
  });

  const sortieFuite = await prisma.sortie_stock.create({
    data: {
      numero: 'SOR-2026-0001',
      dateSortie: addDays(0),
      idIntervention: otFuite.idIntervention,
      commentaire: 'Sortie de stock liée à la réparation de la fuite hydraulique RTG-01.',
      statut: 'VALIDEE',
    },
  });

  const sortieLigneJoint = await prisma.sortie_stock_ligne.create({
    data: {
      idSortieStock: sortieFuite.idSortieStock,
      idArticle: jointHyd.idArticle,
      idMagasin: magasinCentral.idMagasin,
      idEmplacement: empA1.idEmplacement,
      idMateriel: pompeRtg01.idMateriel,
      quantite: D('1.00'),
      prixUnitaire: D('3200.00'),
      commentaire: 'Kit joints utilisé sur la pompe hydraulique RTG-01.',
    },
  });

  await prisma.consommation.create({
    data: {
      idIntervention: otFuite.idIntervention,
      idArticle: jointHyd.idArticle,
      idMagasin: magasinCentral.idMagasin,
      idSortieStockLigne: sortieLigneJoint.idLigneSortieStock,
      quantite: D('1.00'),
      prixUnitaire: D('3200.00'),
      coutTotal: D('3200.00'),
      commentaire: 'Consommation validée pendant l’intervention.',
      createdBy: 'technicien.meca',
      statut: 'ACTIVE',
    },
  });

  await prisma.stock_article_magasin.update({
    where: {
      idArticle_idMagasin: {
        idArticle: jointHyd.idArticle,
        idMagasin: magasinCentral.idMagasin,
      },
    },
    data: {
      quantitePhysique: D('9.00'),
      quantiteDisponible: D('9.00'),
    },
  });

  await prisma.mouvement_stock.create({
    data: {
      typeMouvement: 'SORTIE',
      dateMouvement: addDays(0),
      quantite: D('1.00'),
      idArticle: jointHyd.idArticle,
      idMateriel: pompeRtg01.idMateriel,
      idMagasinSource: magasinCentral.idMagasin,
      origineType: 'INTERVENTION',
      origineId: otFuite.idIntervention,
      commentaire: 'Consommation de kit joints pour OT-COR-0001.',
    },
  });

  await prisma.historique_etat_intervention.createMany({
    data: [
      {
        idIntervention: otFuite.idIntervention,
        ancienEtat: null,
        nouvelEtat: 'EN_PREPARATION',
        action: 'CREATION',
        commentaire: 'Création de l’ordre de travail.',
        changedBy: 'responsable.maintenance',
        changedAt: addDays(-1),
      },
      {
        idIntervention: otFuite.idIntervention,
        ancienEtat: 'EN_PREPARATION',
        nouvelEtat: 'VALIDEE',
        action: 'VALIDATION',
        commentaire: 'OT validé et affecté à un technicien.',
        changedBy: 'responsable.maintenance',
        changedAt: addDays(-1),
      },
      {
        idIntervention: otFuite.idIntervention,
        ancienEtat: 'VALIDEE',
        nouvelEtat: 'EN_COURS',
        action: 'DEMARRAGE',
        commentaire: 'Intervention démarrée par le technicien.',
        changedBy: 'technicien.meca',
        changedAt: addDays(0),
      },
    ],
  });

  await prisma.securite_intervention.createMany({
    data: [
      {
        idIntervention: otFuite.idIntervention,
        typeElement: 'EPI',
        libelle: 'Port des EPI',
        description: 'Casque, gants, lunettes, chaussures de sécurité et gilet haute visibilité.',
        obligatoire: true,
        realise: true,
      },
      {
        idIntervention: otFuite.idIntervention,
        typeElement: 'CONSIGNATION',
        libelle: 'Consignation hydraulique',
        description: 'Dépressuriser le circuit hydraulique avant démontage.',
        obligatoire: true,
        realise: true,
      },
    ],
  });

  const otBatterie = await prisma.intervention.create({
    data: {
      code: 'OT-COR-0002',
      libelle: 'Remplacement batterie chariot élévateur CH-01',
      description: 'Remplacement de la batterie suite à une faiblesse au démarrage.',
      typeMaintenance: 'CORRECTIF',
      typeIntervention: 'CORRECTIVE',
      natureIntervention: 'ELECTRIQUE',
      etat: 'SOLDE',
      idMateriel: batterieCh01.idMateriel,
      idDemande: diBatterie.idDemande,
      idEquipe: equipeElec.idEquipe,
      dateDebutPrevue: addDays(-7),
      dateFinPrevue: addDays(-6),
      dateDebutReelle: addDays(-7),
      dateFinReelle: addDays(-7),
      dateCloture: addDays(-6),
      createdBy: 'responsable.maintenance',
      assignedBy: 'responsable.maintenance',
      closedBy: 'responsable.maintenance',
      priorite: 'NORMALE',
      criticite: 'MOYENNE',
      symptome: 'Démarrage difficile',
      cause: 'Batterie en fin de vie',
      remede: 'Remplacement de la batterie',
      dureePrevue: D('2.00'),
      dureeReelle: D('1.50'),
      chargePrevue: D('2.00'),
      chargeReelle: D('1.50'),
      coutPiecesPrevu: D('28000.00'),
      coutPiecesReel: D('28000.00'),
      coutTotalPrevu: D('33000.00'),
      coutTotalReel: D('31500.00'),
      centreCout: 'MAINT-ENGINS',
    },
  });

  await prisma.affectation_technicien.create({
    data: {
      idIntervention: otBatterie.idIntervention,
      idTechnicien: techElec.idTechnicien,
      dateAffectation: addDays(-7),
      affectePar: 'responsable.maintenance',
      tempsTravail: 90,
    },
  });

  await prisma.compte_rendu_intervention.create({
    data: {
      idIntervention: otBatterie.idIntervention,
      saisiPar: 'technicien.elec',
      dateCompteRendu: addDays(-7),
      diagnostic: 'Batterie incapable de maintenir la charge.',
      cause: 'Usure normale',
      remede: 'Remplacement batterie',
      travauxEffectues: 'Dépose de l’ancienne batterie, pose d’une batterie neuve, test de démarrage effectué.',
      observation: 'Chariot remis en service.',
      resultat: 'CONFORME',
      tempsArret: D('1.50'),
      dureeReelle: D('1.50'),
    },
  });

  const otPrev = await prisma.intervention.create({
    data: {
      code: 'OT-PREV-0001',
      libelle: 'Inspection mensuelle portique RTG-01',
      description: 'Intervention générée à partir du plan préventif mensuel du RTG-01.',
      typeMaintenance: 'PREVENTIF',
      typeIntervention: 'PREVENTIVE',
      natureIntervention: 'INSPECTION',
      etat: 'VALIDEE',
      idMateriel: rtg01.idMateriel,
      idGamme: gammeInspectionRTG.idGamme,
      idEquipe: equipeMeca.idEquipe,
      idPlanPreventif: planRtg01.idPlanPreventif,
      idPlanPreventifDeclencheur: declencheurRtg01.idPlanPreventifDeclencheur,
      origineGeneration: 'PLAN_PREVENTIF',
      dateDebutPrevue: addDays(10),
      dateFinPrevue: addDays(10),
      createdBy: 'systeme',
      plannedBy: 'responsable.maintenance',
      priorite: 'NORMALE',
      criticite: 'ELEVEE',
      dureePrevue: D('3.00'),
      chargePrevue: D('3.00'),
      centreCout: 'MAINT-PORT',
      instructions: 'Réaliser les opérations de la gamme d’inspection mensuelle RTG.',
      instructionsSecurite: 'Respecter les consignes de sécurité de la zone parc.',
    },
  });

  await prisma.operation_intervention.createMany({
    data: [
      {
        idIntervention: otPrev.idIntervention,
        idGammeOperationSource: op1.idOperation,
        ordre: 1,
        libelle: 'Contrôler le niveau d’huile hydraulique',
        description: 'Vérification du niveau et recherche de fuite.',
        obligatoire: true,
      },
      {
        idIntervention: otPrev.idIntervention,
        idGammeOperationSource: op2.idOperation,
        ordre: 2,
        libelle: 'Inspecter les flexibles hydrauliques',
        description: 'Contrôle visuel des flexibles et raccords.',
        obligatoire: true,
      },
      {
        idIntervention: otPrev.idIntervention,
        idGammeOperationSource: op3.idOperation,
        ordre: 3,
        libelle: 'Tester le système de freinage',
        description: 'Test fonctionnel du système de freinage.',
        obligatoire: true,
      },
    ],
  });

  await prisma.historique_declenchement_preventif.create({
    data: {
      idPlanPreventifDeclencheur: declencheurRtg01.idPlanPreventifDeclencheur,
      idIntervention: otPrev.idIntervention,
      idMateriel: rtg01.idMateriel,
      idPointStructure: parc.idPoint,
      dateDeclenchement: addDays(0),
      conditionResume: 'Déclenchement périodique mensuel du plan préventif RTG-01.',
      fictif: false,
      statut: 'INTERVENTION_GENEREE',
    },
  });

  await prisma.historique_etat_intervention.create({
    data: {
      idIntervention: otPrev.idIntervention,
      ancienEtat: null,
      nouvelEtat: 'VALIDEE',
      action: 'GENERATION_PREVENTIVE',
      commentaire: 'Intervention préventive générée depuis le plan préventif.',
      changedBy: 'systeme',
    },
  });

  await prisma.reservation_stock.create({
    data: {
      numero: 'RES-2026-0001',
      idArticle: filtreHyd.idArticle,
      idMagasin: magasinCentral.idMagasin,
      quantite: D('1.00'),
      demandeur: 'responsable.maintenance',
      origineType: 'INTERVENTION',
      origineId: otPrev.idIntervention,
      commentaire: 'Réservation d’un filtre hydraulique pour inspection préventive RTG-01.',
      statut: 'VALIDEE',
    },
  });

  await prisma.stock_article_magasin.update({
    where: {
      idArticle_idMagasin: {
        idArticle: filtreHyd.idArticle,
        idMagasin: magasinCentral.idMagasin,
      },
    },
    data: {
      quantiteReservee: D('1.00'),
      quantiteDisponible: D('11.00'),
    },
  });

  await prisma.demande_reapprovisionnement.create({
    data: {
      numero: 'DR-2026-0001',
      idMagasin: magasinCentral.idMagasin,
      demandeur: 'magasinier.bmt',
      statut: 'BROUILLON',
      commentaire: 'Préparation d’une demande de réapprovisionnement pour les pièces hydrauliques.',
      lignes: {
        create: [
          {
            idArticle: jointHyd.idArticle,
            quantiteDemandee: D('5.00'),
            commentaire: 'Stock à renforcer pour les interventions RTG.',
          },
          {
            idArticle: capteurPression.idArticle,
            quantiteDemandee: D('2.00'),
            commentaire: 'Prévoir un stock de sécurité.',
          },
        ],
      },
    },
  });

  console.log('Base de soutenance créée avec succès.');
  console.log('Scénario principal conseillé : DI-0001 / OT-COR-0001 / RTG-01-POMPE-HYD.');
}

main()
  .catch((error) => {
    console.error('Erreur pendant le seed :', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });