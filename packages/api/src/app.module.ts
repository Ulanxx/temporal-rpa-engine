import { Module } from '@nestjs/common';
import { WorkflowController } from './controllers/workflow.controller';
import { WorkflowService } from './services/workflow.service';
import { TemporalService } from './services/temporal.service';

@Module({
  imports: [],
  controllers: [WorkflowController],
  providers: [WorkflowService, TemporalService],
})
export class AppModule {}
