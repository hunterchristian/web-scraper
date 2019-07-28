class ElementNotFound extends Error {
  constructor(envVar: string) {
    super(`environment variable must be defined: ${ envVar }`);
    Error.captureStackTrace(this, ElementNotFound);
  }
}

export default (envVar: string) => {
  throw new ElementNotFound(envVar);
}