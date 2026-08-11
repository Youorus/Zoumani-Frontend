"use client";

import { useMutation } from "@tanstack/react-query";

import { createAccount } from "../api/create-account";

export function useCreateAccount() {
  return useMutation({ mutationFn: createAccount });
}
