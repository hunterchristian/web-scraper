type ExecuteFn<T> = (...args: any[]) => Promise<T>;

export default class Command<T> {
  executeFn: ExecuteFn<T>;

  constructor(executeFn: ExecuteFn<T>) {
    this.executeFn = executeFn;
  }

  execute = async (...args: any[]) =>
    this.executeFn(...args)
}
