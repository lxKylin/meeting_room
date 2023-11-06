import { Module, Global } from '@nestjs/common';

import { EmailController } from '@/controllers/email.controller';
import { EmailService } from '../services/email.service';

@Global()
@Module({
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService]
})
export class EmailModule {}
