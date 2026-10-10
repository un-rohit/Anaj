/**
 * ANAJ — Development Seed Data
 * Run with: npm run db:seed
 *
 * Seeds:
 *  - Company settings (public + internal)
 *  - Initial owner account
 *  - 7 agricultural products with bilingual translations
 *  - Sample purchase rates
 *
 * IMPORTANT: This file contains only development/test data.
 * Never run this against a production database.
 */

import { PrismaClient, Language, Unit } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Reference number generator (shared with production code later)
// ---------------------------------------------------------------------------
let seqCounter = 1;
function nextRef(): string {
  const year = new Date().getFullYear();
  const seq = String(seqCounter++).padStart(6, '0');
  return `ANJ-${year}-${seq}`;
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const PRODUCTS = [
  {
    slug: 'wheat',
    allowedUnits: [Unit.KG, Unit.QUINTAL] as Unit[],
    sortOrder: 1,
    translations: [
      { language: Language.HI, name: 'गेहूं', description: 'मध्यम और उच्च गुणवत्ता का गेहूं' },
      { language: Language.EN, name: 'Wheat', description: 'Medium and high quality wheat' },
    ],
    ratePerQuintal: '2200.00',
  },
  {
    slug: 'paddy',
    allowedUnits: [Unit.KG, Unit.QUINTAL] as Unit[],
    sortOrder: 2,
    translations: [
      { language: Language.HI, name: 'धान', description: 'खरीफ मौसम की धान' },
      { language: Language.EN, name: 'Paddy', description: 'Kharif season paddy' },
    ],
    ratePerQuintal: '2183.00',
  },
  {
    slug: 'rice',
    allowedUnits: [Unit.KG, Unit.QUINTAL] as Unit[],
    sortOrder: 3,
    translations: [
      { language: Language.HI, name: 'चावल', description: 'साफ और सूखा चावल' },
      { language: Language.EN, name: 'Rice', description: 'Clean and dry rice' },
    ],
    ratePerQuintal: '3200.00',
  },
  {
    slug: 'maize',
    allowedUnits: [Unit.KG, Unit.QUINTAL] as Unit[],
    sortOrder: 4,
    translations: [
      { language: Language.HI, name: 'मक्का', description: 'सूखी और साफ मक्का' },
      { language: Language.EN, name: 'Maize', description: 'Dry and clean maize' },
    ],
    ratePerQuintal: '1850.00',
  },
  {
    slug: 'mustard',
    allowedUnits: [Unit.KG, Unit.QUINTAL] as Unit[],
    sortOrder: 5,
    translations: [
      { language: Language.HI, name: 'सरसों', description: 'रबी सरसों' },
      { language: Language.EN, name: 'Mustard', description: 'Rabi mustard' },
    ],
    ratePerQuintal: '5450.00',
  },
  {
    slug: 'bajra',
    allowedUnits: [Unit.KG, Unit.QUINTAL] as Unit[],
    sortOrder: 6,
    translations: [
      { language: Language.HI, name: 'बाजरा', description: 'मोती बाजरा' },
      { language: Language.EN, name: 'Bajra', description: 'Pearl millet' },
    ],
    ratePerQuintal: '2500.00',
  },
  {
    slug: 'arhar',
    allowedUnits: [Unit.KG, Unit.QUINTAL] as Unit[],
    sortOrder: 7,
    translations: [
      { language: Language.HI, name: 'अरहर', description: 'अरहर दाल (तुअर)' },
      { language: Language.EN, name: 'Arhar', description: 'Pigeon pea (Tur dal)' },
    ],
    ratePerQuintal: '6600.00',
  },
] as const;

const COMPANY_SETTINGS = [
  // Public settings (safe to expose to the farmer app)
  { key: 'company.name', value: 'ANAJ', isPublic: true },
  { key: 'company.name.hi', value: 'अनाज', isPublic: true },
  {
    key: 'company.address',
    value: 'Navaka Tola, Mairwa, Siwan, Bihar, PIN 841239',
    isPublic: true,
  },
  {
    key: 'company.address.hi',
    value: 'नवका टोला, मैरवा, सीवान, बिहार - 841239',
    isPublic: true,
  },
  { key: 'company.phone', value: '7061654008', isPublic: true },
  // NOTE: Email preserved exactly as supplied. "gamil.com" may be a typo for
  // "gmail.com" — please verify with the business owner before production.
  { key: 'company.email', value: 'anajsellkishan01@gamil.com', isPublic: true },
  {
    key: 'company.support.hours',
    value: 'Monday–Saturday, 9:00 AM – 6:00 PM',
    isPublic: true,
  },
  {
    key: 'company.support.hours.hi',
    value: 'सोमवार–शनिवार, सुबह 9 बजे – शाम 6 बजे',
    isPublic: true,
  },
  // Internal settings
  { key: 'otp.expiry.minutes', value: '10', isPublic: false },
  { key: 'otp.max.attempts', value: '5', isPublic: false },
  { key: 'sell.request.expected.price.enabled', value: 'true', isPublic: false },
  { key: 'sell.request.max.photos', value: '5', isPublic: false },
];

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

async function main() {
  console.log('🌱 Starting ANAJ seed...\n');

  // 1. Owner account
  console.log('→ Creating owner account...');
  const passwordHash = await bcrypt.hash('Dev@anaj2024!', 12);
  const owner = await prisma.user.upsert({
    where: { phone: '9000000001' },
    update: {},
    create: {
      name: 'NK.PATEL',
      phone: '9000000001',
      email: 'owner@anaj.local',
      passwordHash,
      role: 'OWNER',
      isActive: true,
      language: 'HI',
    },
  });
  console.log(`   ✓ Owner: ${owner.name} (${owner.phone})`);

  // 2. Company settings
  console.log('→ Seeding company settings...');
  for (const setting of COMPANY_SETTINGS) {
    await prisma.companySettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log(`   ✓ ${COMPANY_SETTINGS.length} settings seeded`);

  // 3. Products
  console.log('→ Seeding products...');
  for (const p of PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        isActive: true,
        allowedUnits: p.allowedUnits,
        sortOrder: p.sortOrder,
      },
      create: {
        slug: p.slug,
        allowedUnits: p.allowedUnits,
        sortOrder: p.sortOrder,
        isActive: true,
      },
    });

    for (const t of p.translations) {
      await prisma.productTranslation.upsert({
        where: { productId_language: { productId: product.id, language: t.language } },
        update: { name: t.name, description: t.description },
        create: {
          productId: product.id,
          language: t.language,
          name: t.name,
          description: t.description,
        },
      });
    }

    // Seed one initial purchase rate per product
    const existingRate = await prisma.purchaseRate.findFirst({
      where: { productId: product.id, isActive: true },
    });

    if (!existingRate) {
      await prisma.purchaseRate.create({
        data: {
          productId: product.id,
          ratePerQuintal: p.ratePerQuintal,
          effectiveFrom: new Date(),
          isActive: true,
          notes: 'Initial development seed rate',
          createdById: owner.id,
        },
      });
    }

    const hiName = p.translations.find((t) => t.language === 'HI')?.name ?? p.slug;
    console.log(`   ✓ ${hiName} / ${p.translations.find((t) => t.language === 'EN')?.name} @ ₹${p.ratePerQuintal}/qtl`);
  }

  // 4. Sample farmer (dev only)
  console.log('→ Creating sample farmer...');
  const sampleFarmer = await prisma.farmer.upsert({
    where: { phone: '9876543210' },
    update: {},
    create: {
      phone: '9876543210',
      name: 'राम कुमार',
      isVerified: true,
      isActive: true,
      language: 'HI',
      address: {
        create: {
          village: 'मैरवा',
          postOffice: 'मैरवा',
          district: 'सीवान',
          state: 'Bihar',
          pinCode: '841239',
        },
      },
    },
  });
  console.log(`   ✓ Farmer: ${sampleFarmer.name} (${sampleFarmer.phone})`);

  console.log('\n✅ Seed complete!\n');
  console.log('Dev credentials:');
  console.log('  Owner phone: 9000000001  password: Dev@anaj2024!');
  console.log('  Farmer phone: 9876543210  (OTP: use any dev bypass in .env)\n');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
