'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { FarmerNav } from '@/components/FarmerNav';
import { getProducts, getCompanyInfo, type ProductItem, type CompanyInfo } from '@/lib/api-client';
import {
  Wheat,
  Sprout,
  Truck,
  Scale,
  CreditCard,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';

const FALLBACK_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-wheat',
    slug: 'wheat',
    name: 'गेहूं (Wheat)',
    description: 'मध्यम और उच्च गुणवत्ता का गेहूं',
    imageUrl: null,
    isActive: true,
    allowedUnits: ['QUINTAL', 'KG'],
    sortOrder: 1,
    currentRate: { id: 'r1', ratePerQuintal: '2200.00', effectiveFrom: '2026-10-10' },
  },
  {
    id: 'prod-paddy',
    slug: 'paddy',
    name: 'धान (Paddy)',
    description: 'खरीफ मौसम की ताजा धान',
    imageUrl: null,
    isActive: true,
    allowedUnits: ['QUINTAL', 'KG'],
    sortOrder: 2,
    currentRate: { id: 'r2', ratePerQuintal: '2183.00', effectiveFrom: '2026-10-10' },
  },
  {
    id: 'prod-rice',
    slug: 'rice',
    name: 'चावल (Rice)',
    description: 'साफ और सूखा चावल',
    imageUrl: null,
    isActive: true,
    allowedUnits: ['QUINTAL', 'KG'],
    sortOrder: 3,
    currentRate: { id: 'r3', ratePerQuintal: '3100.00', effectiveFrom: '2026-10-10' },
  },
  {
    id: 'prod-maize',
    slug: 'maize',
    name: 'मक्का (Maize)',
    description: 'पीली दानेदार सूखी मक्का',
    imageUrl: null,
    isActive: true,
    allowedUnits: ['QUINTAL', 'KG'],
    sortOrder: 4,
    currentRate: { id: 'r4', ratePerQuintal: '2090.00', effectiveFrom: '2026-10-10' },
  },
  {
    id: 'prod-mustard',
    slug: 'mustard',
    name: 'सरसों (Mustard)',
    description: 'उच्च तेल मात्रा वाली सरसों',
    imageUrl: null,
    isActive: true,
    allowedUnits: ['QUINTAL', 'KG'],
    sortOrder: 5,
    currentRate: { id: 'r5', ratePerQuintal: '5650.00', effectiveFrom: '2026-10-10' },
  },
  {
    id: 'prod-bajra',
    slug: 'bajra',
    name: 'बाजरा (Bajra)',
    description: 'साफ और सूखा बाजरा',
    imageUrl: null,
    isActive: true,
    allowedUnits: ['QUINTAL', 'KG'],
    sortOrder: 6,
    currentRate: { id: 'r6', ratePerQuintal: '2500.00', effectiveFrom: '2026-10-10' },
  },
  {
    id: 'prod-arhar',
    slug: 'arhar',
    name: 'अरहर (Arhar / Pigeon Pea)',
    description: 'साफ अरहर दाल बीज',
    imageUrl: null,
    isActive: true,
    allowedUnits: ['QUINTAL', 'KG'],
    sortOrder: 7,
    currentRate: { id: 'r7', ratePerQuintal: '7000.00', effectiveFrom: '2026-10-10' },
  },
];

