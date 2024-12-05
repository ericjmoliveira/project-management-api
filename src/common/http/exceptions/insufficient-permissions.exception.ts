import { ForbiddenException } from '@nestjs/common';

export class InsufficientPermissionsException extends ForbiddenException {
  constructor() {
    super('You do not have sufficient permissions to perform this action.');
  }
}
