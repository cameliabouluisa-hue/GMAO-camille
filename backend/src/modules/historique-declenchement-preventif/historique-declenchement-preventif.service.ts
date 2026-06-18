import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHistoriqueDeclenchementPreventifDto } from './dto/create-historique-declenchement-preventif.dto';
import { UpdateHistoriqueDeclenchementPreventifDto } from './dto/update-historique-declenchement-preventif.dto';

@Injectable()
export class HistoriqueDeclenchementPreventifService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateHistoriqueDeclenchementPreventifDto) {
  await this.ensureDeclencheurExists(dto.idPlanPreventifDeclencheur);

  const data = {
    idPlanPreventifDeclencheur: dto.idPlanPreventifDeclencheur,
    idIntervention: dto.idIntervention ?? null,
    idMateriel: dto.idMateriel ?? null,
    idPointStructure: dto.idPointStructure ?? null,
    dateDeclenchement: dto.dateDeclenchement
      ? new Date(dto.dateDeclenchement)
      : undefined,
    conditionResume: dto.conditionResume ?? null,
    valeurRealisation: dto.valeurRealisation ?? null,
    fictif: dto.fictif ?? false,
    statut: dto.statut ?? null,
  };

  return this.prisma.historique_declenchement_preventif.create({
    data: data as any,
    include: {
      plan_preventif_declencheur: true,
      intervention: true,
      materiel: true,
      point_structure: true,
    },
  });
}

  async findAll() {
    return this.prisma.historique_declenchement_preventif.findMany({
      include: {
        plan_preventif_declencheur: true,
        intervention: true,
        materiel: true,
        point_structure: true,
      },
      orderBy: {
        idHistoriqueDeclenchement: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const item =
      await this.prisma.historique_declenchement_preventif.findUnique({
        where: { idHistoriqueDeclenchement: id },
        include: {
          plan_preventif_declencheur: true,
          intervention: true,
          materiel: true,
          point_structure: true,
        },
      });

    if (!item) {
      throw new NotFoundException(
        `Historique de déclenchement ${id} introuvable`,
      );
    }

    return item;
  }

  async findByDeclencheur(idPlanPreventifDeclencheur: number) {
    await this.ensureDeclencheurExists(idPlanPreventifDeclencheur);

    return this.prisma.historique_declenchement_preventif.findMany({
      where: { idPlanPreventifDeclencheur },
      include: {
        plan_preventif_declencheur: true,
        intervention: true,
        materiel: true,
        point_structure: true,
      },
      orderBy: {
        dateDeclenchement: 'desc',
      },
    });
  }

  async update(
  id: number,
  dto: UpdateHistoriqueDeclenchementPreventifDto,
) {
  await this.ensureHistoriqueExists(id);

  if (dto.idPlanPreventifDeclencheur !== undefined) {
    await this.ensureDeclencheurExists(dto.idPlanPreventifDeclencheur);
  }

  const data = {
    ...(dto.idPlanPreventifDeclencheur !== undefined
      ? { idPlanPreventifDeclencheur: dto.idPlanPreventifDeclencheur }
      : {}),
    ...(dto.idIntervention !== undefined
      ? { idIntervention: dto.idIntervention }
      : {}),
    ...(dto.idMateriel !== undefined
      ? { idMateriel: dto.idMateriel }
      : {}),
    ...(dto.idPointStructure !== undefined
      ? { idPointStructure: dto.idPointStructure }
      : {}),
    ...(dto.dateDeclenchement !== undefined
      ? {
          dateDeclenchement: dto.dateDeclenchement
            ? new Date(dto.dateDeclenchement)
            : null,
        }
      : {}),
    ...(dto.conditionResume !== undefined
      ? { conditionResume: dto.conditionResume }
      : {}),
    ...(dto.valeurRealisation !== undefined
      ? { valeurRealisation: dto.valeurRealisation }
      : {}),
    ...(dto.fictif !== undefined ? { fictif: dto.fictif } : {}),
    ...(dto.statut !== undefined ? { statut: dto.statut } : {}),
  };

  return this.prisma.historique_declenchement_preventif.update({
    where: { idHistoriqueDeclenchement: id },
    data: data as any,
    include: {
      plan_preventif_declencheur: true,
      intervention: true,
      materiel: true,
      point_structure: true,
    },
  });
}
  async remove(id: number) {
    await this.ensureHistoriqueExists(id);

    return this.prisma.historique_declenchement_preventif.delete({
      where: { idHistoriqueDeclenchement: id },
    });
  }

  private async ensureHistoriqueExists(id: number) {
    const item =
      await this.prisma.historique_declenchement_preventif.findUnique({
        where: { idHistoriqueDeclenchement: id },
        select: { idHistoriqueDeclenchement: true },
      });

    if (!item) {
      throw new NotFoundException(
        `Historique de déclenchement ${id} introuvable`,
      );
    }
  }

  private async ensureDeclencheurExists(id: number) {
    const item = await this.prisma.plan_preventif_declencheur.findUnique({
      where: { idPlanPreventifDeclencheur: id },
      select: { idPlanPreventifDeclencheur: true },
    });

    if (!item) {
      throw new NotFoundException(
        `Déclencheur de plan préventif ${id} introuvable`,
      );
    }
  }
}