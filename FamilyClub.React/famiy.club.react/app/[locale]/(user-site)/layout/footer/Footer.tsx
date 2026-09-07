"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useLocalizedPath, useTranslations } from '@/lib/i18n/LocaleProvider';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const t = useTranslations();
    const lp = useLocalizedPath();

    return (
        <footer style={{ zIndex: "3" }} className="w-full flex flex-col justify-end overflow-visible">
            <div
                className="relative w-full h-[593.35px] border-x-[10px] border-b-[10px] border-footer-inner drop-shadow-[0_-8px_30px_rgba(0,0,0,0.5)] bg-top bg-cover bg-no-repeat flex flex-col"
                style={{
                    backgroundImage: "url('/images/Layout/Footer/Rectangle198.png')",
                }}
            >
                <div className="relative z-10 container mx-auto flex-grow flex justify-center items-start pt-[50px]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-[40px] md:gap-[80px] items-start w-full max-w-[1000px]">
                        <div className="flex flex-col items-center w-full md:w-[222px]">
                            <div className="w-[215px] h-[215px] mb-[28px]">
                                <Image
                                    src="/images/Layout/Footer/FooterQrCode.png"
                                    alt={t("footer.qrAlt")}
                                    width={215}
                                    height={215}
                                    priority
                                />
                            </div>

                            <div className="flex flex-col gap-[12px]">
                                <Link
                                    href="https://apple.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="relative w-[222px] h-[61.59px] flex items-center px-[16px] gap-[14px] group overflow-visible"
                                >
                                    <div className="absolute inset-0 bg-brand-black group-hover:bg-[var(--color-green)] group-hover:scale-105 rounded-[20px] transition-all duration-300 -z-10"></div>
                                    <div className="w-[60px] h-[60px] flex items-center justify-center shrink-0">
                                        <Image src="/images/Layout/Footer/AppleIcon.svg" width={28} height={34} alt="Apple" />
                                    </div>
                                    <div className="flex flex-col justify-center h-[42px] text-brand-white text-[14px] tracking-[-0.011em] whitespace-nowrap">
                                        <p className="font-normal">{t("footer.downloadFrom")}</p>
                                        <p className="font-semibold">App Store</p>
                                    </div>
                                </Link>

                                <Link
                                    href="https://google.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="relative w-[222px] h-[61.59px] flex items-center px-[16px] gap-[14px] group overflow-visible"
                                >
                                    <div className="absolute inset-0 bg-brand-black group-hover:bg-[var(--color-green)] group-hover:scale-105 rounded-[20px] transition-all duration-300 -z-10"></div>
                                    <div className="w-[60px] h-[60px] flex items-center justify-center shrink-0">
                                        <Image src="/images/Layout/Footer/GooglePlayIcon.svg" width={32} height={36} alt="Google Play" />
                                    </div>
                                    <div className="flex flex-col justify-center h-[42px] text-brand-white text-[14px] tracking-[-0.011em] whitespace-nowrap">
                                        <p className="font-normal">{t("footer.downloadFrom")}</p>
                                        <p className="font-semibold">Google Play</p>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        <div className="flex flex-col items-start w-full md:w-[295px] gap-[25px]">
                            <h2 className="footer-title">{t("footer.questions")}</h2>
                            <nav className="flex flex-col items-start gap-[15px]">
                                <Link className="footer-text" href={lp("/payment-delivery")}>{t("footer.paymentDelivery")}</Link>
                                <Link className="footer-text" href={lp("/personal-data-protection")}>{t("footer.personalDataProtection")}</Link>
                                <Link className="footer-text" href={lp("/terms-of-use")}>{t("footer.termsOfUse")}</Link>
                                <Link className="footer-text" href={lp("/product-return")}>{t("footer.productReturn")}</Link>
                                <Link className="footer-text" href={lp("/product-publication-policy")}>{t("footer.productPublicationPolicy")}</Link>
                                <Link className="footer-text" href={lp("/complaints")}>{t("footer.complaints")}</Link>
                            </nav>
                        </div>

                        <div className="flex flex-col items-start w-full md:w-[295px] gap-[25px]">
                            <h2 className="footer-title">{t("footer.contacts")}</h2>

                            <div className="flex flex-col items-start gap-[15px]">
                                <div className="flex items-center gap-[15px]">
                                    <div className="w-[34px] h-[34px] flex items-center justify-center">
                                        <Image
                                            src="/images/Layout/Footer/AddressIcon.svg"
                                            width={21.41}
                                            height={27.36}
                                            alt="Address"
                                        />
                                    </div>
                                    <p className="footer-text h-[27px] flex items-center">
                                        {t("footer.address")}
                                    </p>
                                </div>

                                <div className="flex items-center gap-[15px]">
                                    <div className="w-[34px] h-[34px] flex items-center justify-center">
                                        <Image
                                            src="/images/Layout/Footer/PhoneIcon.svg"
                                            width={25.6}
                                            height={28.8}
                                            alt="Phone"
                                        />
                                    </div>
                                    <a href="tel:08005553535" className="footer-text h-[27px] flex items-center hover:opacity-70 transition-opacity">
                                        0 (800) 555 35 35
                                    </a>
                                </div>

                                <div className="flex items-center gap-[15px]">
                                    <div className="w-[34px] h-[34px] flex items-center justify-center">
                                        <Image
                                            src="/images/Layout/Footer/EmailIcon.svg"
                                            width={25.6}
                                            height={19.2}
                                            alt="Email"
                                        />
                                    </div>
                                    <a href="mailto:LibrellisSupport@proton.me" className="footer-text h-[27px] flex items-center hover:opacity-70 transition-opacity">
                                        LibrellisSupport@proton.me
                                    </a>
                                </div>

                                <div className="flex items-center gap-[25px] mt-[10px] w-full">
                                    <Link href="#" className="group hover:scale-100 transition-transform">
                                        <Image src="/images/Layout/Footer/TelegramIcon.svg" width={40} height={40} alt="Telegram" className="block group-hover:hidden" />
                                        <Image src="/images/Layout/Footer/TelegramIconHover.svg" width={40} height={40} alt="Telegram" className="hidden group-hover:block" />
                                    </Link>
                                    <Link href="#" className="group hover:scale-100 transition-transform">
                                        <Image src="/images/Layout/Footer/FacebookIcon.svg" width={40} height={40} alt="Facebook" className="block group-hover:hidden" />
                                        <Image src="/images/Layout/Footer/FacebookIconHover.svg" width={40} height={40} alt="Facebook" className="hidden group-hover:block" />
                                    </Link>
                                    <Link href="#" className="group hover:scale-100 transition-transform">
                                        <Image src="/images/Layout/Footer/InstagrammIcon.svg" width={40} height={40} alt="Instagram" className="block group-hover:hidden" />
                                        <Image src="/images/Layout/Footer/InstagrammIconHover.svg" width={40} height={40} alt="Instagram" className="hidden group-hover:block" />
                                    </Link>
                                    <Link href="#" className="group hover:scale-100 transition-transform">
                                        <Image src="/images/Layout/Footer/ViberIcon.svg" width={40} height={40} alt="Viber" className="block group-hover:hidden" />
                                        <Image src="/images/Layout/Footer/ViberIconHover.svg" width={40} height={40} alt="Viber" className="hidden group-hover:block" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 w-full h-[102.66px] flex items-center px-4">
                    <div className="max-w-[1220px] mx-auto w-full h-[61.59px] border-t-2 border-footer-divider flex items-center justify-center">
                        <p className="footer-text text-brand-black tracking-[-0.011em] w-[283px] text-center">
                            {t("footer.copyright").replace("{year}", String(currentYear))}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
