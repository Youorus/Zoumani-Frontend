type AccessTokenResolver = () => string | null | Promise<string | null>;

let accessTokenResolver: AccessTokenResolver = () => null;

export function configureAuthInterceptor(resolver: AccessTokenResolver) {
  accessTokenResolver = resolver;
}

export async function resolveAccessToken() {
  return accessTokenResolver();
}
