export type EntityAudit = {
  createdTime: Date;
  updatedTime: Date;
  deletedTime?: Date;
  userId: string;
};

export type AuditResponse<TItem extends EntityAudit> = {
  items: TItem[];
  users: Record<string, { id: string; name: string }>;
};
