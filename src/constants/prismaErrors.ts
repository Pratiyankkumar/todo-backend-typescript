export enum PrismaErrorCode {
  ForeignKeyConstraintViolation = "P2003",
  UniqueConstraintViolation = "P2002",
  RecordNotFound = "P2025",
  ValidationError = "P2000",
}

export const PrismaErrorMessages: Record<PrismaErrorCode, string> = {
  [PrismaErrorCode.ForeignKeyConstraintViolation]:
    "Foreign key constraint failed. The related record was not found.",
  [PrismaErrorCode.UniqueConstraintViolation]:
    "Unique constraint violation. The field must be unique.",
  [PrismaErrorCode.RecordNotFound]:
    "The requested record was not found in the database.",
  [PrismaErrorCode.ValidationError]:
    "A value provided for a field is invalid or violates a constraint.",
};
