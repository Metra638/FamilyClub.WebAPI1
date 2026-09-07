"use client";

import { useState } from "react";
import DropDownAgeRestictions from "./DropDownAgeRestrictions";
import DropDownAuthors from "./DropDownAuthors";
import DropDownCatalog from "./DropDownCatalog";
import DropDownCategories from "./DropDownCategories";
import DropDownFormat from "./DropDownFormat";
import DropDownLanguage from "./DropDownLanguage";
import DropDownPrice from "./DropDownPrice";
import DropDownYearOfPublication from "./DropDownYearOfPublication";

export default function DropDownList() {
  return (
    <div className="flex flex-row justify-between gap-0">
      <DropDownCategories />
      <DropDownAuthors />
      <DropDownLanguage />
      <DropDownFormat />
      <DropDownPrice />
      <DropDownYearOfPublication />
      <DropDownAgeRestictions />
      <DropDownCatalog />
    </div>
  );
}
