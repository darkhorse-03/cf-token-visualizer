export type PersonalContext = {
  mode: "personal";
  token: string;
  filter: null;
};

export type OrgContext = {
  mode: "org";
  orgId: string;
  userId: string;
  token: string;
  filter: (resourceType: string, resourceId: string) => boolean;
};

export type AppContext = PersonalContext | OrgContext;
