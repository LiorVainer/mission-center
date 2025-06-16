import { ZodSchema } from 'zod';

export function validate<T>(schema: ZodSchema<T>, input: unknown) {
  const result = schema.safeParse(input);
  if (!result.success) {
    return {
      success: false,
      error: result.error.flatten().formErrors.join('; '),
    };
  }
  return {
    success: true,
    data: result.data,
  };
}
