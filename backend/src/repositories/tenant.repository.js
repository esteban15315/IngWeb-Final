// REPOSITORY de organizaciones: única capa que accede a la colección "tenants".
import { Tenant } from '../models/Tenant.js';

export const tenantRepository = {
  create(data) {
    return Tenant.create(data);
  },

  removeById(id) {
    return Tenant.deleteOne({ id });
  },
};