export default function FarmerPortalHomePage() {
  const locale = useLocale() as 'hi' | 'en';
  const t = useTranslations('farmerWeb');
  const tc = useTranslations('common');

  const [products, setProducts] = useState<ProductItem[]>(FALLBACK_PRODUCTS);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodList, compInfo] = await Promise.all([
          getProducts(locale).catch(() => FALLBACK_PRODUCTS),
          getCompanyInfo().catch(() => null),
        ]);
        if (prodList && prodList.length > 0) {
          setProducts(prodList);
        }
        if (compInfo) {
          setCompany(compInfo);
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [locale]);

  const prefix = locale === 'hi' ? '' : `/${locale}`;

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col font-sans">
      <FarmerNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-green-900 text-white py-16 sm:py-24">
        {/* Decorative grain backdrop */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-700/50 px-3.5 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-md mb-6 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>{locale === 'hi' ? 'सीधी खरीद — कोई बिचौलिया नहीं' : 'Direct Company Procurement — 0 Middlemen'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white mb-6">
              {locale === 'hi' ? (
                <>
                  किसानों की उपज का <span className="text-amber-300">सही दाम</span>, सीधा अनाज कंपनी को बेचें
                </>
              ) : (
                <>
                  Fair Prices for Your Crops, <span className="text-amber-300">Sold Directly</span> to ANAJ
                </>
              )}
            </h1>

            <p className="text-base sm:text-xl text-emerald-100/90 leading-relaxed mb-8 max-w-2xl">
              {locale === 'hi'
                ? 'गेहूं, धान, मक्का, सरसों व अन्य फसलों के लिए आज की आधिकारिक समर्थन दरें देखें। अपने घर या खेत से संग्रह का अनुरोध करें और पारदर्शी डिजिटल भुगतान प्राप्त करें।'
                : "Check today's guaranteed procurement rates for wheat, paddy, maize, mustard and more. Request farm-gate collection and receive direct bank settlement."}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={`${prefix}/farmer/sell`}
                className="inline-flex items-center gap-2.5 rounded-2xl bg-amber-400 px-6 py-3.5 text-base font-bold text-gray-950 shadow-lg shadow-amber-400/25 hover:bg-amber-300 transition-all hover:scale-[1.02] active:scale-95"
              >
                <span>{t('sellYourCrop')}</span>
                <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                href="#rates"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md px-6 py-3.5 text-base font-semibold text-white hover:bg-white/20 transition-all"
              >
                <span>{t('todayRates')}</span>
              </Link>

              <Link
                href={`${prefix}/farmer/requests`}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md px-6 py-3.5 text-base font-semibold text-white hover:bg-white/20 transition-all"
              >
                <span>{t('myRequests')}</span>
              </Link>
            </div>

            {/* Direct Sale Disclaimer Banner */}
            <div className="mt-8 flex items-start gap-3 rounded-xl bg-emerald-950/60 border border-emerald-500/20 p-3.5 text-xs text-emerald-200">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <p>{t('directSaleNotice')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Procurement Rates Section */}
      <section id="rates" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full mb-2">
              <Wheat className="h-3.5 w-3.5" />
              <span>{locale === 'hi' ? 'ताजा दर सूची' : 'Current Rate List'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              {t('todayRates')}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              {t('todayRatesSubtitle')}
            </p>
          </div>

          <div className="text-xs text-gray-500 flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-sm">
            <Calendar className="h-4 w-4 text-emerald-600" />
            <span>{locale === 'hi' ? 'दरें प्रति क्विंटल (100 कि.ग्रा.)' : 'Rates per Quintal (100 KG)'}</span>
          </div>
        </div>

        {/* Rates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((crop) => {
            const rateStr = crop.currentRate?.ratePerQuintal
              ? Number(crop.currentRate.ratePerQuintal).toLocaleString('en-IN')
              : '2,200';

            return (
              <div
                key={crop.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all duration-200"
              >
                <div>
                  {/* Top crop badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center text-emerald-800 border border-emerald-200 shadow-inner group-hover:scale-105 transition-transform">
                      <Sprout className="h-6 w-6 text-emerald-700" />
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" />
                      {locale === 'hi' ? 'खरीद चालू' : 'Open'}
                    </span>
                  </div>

                  {/* Crop Name */}
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                    {crop.name}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                    {crop.description || (locale === 'hi' ? 'उच्च गुणवत्ता का प्रमाणित उत्पाद' : 'Certified quality produce')}
                  </p>

                  {/* Price Banner */}
                  <div className="mt-5 rounded-xl bg-gradient-to-r from-emerald-50/80 to-amber-50/80 p-3.5 border border-emerald-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {t('ratePerQuintal')}
                    </span>
                    <div className="mt-0.5 flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-extrabold text-emerald-800">₹{rateStr}</span>
                      <span className="text-xs font-bold text-gray-500">/ {locale === 'hi' ? 'क्विंटल' : 'Quintal'}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-gray-500">
                      ≈ ₹{(Number(rateStr.replace(/,/g, '')) / 100).toFixed(1)} / {locale === 'hi' ? 'किलो' : 'KG'}
                    </p>
                  </div>
                </div>

                {/* Sell Action */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">
                    {locale === 'hi' ? 'इकाई: क्विंटल / किलो' : 'Units: Quintal / KG'}
                  </span>
                  <Link
                    href={`${prefix}/farmer/sell?crop=${crop.slug}`}
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
                  >
                    <span>{locale === 'hi' ? 'बेचें' : 'Sell'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-white py-16 sm:py-20 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {locale === 'hi' ? 'पारदर्शी प्रक्रिया' : 'Simple & Transparent'}
            </span>
            <h2 className="mt-3 text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              {t('howItWorks')}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              {locale === 'hi'
                ? '4 आसान चरणों में अपनी फसल का उचित मूल्य सीधे अपने बैंक खाते में प्राप्त करें'
                : 'Receive the genuine value for your crops directly in your bank account in 4 easy steps'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Sprout,
                title: t('step1Title'),
                desc: t('step1Desc'),
                color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
              },
              {
                icon: CheckCircle2,
                title: t('step2Title'),
                desc: t('step2Desc'),
                color: 'bg-amber-100 text-amber-800 border-amber-200',
              },
              {
                icon: Truck,
                title: t('step3Title'),
                desc: t('step3Desc'),
                color: 'bg-purple-100 text-purple-800 border-purple-200',
              },
              {
                icon: CreditCard,
                title: t('step4Title'),
                desc: t('step4Desc'),
                color: 'bg-blue-100 text-blue-800 border-blue-200',
              },
            ].map((step, idx) => {
              const IconComp = step.icon;
              return (
                <div
                  key={step.title}
                  className="relative rounded-2xl border border-gray-100 bg-slate-50 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
                >
                  <div>
                    <div
                      className={`h-12 w-12 rounded-xl flex items-center justify-center border ${step.color} mb-5 shadow-sm`}
                    >
                      <IconComp className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                  <div className="mt-6 text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <span>{locale === 'hi' ? `चरण ${idx + 1}` : `Stage ${idx + 1}`}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Official Company Support & Contact Section */}
      <section id="support" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-900 to-green-950 text-white p-8 sm:p-12 shadow-xl border border-emerald-800/60 relative overflow-hidden">
          <div className="relative max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-800/80 border border-emerald-700 px-3 py-1 text-xs font-semibold text-emerald-200 mb-4">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>{locale === 'hi' ? 'कंपनी अधिकृत जानकारी' : 'Company Authorized Information'}</span>
            </span>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              {t('supportContact')}
            </h2>
            <p className="text-emerald-100/90 text-sm sm:text-base mb-8 leading-relaxed">
              {locale === 'hi'
                ? 'किसी भी सहायता, फसल दर की जानकारी या विशेष अनुरोध के लिए सीधे अनाज कंपनी मालिक और ग्राहक सहायता टीम से संपर्क करें।'
                : 'For any assistance, procurement rate inquiry, or special requests, contact ANAJ company directly.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 text-sm">
              <div className="flex items-start gap-3 rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/10">
                <Phone className="h-5 w-5 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-emerald-200">{t('contactPerson')}</p>
                  <a href="tel:7061654008" className="text-base font-bold text-white hover:text-amber-300">
                    7061654008
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/10">
                <MapPin className="h-5 w-5 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-emerald-200">{t('owner')}</p>
                  <p className="text-sm font-semibold text-white">
                    {company?.address || 'Navaka Tola, Mairwa, Siwan, Bihar, PIN 841239'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/10 sm:col-span-2">
                <Mail className="h-5 w-5 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-emerald-200">{locale === 'hi' ? 'आधिकारिक ईमेल' : 'Official Email'}</p>
                  <a
                    href="mailto:anajsellkishan01@gamil.com"
                    className="text-sm font-semibold text-white hover:text-amber-300"
                  >
                    anajsellkishan01@gamil.com
                  </a>
                  <p className="text-[11px] text-amber-200/80 mt-0.5">
                    {locale === 'hi'
                      ? 'नोट: डोमेन gamil.com कंपनी द्वारा दर्ज किया गया मूल ईमेल है।'
                      : 'Note: Domain gamil.com is preserved as officially recorded by the business owner.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="tel:7061654008"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold text-gray-950 shadow-md hover:bg-amber-300 transition-all active:scale-95"
              >
                <Phone className="h-4 w-4" />
                <span>{locale === 'hi' ? 'सीधे कॉल करें' : 'Call Support Now'}</span>
              </a>

              <Link
                href={`${prefix}/farmer/sell`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white hover:bg-white/20 transition-all"
              >
                <span>{t('sellYourCrop')}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
              अ
            </div>
            <span className="font-semibold text-gray-900">अनाज (ANAJ)</span>
            <span>—</span>
            <span>{locale === 'hi' ? 'कृषि खरीद मंच' : 'Agricultural Procurement Platform'}</span>
          </div>

          <p>© {new Date().getFullYear()} ANAJ. All rights reserved. Owner: NK.PATEL</p>

          <div className="flex items-center gap-4">
            <Link href={`${prefix}/admin`} className="hover:text-emerald-700 font-medium">
              {locale === 'hi' ? 'कंपनी एडमिन पोर्टल' : 'Company Admin Portal'}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
