import { useEffect, useMemo, useState } from "react";

export function usePagination<T>(
    items: T[],
    itemsPerPage: number
) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(items.length / itemsPerPage);

    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;

        return items.slice(
            startIndex,
            startIndex + itemsPerPage
        );
    }, [items, currentPage, itemsPerPage]);


    // якщо після фільтрації сторінка стала неіснуючою
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }

        if (items.length === 0) {
            setCurrentPage(1);
        }
    }, [currentPage, totalPages, items.length]);


    const goToPage = (page: number) => {
        if (page < 1 || page > totalPages) return;

        setCurrentPage(page);
    };


    const nextPage = () => {
        goToPage(currentPage + 1);
    };


    const prevPage = () => {
        goToPage(currentPage - 1);
    };


    return {
        currentPage,
        totalPages,
        paginatedItems,
        setCurrentPage: goToPage,
        nextPage,
        prevPage,
    };
}