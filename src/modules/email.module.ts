import { Module, Global } from '@nestjs/common';
import { EmailService } from '../services/email.service';

@Global()
@Module({
  controllers: [],
  providers: [EmailService],
  exports: [EmailService]
})
export class EmailModule {}
