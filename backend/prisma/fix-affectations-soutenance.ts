import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
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

async function main() {
  const techniciensConnectables = await prisma.technicien.findMany({
    where: {
      utilisateur: {
        isNot: null,
      },
    },
    include: {
      utilisateur: {
        include: {
          role: true,
        },
      },
      equipe_maintenance: true,
    },
  });

  if (techniciensConnectables.length === 0) {
    throw new Error(
      "Aucun technicien lié à un utilisateur n'a été trouvé. Vérifie la colonne idTechnicien dans la table utilisateur.",
    );
  }

  console.log('Techniciens connectables trouvés :');
  for (const tech of techniciensConnectables) {
    console.log({
      idTechnicien: tech.idTechnicien,
      matricule: tech.matricule,
      nom: tech.nom,
      equipe: tech.equipe_maintenance?.code,
      utilisateur: tech.utilisateur?.email,
      role: tech.utilisateur?.role?.code,
    });
  }

  const technicienPrincipal =
    techniciensConnectables.find((tech) =>
      `${tech.nom ?? ''} ${tech.equipe_maintenance?.libelle ?? ''} ${tech.equipe_maintenance?.code ?? ''}`
        .toLowerCase()
        .includes('meca'),
    ) ?? techniciensConnectables[0];

  const technicienSecondaire =
    techniciensConnectables.find((tech) =>
      `${tech.nom ?? ''} ${tech.equipe_maintenance?.libelle ?? ''} ${tech.equipe_maintenance?.code ?? ''}`
        .toLowerCase()
        .includes('elec'),
    ) ?? techniciensConnectables[1] ?? technicienPrincipal;

  console.log('Technicien principal utilisé pour OT-COR-0001 :', {
    idTechnicien: technicienPrincipal.idTechnicien,
    nom: technicienPrincipal.nom,
    equipe: technicienPrincipal.equipe_maintenance?.code,
    utilisateur: technicienPrincipal.utilisateur?.email,
  });

  console.log('Technicien secondaire utilisé pour OT-COR-0002 :', {
    idTechnicien: technicienSecondaire.idTechnicien,
    nom: technicienSecondaire.nom,
    equipe: technicienSecondaire.equipe_maintenance?.code,
    utilisateur: technicienSecondaire.utilisateur?.email,
  });

  const otFuite = await prisma.intervention.findUnique({
    where: { code: 'OT-COR-0001' },
  });

  const otBatterie = await prisma.intervention.findUnique({
    where: { code: 'OT-COR-0002' },
  });

  const otPrev = await prisma.intervention.findUnique({
    where: { code: 'OT-PREV-0001' },
  });

  if (!otFuite) {
    throw new Error('OT-COR-0001 introuvable.');
  }

  await prisma.affectation_technicien.deleteMany({
    where: {
      idIntervention: {
        in: [otFuite.idIntervention, otBatterie?.idIntervention, otPrev?.idIntervention].filter(
          Boolean,
        ) as number[],
      },
    },
  });

  await prisma.intervention.update({
    where: { idIntervention: otFuite.idIntervention },
    data: {
      idEquipe: technicienPrincipal.idEquipe,
      assignedBy: 'responsable.maintenance',
    },
  });

  await prisma.affectation_technicien.create({
    data: {
      idIntervention: otFuite.idIntervention,
      idTechnicien: technicienPrincipal.idTechnicien,
      affectePar: 'responsable.maintenance',
      tempsTravail: 180,
      dateAffectation: new Date(),
    },
  });

  if (otPrev) {
    await prisma.intervention.update({
      where: { idIntervention: otPrev.idIntervention },
      data: {
        idEquipe: technicienPrincipal.idEquipe,
        assignedBy: 'responsable.maintenance',
      },
    });

    await prisma.affectation_technicien.create({
      data: {
        idIntervention: otPrev.idIntervention,
        idTechnicien: technicienPrincipal.idTechnicien,
        affectePar: 'responsable.maintenance',
        tempsTravail: 180,
        dateAffectation: new Date(),
      },
    });
  }

  if (otBatterie) {
    await prisma.intervention.update({
      where: { idIntervention: otBatterie.idIntervention },
      data: {
        idEquipe: technicienSecondaire.idEquipe,
        assignedBy: 'responsable.maintenance',
      },
    });

    await prisma.affectation_technicien.create({
      data: {
        idIntervention: otBatterie.idIntervention,
        idTechnicien: technicienSecondaire.idTechnicien,
        affectePar: 'responsable.maintenance',
        tempsTravail: 90,
        dateAffectation: new Date(),
      },
    });
  }

  console.log('Affectations corrigées avec tes techniciens existants.');
}

main()
  .catch((error) => {
    console.error('Erreur :', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });