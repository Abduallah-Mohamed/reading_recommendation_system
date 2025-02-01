import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsPageRangeValid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPageRangeValid',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const startPage = args.object['start_page'];
          const endPage = args.object['end_page'];
          return startPage < endPage; // Validate that start_page < end_page
        },
        defaultMessage() {
          return 'start_page must be less than end_page';
        },
      },
    });
  };
}
