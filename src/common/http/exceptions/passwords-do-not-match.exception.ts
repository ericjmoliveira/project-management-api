import { BadRequestException } from '@nestjs/common';

export class PasswordsDoNotMatchException extends BadRequestException {
  constructor() {
    super('The passwords do not match.');
  }
}
