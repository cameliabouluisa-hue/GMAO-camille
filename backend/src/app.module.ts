import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { FamilleModule } from './modules/famille/famille.module';
import { ModeleModule } from './modules/modele/modele.module';
import { EtatModeleModule } from './modules/etat-modele/etat-modele.module';
import { PointsStructureModule } from './modules/point-structure/points-structure.module';
import { ArborescenceModule } from './modules/arborescence/arborescence.module';
import { UniteArticleModule } from './modules/unite-article/unite-article.module';
import { ArticleModule } from './modules/article/article.module';
import { MaterielModule } from './modules/materiel/materiel.module';
import { MagasinModule } from './modules/magasin/magasin.module';
import { StockModule } from './modules/stock/stock.module';
import { InventairesPreparesModule } from './modules/inventaires-prepares/inventaires-prepares.module';
import { InventaireModule } from './modules/inventaire/inventaire.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { DemandesTransfertModule } from './modules/demandes-transfert/demandes-transfert.module';
import { ReapprovisionnementModule } from './modules/reapprovisionnement/reapprovisionnement.module';
import { GammeModule } from './modules/gamme/gamme.module';
import { PlanPreventifPredefiniModule } from './modules/plan-preventif-predefini/plan-preventif-predefini.module';
import { PlanPreventifModule } from './modules/plan-preventif/plan-preventif.module';
import { HistoriqueDeclenchementPreventifModule } from './modules/historique-declenchement-preventif/historique-declenchement-preventif.module';
import { InterventionModule } from './modules/intervention/intervention.module'; 
import { DemandeInterventionModule } from './modules/demande-intervention/demande-intervention.module';
import { PointMesureModule } from './modules/point-mesure/point-mesure.module';
import { ReleveMesureModule } from './modules/releve-mesure/releve-mesure.module';
import { TypeEquipementModule } from './modules/type-equipement/type-equipement.module';
import { FabricantModule } from './modules/fabricant/fabricant.module';
import { MarqueModule } from './modules/marque/marque.module';
@Module({
  imports: [PrismaModule, FamilleModule,ReservationsModule,ModeleModule,EtatModeleModule,ArborescenceModule, PointsStructureModule,UniteArticleModule, ArticleModule,MaterielModule, MagasinModule,InventairesPreparesModule, InventaireModule,StockModule,DemandesTransfertModule, ReapprovisionnementModule,GammeModule,PlanPreventifPredefiniModule,PlanPreventifModule,
    HistoriqueDeclenchementPreventifModule,
    InterventionModule,
    PointMesureModule,
    ReleveMesureModule,
     TypeEquipementModule,
    FabricantModule,
    MarqueModule,
    DemandeInterventionModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}