import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { FarmsModule } from './modules/farms/farms.module'
import { ProductionModule } from './modules/production/production.module'
import { MortalityModule } from './modules/mortality/mortality.module'
import { InventoryModule } from './modules/inventory/inventory.module'
import { FeedModule } from './modules/feed/feed.module'
import { ExpensesModule } from './modules/expenses/expenses.module'
import { SalesModule } from './modules/sales/sales.module'
import { WorkersModule } from './modules/workers/workers.module'
import { PayrollModule } from './modules/payroll/payroll.module'
import { PricingModule } from './modules/pricing/pricing.module'
import { AnalyticsModule } from './modules/analytics/analytics.module'
import { ReportsModule } from './modules/reports/reports.module'
import { PensModule } from './modules/pens/pens.module'
import { OtherSalesModule } from './modules/other-sales/other-sales.module'
import { StockModule } from './modules/stock/stock.module'
import { FeedFormulaModule } from './modules/feed-formula/feed-formula.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    FarmsModule,
    ProductionModule,
    MortalityModule,
    InventoryModule,
    FeedModule,
    ExpensesModule,
    SalesModule,
    WorkersModule,
    PayrollModule,
    PricingModule,
    AnalyticsModule,
    ReportsModule,
    PensModule,
    OtherSalesModule,
    StockModule,
    FeedFormulaModule,
  ],
})
export class AppModule {}
