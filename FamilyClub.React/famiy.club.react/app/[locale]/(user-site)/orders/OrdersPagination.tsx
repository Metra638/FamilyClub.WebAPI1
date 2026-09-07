import React from "react";

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function OrdersPagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      if (startPage === 1) {
        endPage = maxPagesToShow;
      } else if (endPage === totalPages) {
        startPage = totalPages - maxPagesToShow + 1;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-6 mb-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-white/60 text-[#242424] shadow-sm disabled:opacity-50 hover:bg-white transition"
      >
        ‹
      </button>
      
      {getPages().map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition shadow-sm font-semibold text-sm ${
            currentPage === page 
              ? "bg-[#005b33] text-white" 
              : "bg-white/60 text-[#242424] hover:bg-white"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-white/60 text-[#242424] shadow-sm disabled:opacity-50 hover:bg-white transition"
      >
        ›
      </button>
    </div>
  );
}
