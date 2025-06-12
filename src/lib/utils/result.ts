export class Result<T, E> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: E,
  ) {}

  static ok<T, E>(value: T): Result<T, E> {
    return new Result<T, E>(true, value);
  }

  static error<T, E>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  get isSuccess(): boolean {
    return this._isSuccess;
  }

  get isError(): boolean {
    return !this._isSuccess;
  }

  get value(): T {
    if (!this._isSuccess || this._value === undefined) {
      throw new Error("Cannot get value from error result");
    }
    return this._value;
  }

  get error(): E {
    if (this._isSuccess || this._error === undefined) {
      throw new Error("Cannot get error from success result");
    }
    return this._error;
  }
}
