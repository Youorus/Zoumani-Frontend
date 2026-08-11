import type { CreateAccountInput } from "../schemas/create-account.schema";

export async function createAccount(input: CreateAccountInput) {
  await new Promise((resolve) => setTimeout(resolve, 1_000));

  return {
    id: `account-${Date.now()}`,
    role: input.role,
    firstName: input.firstName,
  };
}
