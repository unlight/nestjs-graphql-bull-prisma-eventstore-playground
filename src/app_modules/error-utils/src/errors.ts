import ModernError from 'modern-errors';
import modernErrorsClean from 'modern-errors-clean';

export const BaseError = ModernError.subclass('BaseError', {
  plugins: [modernErrorsClean],
});

export const UnknownError = BaseError.subclass('UnknownError');
export const InputError = BaseError.subclass('InputError');
export const AuthError = BaseError.subclass('AuthError');
export const DatabaseError = BaseError.subclass('DatabaseError');

// BaseError.logProcess({
//   onError(error, event) {
//     console.log('event', event);
//     console.log('error', error);
//   },
// });

// Promise.resolve().then(() => {
//   throw new Error();
// });
// ├─ clean-stack@5.2.0
// ├─ error-custom-class@10.0.0
// ├─ filter-obj@5.1.0
// ├─ is-error-instance@2.0.0
// ├─ merge-error-cause@5.0.0
// ├─ modern-errors-clean@6.0.0
// ├─ modern-errors@7.0.1
// ├─ redefine-property@3.0.0
// ├─ set-error-class@3.0.0
// ├─ set-error-stack@3.0.0
// └─ wrap-error-message@3.0.0
