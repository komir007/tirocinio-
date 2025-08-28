"use client";
import React from "react";
import CustomizableEditUser from "../../../components/CustomizableEditUser";
import CustomizationHelp from "../../../components/CustomizationHelp";

export default function CustomizableEditUserPage() {
  return (
    <>
      <CustomizableEditUser />
      <CustomizationHelp variant="form" />
    </>
  );
}
