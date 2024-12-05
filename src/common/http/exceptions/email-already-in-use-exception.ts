import { ConflictException } from '@nestjs/common';

export class EmailAlreadyInUseException extends ConflictException {
  constructor() {
    super('The email address is already in use.');
  }
}
