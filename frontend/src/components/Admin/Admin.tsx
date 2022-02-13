import { useState, useEffect } from "react";
import { Organization, OrganizationUser, OrganizationAction } from "sardine-dashboard-typescript-definitions";
import { selectIsAdmin, selectIsSuperAdmin, useUserStore } from "store/user";
import Layout from "../Layout/Main";
import { getAdminOrganisations } from "../../utils/api";
import { captureException } from "../../utils/errorUtils";
import CredentialsModal from "./CredentialsModal";
import InvitationModal from "./InvitationModal";
import { ButtonContainer, StyledButton } from "./styles";
import OrganizationsList from "./OrganizationsList";
import CreateOrganization from "./CreateOrganization";

const Admin = () => {
  const [fetchOrg, setFetchOrg] = useState(true);
  const [organisations, setOrganisations] = useState<Organization[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [activeOrganisation, setActiveOrganisation] = useState<OrganizationAction>();
  const [showingInvitationModal, setShowingInvitationModal] = useState(false);
  const [showCreateNewModal, setShowCreateNewModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const showCredentialsModal = (org: OrganizationAction) => {
    setActiveOrganisation(org);
    setShowModal(true);
  };

  const showInvitationModal = (org: OrganizationAction) => {
    setActiveOrganisation(org);
    setShowingInvitationModal(true);
  };

  const handleInvitationModalClose = () => {
    setShowingInvitationModal(false);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleCreateNewModalClose = () => {
    setShowCreateNewModal(false);
  };

  const onUserRemoved = (user: OrganizationUser, index: number) => {
    try {
      if (organisations.length > index) {
        const orgs = [...organisations];
        const orgUsers = organisations[index].users.filter((usr) => usr.id !== user.id);
        orgs[index].users = orgUsers;
        setOrganisations(orgs);
      }
    } catch (error) {
      captureException(error);
    }
  };

  const { isAdmin, isAuthenticated, isSuperAdmin } = useUserStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    isAdmin: selectIsAdmin(state),
    isSuperAdmin: selectIsSuperAdmin(state),
  }));

  useEffect(() => {
    async function loadOrganisations() {
      setFetchOrg(false);
      setIsLoading(true);
      const orgs = await getAdminOrganisations();
      setIsLoading(false);
      const data = Array(orgs);
      if (data.length > 0) {
        setOrganisations(data[0]);
      }
    }

    if (fetchOrg) {
      loadOrganisations()
        .then()
        .catch((e) => captureException(e));
    }
  }, [fetchOrg]);

  if (!isAuthenticated || !isAdmin) {
    return <>unauthorized</>;
  }

  return (
    <Layout>
      <>
        <ButtonContainer>
          <StyledButton variant="primary" style={{ margin: "15px 0px" }} onClick={() => setShowCreateNewModal(true)}>
            Create Organization
          </StyledButton>
        </ButtonContainer>
        <OrganizationsList
          data={organisations}
          isLoading={isLoading}
          showInvitationModal={showInvitationModal}
          showCredentialsModal={showCredentialsModal}
          onUserRemoved={onUserRemoved}
        />

        {showModal && <CredentialsModal show={showModal} handleClose={handleModalClose} organisation={activeOrganisation} />}
        {showingInvitationModal && (
          <InvitationModal
            show={showingInvitationModal}
            handleClose={handleInvitationModalClose}
            organisation={activeOrganisation}
          />
        )}
        {showCreateNewModal && (
          <CreateOrganization
            show={showCreateNewModal}
            isSuperAdmin={isSuperAdmin}
            handleClose={handleCreateNewModalClose}
            handleSuccess={(data) => {
              setOrganisations([...organisations, data]);
              handleCreateNewModalClose();
            }}
          />
        )}
      </>
    </Layout>
  );
};
export default Admin;
