import { db } from '../database/db';
import { eq, isNull } from 'drizzle-orm';
export interface ServiceResult<T> {
  data?: T;
  error?: string;
  statusCode?: number;
}
export abstract class BaseService<TTable> {
  protected table: TTable;
  protected softDelete: boolean = true;

  constructor(table: TTable) {
    this.table = table;
  }

  protected activeCondition() {
    if (!this.softDelete) {return undefined;}
    return isNull((this.table as any).deleted_at);
  }

  protected async softDeleteById(id: string): Promise<void> {
    await db.update(this.table as any)
      .set({ deleted_at: new Date() })
      .where(eq((this.table as any).id, id));
  }

  protected async restore(id: string): Promise<void> {
    await db.update(this.table as any)
      .set({ deleted_at: null })
      .where(eq((this.table as any).id, id));
  }
}