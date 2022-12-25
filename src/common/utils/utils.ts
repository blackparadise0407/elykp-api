import * as crypto from 'crypto';

export const uniqueBy = <T>(array: Array<T>, key: keyof T) => [
  ...new Map(array.map((item) => [item[key], item])).values(),
];

export const randomBytes = (bytes: number) => {
  return new Promise<string>((resolve, reject) => {
    crypto.randomBytes(bytes, (err, buf) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(buf.toString('hex'));
    });
  });
};
