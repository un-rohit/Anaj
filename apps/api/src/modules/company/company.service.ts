import { prisma } from '../../lib/prisma.js';
import { logAudit } from '../../lib/audit.js';

export interface CompanyPublicInfo {
  name: string;
  nameHi: string;
  ownerName: string;
  supportPhone: string;
  supportEmail: string;
  emailWarningNote?: string | undefined;
  address: string;
  addressHi: string;
  minPurchaseQuantityKg: number;
}

const DEFAULT_COMPANY_SETTINGS: CompanyPublicInfo = {
  name: 'ANAJ',
  nameHi: 'अनाज',
  ownerName: 'NK.PATEL',
  supportPhone: '7061654008',
  supportEmail: 'anajsellkishan01@gamil.com',
  emailWarningNote: 'Preserved as configured (domain gamil.com pending production verification)',
  address: 'Navaka Tola, Mairwa, Siwan, Bihar, PIN 841239',
  addressHi: 'नवका टोला, मैरवा, सीवान, बिहार, पिन 841239',
  minPurchaseQuantityKg: 100,
};

export class CompanyService {
  /**
   * Get public company details and support contact for farmers and web visitors
   */
  async getPublicInfo(): Promise<CompanyPublicInfo> {
    const settings = await prisma.companySettings.findMany({
      where: { isPublic: true },
    });

    const settingsMap = new Map(settings.map((s) => [s.key, s.value]));

    return {
      name: settingsMap.get('company_name') ?? DEFAULT_COMPANY_SETTINGS.name,
      nameHi: settingsMap.get('company_name_hi') ?? DEFAULT_COMPANY_SETTINGS.nameHi,
      ownerName: settingsMap.get('owner_name') ?? DEFAULT_COMPANY_SETTINGS.ownerName,
      supportPhone: settingsMap.get('support_phone') ?? DEFAULT_COMPANY_SETTINGS.supportPhone,
      supportEmail: settingsMap.get('support_email') ?? DEFAULT_COMPANY_SETTINGS.supportEmail,
      emailWarningNote: DEFAULT_COMPANY_SETTINGS.emailWarningNote,
      address: settingsMap.get('address') ?? DEFAULT_COMPANY_SETTINGS.address,
      addressHi: settingsMap.get('address_hi') ?? DEFAULT_COMPANY_SETTINGS.addressHi,
      minPurchaseQuantityKg: settingsMap.has('min_purchase_quantity_kg')
        ? parseInt(settingsMap.get('min_purchase_quantity_kg')!, 10)
        : DEFAULT_COMPANY_SETTINGS.minPurchaseQuantityKg,
    };
  }

  /**
   * Admin: Get all settings (including private internal configuration)
   */
  async getAllSettings() {
    return prisma.companySettings.findMany({
      orderBy: { key: 'asc' },
    });
  }

  /**
   * Admin: Update or create a company setting
   */
  async updateSetting(key: string, value: string, isPublic: boolean, adminUserId: string) {
    const existing = await prisma.companySettings.findUnique({ where: { key } });

    const updated = await prisma.companySettings.upsert({
      where: { key },
      create: { key, value, isPublic },
      update: { value, isPublic },
    });

    await logAudit({
      actorId: adminUserId,
      actorType: 'USER',
      action: 'COMPANY_SETTING_UPDATED',
      entityType: 'CompanySettings',
      entityId: updated.id,
      before: existing ? { key: existing.key, value: existing.value } : null,
      after: { key: updated.key, value: updated.value, isPublic: updated.isPublic },
    });

    return updated;
  }
}

export const companyService = new CompanyService();
