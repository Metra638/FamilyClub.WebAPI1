"use client";

import Link from "next/link";
import AddEditButton from "./add_edit_button"; 
import DeleteWithConfirm from "./delete_with_confirm"; 

// Імпортуємо саме з services.ts
import { productService, languageService, authorService, translatorService, categoriesService, publisherService, formatService, bookSizeService, blockReasonsService } from "@/lib/api/services"; 

type EntityType = "product" | "language" | "author" | "translator" | "category" | "publisher" | "format" | "bookSize" | "blockReason"; // Додано новий тип для BlockReason

interface ItemActionsProps {
  id: number | undefined;
  type: EntityType;
  onDeleteSuccess?: (id: number) => void;
}

export default function ItemActions({ id, type, onDeleteSuccess }: ItemActionsProps) {
  
  // 1. Карта шляхів для редагування
  const editPaths: Record<EntityType, string> = {
    product: `/products/editProduct/${id}`,
    language: `/admin/books/languages/editLanguage/${id}`,
    author: `/admin/books/authors/editAuthor/${id}`,
    translator: `/admin/books/translators/editTranslator/${id}`,
    category: `/admin/books/categories/editCategory/${id}`,
    publisher: `/admin/books/publishers/editPublisher/${id}`,
    format: `/admin/books/formats/editFormat/${id}`,
    bookSize: `/admin/books/bookSizes/editBookSize/${id}`,
    blockReason: `/admin/books/blockReasons/editBlockReasons/${id}`, // Додано шлях для BlockReason
  };

  // 2. Карта назв для повідомлень
  const entityLabels: Record<EntityType, string> = {
    product: "продукт",
    language: "мову",
    author: "автора",
    translator: "перекладача",
    category: "категорію",
    publisher: "видавництво",
    format: "формат",
    bookSize: "розмір книги",
    blockReason: "причину блокування", // Додано назву для BlockReason
  };

  // 3. Функція видалення, яка викликає відповідний готовий сервіс
  const handleDeleteApiCall = async (currentId: number) => {
    switch (type) {
      case "product":
        // Викликаємо метод із готового об'єкта productService
        await productService.apiProductsIdDelete({ id: currentId });
        break;
      case "language":
        // Викликаємо метод із готового об'єкта languageService
        await languageService.apiLanguagesIdDelete({ id: currentId });
        break;
      case "author":
        await authorService.apiAuthorsIdDelete({ id: currentId });
        break;
      case "translator":
        await translatorService.apiTranslatorsIdDelete({ id: currentId });
        break;
      case "category":
        await categoriesService.apiCategoriesIdDelete({ id: currentId });
        break;
      case "publisher":
        await publisherService.apiPublishersIdDelete({ id: currentId });
        break;
      case "format":
        await formatService.apiFormatsIdDelete({ id: currentId });
        break;
      case "bookSize":
        await bookSizeService.apiBookSizesIdDelete({ id: currentId });
        break;
      case "blockReason":
        await blockReasonsService.apiBlockReasonsIdDelete({ id: currentId });
        break;
      default:
        console.error("Невідомий тип сутності для видалення");
    }
    
    // Повідомляємо батьківський компонент про успішне видалення
    if (onDeleteSuccess) {
      onDeleteSuccess(currentId);
    }
  };

  
  return (
    <div className="flex items-center gap-[20px]">
      <Link href={editPaths[type]}>
        <AddEditButton>Редагувати</AddEditButton>
      </Link>
      
      <DeleteWithConfirm 
        id={id} 
        entityName={entityLabels[type]}
        onDelete={handleDeleteApiCall} 
      />
    </div>
  );
}