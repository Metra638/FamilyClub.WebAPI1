"use client"; // For using Hooks safely

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BooksNav() {
    const pathname = usePathname();
    // Calculate separate active states for each link
    const isBooksActive = pathname === '/admin/books';
    const isLanguagesActive = pathname === '/admin/books/languages';
    const isPublisherActive = pathname === '/admin/books/publishers';
    const isCategoryActive = pathname === '/admin/books/categories';
    const isAuthorActive = pathname === '/admin/books/authors';
    const isTranslatorActive = pathname === '/admin/books/translators';
    const isFormatsActive = pathname === '/admin/books/formats';
    const isBookSizesActive = pathname === '/admin/books/bookSizes';
    const isBlockReasonActive = pathname === '/admin/books/blockReasons';

    {/*
    This page works on creating a 'navigation bar' related to book entities and allows you to highlight the current entity, depending on the url address
    Дана сторінка працює над створенням 'навігаційної панелі' пов'язаної з сутностями книг і дозволяє виділяти поточну сутність, залежно від url-адреси    
  */}

    return (
        //     <div
        //         className="
        //    w-screen
        //     relative
        //     left-1/2
        //     -translate-x-1/2
        //     bg-center
        //     bg-no-repeat
        //     py-8
        //     flex
        //     justify-center
        //     items-center
        //     overflow-hidden
        // "
        //         style={{
        //             backgroundImage: "url('/images/entities/books/top_frame.svg')",
        //             backgroundSize: "100% 100%",
        //             backgroundPosition: "center",
        //             backgroundRepeat: "no-repeat",
        //         }}
        //     > 
        <div className="w-[1300px] max-w-full h-[96px] mt-[1vh] ml-[15vw] overflow-hidden flex items-center flex-row justify-center gap-2"
            style={{
                backgroundImage: "url('/images/blockedUsersPageAdmin/Rectangle 56.png')",
                backgroundSize: "100% 100%",
            }}>
            <div className="w-full -mt-2">
                <div className="flex items-center justify-center gap-2">
                    {/* Books */}
                    {/* Книги */}
                    <Link
                        href="/admin/books"
                        className={`
                    font-['Source_Sans_Pro'] font-normal text-[20px] leading-[125%] tracking-[-0.011em] align-middle no-underline                    
                    px-5 py-2.5 rounded-[9px]                    
                    hover:text-[var(--foreground-on-dark)] hover:bg-[var(--color-brand-green)]                    
                    transition-colors duration-200 ease-in-out
                    ${isBooksActive
                                ? 'text-[var(--foreground-on-dark)] bg-[var(--color-brand-green)]'
                                : 'text-[var(--foreground-primary)] bg-transparent'
                            }
                `}
                    >
                        Книги
                    </Link>


                    {/* Languages */}
                    {/* Мови */}
                    <Link
                        href="/admin/books/languages"
                        className={`
                    font-['Source_Sans_Pro'] font-normal text-[20px] leading-[125%] tracking-[-0.011em] align-middle no-underline                    
                    px-5 py-2.5 rounded-[9px]                    
                    hover:text-[var(--foreground-on-dark)] hover:bg-[var(--color-brand-green)]                    
                    transition-colors duration-200 ease-in-out
                    ${isLanguagesActive
                                ? 'text-[var(--foreground-on-dark)] bg-[var(--color-brand-green)]'
                                : 'text-[var(--foreground-primary)] bg-transparent'
                            }
                `}
                    >
                        Мови
                    </Link>

                    {/* Publishers */}
                    {/* Видавництва */}
                    <Link
                        href="/admin/books/publishers"
                        className={`
                    font-['Source_Sans_Pro'] font-normal text-[20px] leading-[125%] tracking-[-0.011em] align-middle no-underline                    
                    px-5 py-2.5 rounded-[9px]                    
                    hover:text-[var(--foreground-on-dark)] hover:bg-[var(--color-brand-green)]                    
                    transition-colors duration-200 ease-in-out
                    ${isPublisherActive
                                ? 'text-[var(--foreground-on-dark)] bg-[var(--color-brand-green)]'
                                : 'text-[var(--foreground-primary)] bg-transparent'
                            }
                `}
                    >
                        Видавництва
                    </Link>

                    {/* Categories */}
                    {/* Категорії */}
                    <Link
                        href="/admin/books/categories"
                        className={`
                    font-['Source_Sans_Pro'] font-normal text-[20px] leading-[125%] tracking-[-0.011em] align-middle no-underline                    
                    px-5 py-2.5 rounded-[9px]                    
                    hover:text-[var(--foreground-on-dark)] hover:bg-[var(--color-brand-green)]                    
                    transition-colors duration-200 ease-in-out
                    ${isCategoryActive
                                ? 'text-[var(--foreground-on-dark)] bg-[var(--color-brand-green)]'
                                : 'text-[var(--foreground-primary)] bg-transparent'
                            }
                `}
                    >
                        Категорії
                    </Link>

                    {/* Authors */}
                    {/* Автори */}
                    <Link
                        href="/admin/books/authors"
                        className={`
                    font-['Source_Sans_Pro'] font-normal text-[20px] leading-[125%] tracking-[-0.011em] align-middle no-underline                    
                    px-5 py-2.5 rounded-[9px]                    
                    hover:text-[var(--foreground-on-dark)] hover:bg-[var(--color-brand-green)]                    
                    transition-colors duration-200 ease-in-out
                    ${isAuthorActive
                                ? 'text-[var(--foreground-on-dark)] bg-[var(--color-brand-green)]'
                                : 'text-[var(--foreground-primary)] bg-transparent'
                            }
                `}
                    >
                        Автори
                    </Link>


                    {/* Translators */}
                    {/* Перекладачі */}
                    <Link
                        href="/admin/books/translators"
                        className={`
                    font-['Source_Sans_Pro'] font-normal text-[20px] leading-[125%] tracking-[-0.011em] align-middle no-underline                    
                    px-5 py-2.5 rounded-[9px]                    
                    hover:text-[var(--foreground-on-dark)] hover:bg-[var(--color-brand-green)]                    
                    transition-colors duration-200 ease-in-out
                    ${isTranslatorActive
                                ? 'text-[var(--foreground-on-dark)] bg-[var(--color-brand-green)]'
                                : 'text-[var(--foreground-primary)] bg-transparent'
                            }
                `}
                    >
                        Перекладачі
                    </Link>

                    {/* Formats */}
                    {/* Формати */}
                    <Link
                        href="/admin/books/formats"
                        className={`
                    font-['Source_Sans_Pro'] font-normal text-[20px] leading-[125%] tracking-[-0.011em] align-middle no-underline                    
                    px-5 py-2.5 rounded-[9px]                    
                    hover:text-[var(--foreground-on-dark)] hover:bg-[var(--color-brand-green)]                    
                    transition-colors duration-200 ease-in-out
                    ${isFormatsActive
                                ? 'text-[var(--foreground-on-dark)] bg-[var(--color-brand-green)]'
                                : 'text-[var(--foreground-primary)] bg-transparent'
                            }
                `}
                    >
                        Формати
                    </Link>

                    {/* Book Sizes */}
                    {/* Розміри книг */}
                    <Link
                        href="/admin/books/bookSizes"
                        className={`
                    font-['Source_Sans_Pro'] font-normal text-[20px] leading-[125%] tracking-[-0.011em] align-middle no-underline                    
                    px-5 py-2.5 rounded-[9px]                    
                    hover:text-[var(--foreground-on-dark)] hover:bg-[var(--color-brand-green)]                    
                    transition-colors duration-200 ease-in-out
                    ${isBookSizesActive
                                ? 'text-[var(--foreground-on-dark)] bg-[var(--color-brand-green)]'
                                : 'text-[var(--foreground-primary)] bg-transparent'
                            }
                `}
                    >
                        Розміри книг
                    </Link>
                    {/* Block Reasons */}
                    {/* Причини блокування */}
                    <Link
                        href="/admin/books/blockReasons"
                        className={`
                    font-['Source_Sans_Pro'] font-normal text-[20px] leading-[125%] tracking-[-0.011em] align-middle
                     no-underline                    
                    px-5 py-2.5 rounded-[9px]                    
                    hover:text-[var(--foreground-on-dark)] hover:bg-[var(--color-brand-green)]                    
                    transition-colors duration-200 ease-in-out
                    ${isBlockReasonActive
                                ? 'text-[var(--foreground-on-dark)] bg-[var(--color-brand-green)]'
                                : 'text-[var(--foreground-primary)] bg-transparent'
                            }
                `}
                    >
                        Причини блокування
                    </Link>
                </div>
            </div>
        </div>

    );
}