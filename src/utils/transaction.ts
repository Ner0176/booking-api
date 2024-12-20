import { InternalServerErrorException } from '@nestjs/common';
import { QueryRunner } from 'typeorm';

export async function createTransaction(
  queryRunner: QueryRunner,
  callback: () => Promise<void>,
) {
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    await callback();
    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw new InternalServerErrorException(
      `Transaction failed: ${error.message}`,
    );
  } finally {
    await queryRunner.release();
  }
}
