/* eslint-disable import/no-cycle */
import React, { useState } from "react";
import { AmlKind, CustomersResponse } from "sardine-dashboard-typescript-definitions";
import { useToggle } from "hooks/useToggle";
import LoadingText from "../../../Common/LoadingText";
import { Table } from "./Table";
import { Entity } from "./types";
import { DetailsModal } from "./DetailsModal";

interface AmlSectionProps {
  amlData: AmlKind;
  customerData: CustomersResponse;
  isLoading: boolean;
}

export const AmlSection: React.FC<AmlSectionProps> = (props) => {
  const { isLoading, amlData, customerData } = props;

  const [isModalOpen, toggleModal] = useToggle(false);
  const [viewedEntity, viewEntity] = useState<Entity>();

  if (isLoading) {
    return <LoadingText />;
  }

  return (
    <>
      <Table
        customerData={customerData}
        onEntityView={(entity) => {
          viewEntity(entity);
          toggleModal();
        }}
        amlData={amlData}
      />
      {viewedEntity?.originalEntity && (
        <DetailsModal customerData={customerData} show={isModalOpen} onClose={toggleModal} entity={viewedEntity.originalEntity} />
      )}
    </>
  );
};
