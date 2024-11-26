import { PartialType } from '@nestjs/mapped-types';

import { AddTaskDto } from './add-task.dto';

export class UpdateTaskDto extends PartialType(AddTaskDto) {}
