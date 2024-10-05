import ModernError from 'modern-errors';
import modernErrorsClean from 'modern-errors-clean';

export const BaseError = ModernError.subclass('BaseError', {
  plugins: [modernErrorsClean],
});

export const BadRequestError = BaseError.subclass('BadRequestError');
export const UnknownError = BaseError.subclass('UnknownError');
export const InputError = BaseError.subclass('InputError');
export const AuthError = BaseError.subclass('AuthError');
export const DatabaseError = BaseError.subclass('DatabaseError');
