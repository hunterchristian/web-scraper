class ElementNotFound extends Error {
  constructor(selector: string) {
    super(`could not find element for selector: ${ selector }`);
    Error.captureStackTrace(this, ElementNotFound);
  }
}

export default async (selector: string) => {
  throw new ElementNotFound(selector);
}
