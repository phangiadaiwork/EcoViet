import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { PhoneUtil } from '../utils/phone.util';

export function IsVietnamesePhone(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isVietnamesePhone',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }
          return PhoneUtil.isValidVietnamesePhoneNumber(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Số điện thoại không hợp lệ (phải là số điện thoại Việt Nam)';
        },
      },
    });
  };
}
