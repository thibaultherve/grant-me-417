import { BadRequestException, PipeTransform } from '@nestjs/common';

interface ZodLikeSchema {
  safeParse(value: unknown): {
    success: boolean;
    data?: unknown;
    error?: {
      issues: Array<{ path: PropertyKey[]; message: string }>;
    };
  };
}

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodLikeSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const errors = result.error!.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      throw new BadRequestException({
        message: 'Validation failed',
        errors,
      });
    }

    return result.data;
  }
}
